const { v4: uuidv4 } = require('uuid');
const Loan = require('../models/Loan');
const CibilReport = require('../models/CibilReport');
const Communication = require('../models/Communication');
const Settings = require('../models/Settings');
const AuditLog = require('../models/AuditLog');

// Business constants
const INITIAL_PLATFORM_FEE_RATE = 0.01;
const BLOCK_FEE_RATE = 0.01;
const BLOCK_MIN_PERCENT = 0.20;
const TERM_DAYS = 30;
const MAIN_GRACE_DAYS = 10;
const BLOCK_LENGTH_DAYS = 10;
const BLOCK_COUNT = 4;

class LoanService {
  // Create a new loan
  static async createLoan(lenderId, borrowerId, principal, req) {
    try {
      // Validate inputs
      if (!lenderId || !borrowerId || !principal || principal <= 0) {
        throw new Error('Invalid loan parameters');
      }

      if (lenderId === borrowerId) {
        throw new Error('Cannot lend to yourself');
      }

      // Calculate initial platform fee
      const initialPlatformFee = Math.round(principal * INITIAL_PLATFORM_FEE_RATE * 100) / 100;

      // Create loan
      const loan = new Loan({
        id: uuidv4(),
        lenderId,
        borrowerId,
        principal,
        initialPlatformFee,
        status: 'PENDING_BORROWER_ACCEPT',
        escrowStatus: 'PENDING'
      });

      // Add initial platform fee to ledger
      loan.ledger.push({
        id: uuidv4(),
        type: 'platform',
        amount: initialPlatformFee,
        date: new Date(),
        description: 'Initial platform fee',
        txRef: `PLATFORM_${loan.id}`
      });

      await loan.save();

      // Log audit
      await this.logAudit(lenderId, 'LOAN_CREATED', { 
        loanId: loan.id, 
        borrowerId, 
        principal, 
        platformFee: initialPlatformFee 
      }, req);

      return loan;
    } catch (error) {
      console.error('Create loan error:', error);
      throw error;
    }
  }

  // Fund escrow
  static async fundEscrow(loanId, lenderId, req) {
    try {
      const loan = await Loan.findOne({ id: loanId, lenderId });
      if (!loan) {
        throw new Error('Loan not found or unauthorized');
      }

      if (loan.escrowStatus !== 'PENDING') {
        throw new Error('Escrow already funded or released');
      }

      // Update escrow status
      loan.escrowStatus = 'FUNDED';
      await loan.save();

      // Log audit
      await this.logAudit(lenderId, 'ESCROW_FUNDED', { 
        loanId, 
        amount: loan.principal + loan.initialPlatformFee 
      }, req);

      return loan;
    } catch (error) {
      console.error('Fund escrow error:', error);
      throw error;
    }
  }

  // Accept loan terms and release funds
  static async acceptLoanTerms(loanId, borrowerId, req) {
    try {
      const loan = await Loan.findOne({ id: loanId, borrowerId });
      if (!loan) {
        throw new Error('Loan not found or unauthorized');
      }

      if (loan.escrowStatus !== 'FUNDED') {
        throw new Error('Escrow not funded');
      }

      if (loan.status !== 'PENDING_BORROWER_ACCEPT') {
        throw new Error('Loan already accepted or cancelled');
      }

      // Update loan status
      loan.status = 'ACTIVE';
      loan.escrowStatus = 'RELEASED';
      loan.disbursedAt = new Date();
      loan.dueAt = new Date(loan.disbursedAt.getTime() + (TERM_DAYS * 24 * 60 * 60 * 1000));
      loan.termsAcceptedAt = new Date();
      loan.termsAcceptedBy = borrowerId;
      loan.termsAcceptedIP = req.ip;
      loan.termsAcceptedUserAgent = req.get('User-Agent');

      await loan.save();

      // Log audit
      await this.logAudit(borrowerId, 'LOAN_ACCEPTED', { 
        loanId, 
        disbursedAt: loan.disbursedAt,
        dueAt: loan.dueAt
      }, req);

      return loan;
    } catch (error) {
      console.error('Accept loan terms error:', error);
      throw error;
    }
  }

  // Make payment
  static async makePayment(loanId, payerId, amount, req) {
    try {
      const loan = await Loan.findOne({ 
        id: loanId, 
        $or: [{ lenderId: payerId }, { borrowerId: payerId }] 
      });
      
      if (!loan) {
        throw new Error('Loan not found or unauthorized');
      }

      if (loan.status !== 'ACTIVE') {
        throw new Error('Cannot make payment on inactive loan');
      }

      if (amount <= 0) {
        throw new Error('Payment amount must be positive');
      }

      // Calculate payment allocation (fees first, then principal)
      let remainingAmount = amount;
      const payments = [];

      // First, pay any outstanding fees
      const outstandingFees = this.calculateOutstandingFees(loan);
      if (outstandingFees > 0 && remainingAmount > 0) {
        const feePayment = Math.min(remainingAmount, outstandingFees);
        payments.push({
          id: uuidv4(),
          type: 'fee',
          amount: feePayment,
          date: new Date(),
          description: 'Fee payment',
          txRef: `FEE_${loanId}_${Date.now()}`
        });
        remainingAmount -= feePayment;
      }

      // Then, pay principal
      if (remainingAmount > 0) {
        const principalPayment = Math.min(remainingAmount, loan.outstanding);
        payments.push({
          id: uuidv4(),
          type: 'principal',
          amount: principalPayment,
          date: new Date(),
          description: 'Principal payment',
          txRef: `PRINCIPAL_${loanId}_${Date.now()}`
        });
      }

      // Add payments to ledger
      loan.ledger.push(...payments);

      // Check if loan is completed
      if (loan.outstanding <= 0) {
        loan.status = 'COMPLETED';
      }

      await loan.save();

      // Log audit
      await this.logAudit(payerId, 'PAYMENT_MADE', { 
        loanId, 
        amount, 
        payments: payments.length,
        newOutstanding: loan.outstanding
      }, req);

      return { loan, payments };
    } catch (error) {
      console.error('Make payment error:', error);
      throw error;
    }
  }

  // Calculate outstanding fees
  static calculateOutstandingFees(loan) {
    const feePayments = loan.ledger
      .filter(entry => entry.type === 'fee')
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const totalFeesAccrued = loan.ledger
      .filter(entry => entry.type === 'fee')
      .reduce((sum, entry) => sum + entry.amount, 0);

    return Math.max(0, totalFeesAccrued - feePayments);
  }

  // Evaluate block and apply fees
  static async evaluateBlock(loan, blockNumber, req) {
    try {
      const blocks = loan.calculateBlockSchedule();
      const block = blocks.find(b => b.blockNumber === blockNumber);
      
      if (!block) {
        throw new Error('Invalid block number');
      }

      const now = new Date();
      if (now < block.endDate) {
        throw new Error('Block evaluation not yet due');
      }

      // Check if block already evaluated
      const existingBlock = loan.blockHistory.find(b => b.blockNumber === blockNumber);
      if (existingBlock) {
        return existingBlock;
      }

      // Calculate outstanding at start of block
      const outstandingAtStart = loan.outstanding;
      
      // Apply block fee
      const feeApplied = Math.round(outstandingAtStart * BLOCK_FEE_RATE * 100) / 100;
      const minPaymentRequired = Math.round(outstandingAtStart * BLOCK_MIN_PERCENT * 100) / 100;
      const totalRequired = minPaymentRequired + feeApplied;

      // Add fee to ledger
      loan.ledger.push({
        id: uuidv4(),
        type: 'fee',
        amount: feeApplied,
        date: new Date(),
        description: `Block ${blockNumber} fee`,
        txRef: `BLOCK_FEE_${loan.id}_${blockNumber}`
      });

      // Calculate payments made during this block
      const blockStartDate = block.startDate;
      const blockEndDate = block.endDate;
      
      const paymentsDuringBlock = loan.ledger
        .filter(entry => 
          entry.date >= blockStartDate && 
          entry.date <= blockEndDate &&
          (entry.type === 'principal' || entry.type === 'fee')
        )
        .reduce((sum, entry) => sum + entry.amount, 0);

      // Check if block is satisfied
      const satisfied = paymentsDuringBlock >= totalRequired;
      const defaulted = !satisfied;

      // Create block history entry
      const blockHistoryEntry = {
        blockNumber,
        startDate: blockStartDate,
        endDate: blockEndDate,
        outstandingAtStart,
        feeApplied,
        minPaymentRequired,
        totalRequired,
        paidDuringBlock: paymentsDuringBlock,
        satisfied,
        defaulted,
        reportedToCIBIL: false
      };

      loan.blockHistory.push(blockHistoryEntry);

      // If defaulted, report to CIBIL
      if (defaulted) {
        await this.reportToCIBIL(loan, blockNumber, req);
        blockHistoryEntry.reportedToCIBIL = true;
        loan.status = 'DEFAULT_REPORTED';
      }

      await loan.save();

      // Log audit
      await this.logAudit('system', 'BLOCK_EVALUATED', { 
        loanId: loan.id, 
        blockNumber, 
        satisfied, 
        defaulted,
        outstanding: loan.outstanding
      }, req);

      return blockHistoryEntry;
    } catch (error) {
      console.error('Evaluate block error:', error);
      throw error;
    }
  }

  // Report to CIBIL
  static async reportToCIBIL(loan, blockNumber, req) {
    try {
      const cibilReport = new CibilReport({
        id: uuidv4(),
        loanId: loan.id,
        borrowerId: loan.borrowerId,
        amountReported: loan.outstanding,
        reportedAt: new Date(),
        blockNumber,
        status: 'REPORTED',
        cibilReferenceId: `CIBIL_${loan.id}_${blockNumber}_${Date.now()}`
      });

      await cibilReport.save();

      // Log audit
      await this.logAudit('system', 'CIBIL_REPORTED', { 
        loanId: loan.id, 
        borrowerId: loan.borrowerId,
        amountReported: loan.outstanding,
        blockNumber
      }, req);

      return cibilReport;
    } catch (error) {
      console.error('CIBIL reporting error:', error);
      throw error;
    }
  }

  // Run scheduler (evaluate all active loans)
  static async runScheduler(req) {
    try {
      const activeLoans = await Loan.find({ status: 'ACTIVE' });
      const results = [];

      for (const loan of activeLoans) {
        const blocks = loan.calculateBlockSchedule();
        const now = new Date();

        for (const block of blocks) {
          // Check if block end date has passed and not yet evaluated
          if (now >= block.endDate) {
            const existingBlock = loan.blockHistory.find(b => b.blockNumber === block.blockNumber);
            if (!existingBlock) {
              const result = await this.evaluateBlock(loan, block.blockNumber, req);
              results.push({
                loanId: loan.id,
                blockNumber: block.blockNumber,
                result
              });
            }
          }
        }
      }

      // Log audit
      await this.logAudit('system', 'SCHEDULER_RUN', { 
        activeLoans: activeLoans.length,
        blocksEvaluated: results.length
      }, req);

      return results;
    } catch (error) {
      console.error('Scheduler error:', error);
      throw error;
    }
  }

  // Create a loan request
  static async createLoanRequest(borrowerId, principal, purpose, repaymentPlan, req) {
    try {
      // Validate inputs
      if (!borrowerId || !principal || principal <= 0) {
        throw new Error('Invalid loan request parameters');
      }

      if (!purpose || !repaymentPlan) {
        throw new Error('Purpose and repayment plan are required');
      }

      // Create loan request
      const loanRequest = new Loan({
        id: uuidv4(),
        borrowerId,
        principal,
        purpose,
        repaymentPlan,
        status: 'LOAN_REQUEST',
        escrowStatus: 'PENDING'
      });

      // Calculate initial platform fee
      const initialPlatformFee = Math.round(principal * INITIAL_PLATFORM_FEE_RATE * 100) / 100;
      loanRequest.initialPlatformFee = initialPlatformFee;

      await loanRequest.save();

      // Log audit
      await this.logAudit(borrowerId, 'LOAN_REQUEST_CREATED', { 
        loanId: loanRequest.id, 
        principal, 
        purpose: purpose.substring(0, 50) // Truncate for audit log
      }, req);

      return loanRequest;
    } catch (error) {
      console.error('Create loan request error:', error);
      throw error;
    }
  }

  // Get pending loan requests
  static async getPendingLoanRequests() {
    try {
      const loanRequests = await Loan.find({
        status: 'LOAN_REQUEST',
        escrowStatus: 'PENDING'
      }).sort({ createdAt: -1 });
      
      return loanRequests;
    } catch (error) {
      console.error('Get pending loan requests error:', error);
      throw error;
    }
  }

  // Accept loan request (by lender)
  static async acceptLoanRequest(loanRequestId, lenderId, req) {
    try {
      const loanRequest = await Loan.findOne({ 
        id: loanRequestId, 
        status: 'LOAN_REQUEST' 
      });
      
      if (!loanRequest) {
        throw new Error('Loan request not found');
      }

      if (lenderId === loanRequest.borrowerId) {
        throw new Error('Cannot lend to yourself');
      }

      // Update loan request to a loan
      loanRequest.lenderId = lenderId;
      loanRequest.status = 'PENDING_BORROWER_ACCEPT';
      
      await loanRequest.save();

      // Log audit
      await this.logAudit(lenderId, 'LOAN_REQUEST_ACCEPTED', { 
        loanId: loanRequest.id, 
        borrowerId: loanRequest.borrowerId,
        principal: loanRequest.principal
      }, req);

      return loanRequest;
    } catch (error) {
      console.error('Accept loan request error:', error);
      throw error;
    }
  }

  // Cancel loan (only if not funded)
  static async cancelLoan(loanId, userId, req) {
    try {
      const loan = await Loan.findOne({ 
        id: loanId, 
        $or: [{ lenderId: userId }, { borrowerId: userId }] 
      });
      
      if (!loan) {
        throw new Error('Loan not found or unauthorized');
      }

      if (loan.escrowStatus === 'RELEASED') {
        throw new Error('Cannot cancel loan after funds are released');
      }

      if (loan.status !== 'PENDING_BORROWER_ACCEPT') {
        throw new Error('Cannot cancel loan in current status');
      }

      loan.status = 'CANCELLED';
      await loan.save();

      // Log audit
      await this.logAudit(userId, 'LOAN_CANCELLED', { 
        loanId, 
        previousStatus: 'PENDING_BORROWER_ACCEPT'
      }, req);

      return loan;
    } catch (error) {
      console.error('Cancel loan error:', error);
      throw error;
    }
  }

  // Helper method to log audit events
  static async logAudit(userId, action, details, req) {
    try {
      await AuditLog.create({
        id: uuidv4(),
        userId,
        action,
        details,
        ipAddress: req?.ip,
        userAgent: req?.get('User-Agent')
      });
    } catch (error) {
      console.error('Audit log error:', error);
    }
  }
}

module.exports = LoanService;



