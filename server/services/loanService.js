const { v4: uuidv4 } = require('uuid');
const Loan = require('../models/Loan');
const CibilReport = require('../models/CibilReport');
const Communication = require('../models/Communication');
const Settings = require('../models/Settings');
const AuditLog = require('../models/AuditLog');

// Business constants
const INITIAL_PLATFORM_FEE_RATE = 0.01;
const EXCUSE_FEE_RATE = 0.01;
const EXCUSE_MIN_PERCENT = 0.20;
const TERM_DAYS = 30;
const MAIN_GRACE_DAYS = 10;
const EXCUSE_LENGTH_DAYS = 10;
const EXCUSE_COUNT = 4;

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
      
      // Note: KYC check removed from loan creation - borrower will do KYC after accepting loan offer

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

      // Check if borrower has completed KYC before funding
      const User = require('../models/User');
      const borrower = await User.findOne({ id: loan.borrowerId });
      if (!borrower || borrower.kycStatus !== 'VERIFIED') {
        throw new Error('Cannot fund loan: Borrower has not completed KYC verification yet');
      }

      // Update escrow status and loan status
      loan.escrowStatus = 'FUNDED';
      
      // If borrower has already accepted terms, make the loan active
      if (loan.status === 'PENDING_LENDER_FUNDING') {
        loan.status = 'ACTIVE';
        loan.disbursedAt = new Date();
        loan.dueAt = new Date(loan.disbursedAt.getTime() + (TERM_DAYS * 24 * 60 * 60 * 1000));
      }
      
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

  // Accept loan terms (borrower accepts the loan offer)
  static async acceptLoanTerms(loanId, borrowerId, req) {
    try {
      const loan = await Loan.findOne({ id: loanId, borrowerId });
      if (!loan) {
        throw new Error('Loan not found or unauthorized');
      }

      if (loan.status !== 'PENDING_BORROWER_ACCEPT') {
        throw new Error('Loan already accepted or cancelled');
      }

      // Check if borrower has completed KYC
      const User = require('../models/User');
      const borrower = await User.findOne({ id: borrowerId });
      if (!borrower || borrower.kycStatus !== 'VERIFIED') {
        throw new Error('You must complete KYC verification before accepting a loan offer');
      }

      // For direct lending: borrower accepts terms, but loan isn't active until lender funds it
      // Update loan status to show borrower has accepted
      loan.status = 'PENDING_LENDER_FUNDING'; // New status to indicate borrower accepted, waiting for lender to fund
      loan.termsAcceptedAt = new Date();
      loan.termsAcceptedBy = borrowerId;
      loan.termsAcceptedIP = req.ip;
      loan.termsAcceptedUserAgent = req.get('User-Agent');
      
      // The escrowStatus remains 'PENDING' until lender funds
      
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

  // Evaluate excuse and apply fees
  static async evaluateExcuse(loan, excuseNumber, req) {
    try {
      const excuses = loan.calculateExcuseSchedule();
      const excuse = excuses.find(e => e.excuseNumber === excuseNumber);
      
      if (!excuse) {
        throw new Error('Invalid excuse number');
      }

      const now = new Date();
      if (now < excuse.endDate) {
        throw new Error('Excuse evaluation not yet due');
      }

      // Check if excuse already evaluated
      const existingExcuse = loan.excuseHistory.find(e => e.excuseNumber === excuseNumber);
      if (existingExcuse) {
        return existingExcuse;
      }

      // Calculate outstanding at start of excuse
      const outstandingAtStart = loan.outstanding;
      
      // Apply excuse fee
      const feeApplied = Math.round(outstandingAtStart * EXCUSE_FEE_RATE * 100) / 100;
      const minPaymentRequired = Math.round(outstandingAtStart * EXCUSE_MIN_PERCENT * 100) / 100;
      const totalRequired = minPaymentRequired + feeApplied;

      // Add fee to ledger
      loan.ledger.push({
        id: uuidv4(),
        type: 'fee',
        amount: feeApplied,
        date: new Date(),
        description: `Excuse ${excuseNumber} fee`,
        txRef: `EXCUSE_FEE_${loan.id}_${excuseNumber}`
      });

      // Calculate payments made during this excuse
      const excuseStartDate = excuse.startDate;
      const excuseEndDate = excuse.endDate;
      
      const paymentsDuringExcuse = loan.ledger
        .filter(entry => 
          entry.date >= excuseStartDate && 
          entry.date <= excuseEndDate &&
          (entry.type === 'principal' || entry.type === 'fee')
        )
        .reduce((sum, entry) => sum + entry.amount, 0);

      // Check if excuse is satisfied
      const satisfied = paymentsDuringExcuse >= totalRequired;
      const defaulted = !satisfied;

      // Create excuse history entry
      const excuseHistoryEntry = {
        excuseNumber,
        startDate: excuseStartDate,
        endDate: excuseEndDate,
        outstandingAtStart,
        feeApplied,
        minPaymentRequired,
        totalRequired,
        paidDuringExcuse: paymentsDuringExcuse,
        satisfied,
        defaulted,
        reportedToCIBIL: false
      };

      loan.excuseHistory.push(excuseHistoryEntry);

      // If defaulted, report to CIBIL
      if (defaulted) {
        await this.reportToCIBIL(loan, excuseNumber, req);
        excuseHistoryEntry.reportedToCIBIL = true;
        loan.status = 'DEFAULT_REPORTED';
      }

      await loan.save();

      // Log audit
      await this.logAudit('system', 'EXCUSE_EVALUATED', { 
        loanId: loan.id, 
        excuseNumber, 
        satisfied, 
        defaulted,
        outstanding: loan.outstanding
      }, req);

      return excuseHistoryEntry;
    } catch (error) {
      console.error('Evaluate excuse error:', error);
      throw error;
    }
  }

  // Report to CIBIL
  static async reportToCIBIL(loan, excuseNumber, req) {
    try {
      const cibilReport = new CibilReport({
        id: uuidv4(),
        loanId: loan.id,
        borrowerId: loan.borrowerId,
        amountReported: loan.outstanding,
        reportedAt: new Date(),
        excuseNumber,
        status: 'REPORTED',
        cibilReferenceId: `CIBIL_${loan.id}_${excuseNumber}_${Date.now()}`
      });

      await cibilReport.save();

      // Log audit
      await this.logAudit('system', 'CIBIL_REPORTED', { 
        loanId: loan.id, 
        borrowerId: loan.borrowerId,
        amountReported: loan.outstanding,
        excuseNumber
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
        const excuses = loan.calculateExcuseSchedule();
        const now = new Date();

        for (const excuse of excuses) {
          // Check if excuse end date has passed and not yet evaluated
          if (now >= excuse.endDate) {
            const existingExcuse = loan.excuseHistory.find(e => e.excuseNumber === excuse.excuseNumber);
            if (!existingExcuse) {
              const result = await this.evaluateExcuse(loan, excuse.excuseNumber, req);
              results.push({
                loanId: loan.id,
                excuseNumber: excuse.excuseNumber,
                result
              });
            }
          }
        }
      }

      // Log audit
      await this.logAudit('system', 'SCHEDULER_RUN', { 
        activeLoans: activeLoans.length,
        excusesEvaluated: results.length
      }, req);

      return results;
    } catch (error) {
      console.error('Scheduler error:', error);
      throw error;
    }
  }

  // Create a loan request
  static async createLoanRequest(borrowerId, principal, purpose, repaymentPlan, lenderId, kycData, req) {
    try {
      // Validate inputs
      if (!borrowerId || !principal || principal <= 0) {
        throw new Error('Invalid loan request parameters');
      }

      if (!purpose || !repaymentPlan) {
        throw new Error('Purpose and repayment plan are required');
      }

      if (!lenderId) {
        throw new Error('Lender ID is required');
      }

      // KYC verification is handled per-loan, not per-user
      // The kycData parameter indicates if KYC was completed for this specific loan request

      // Create loan request for specific lender
      const loanRequest = new Loan({
        id: uuidv4(),
        borrowerId,
        lenderId,
        principal,
        purpose,
        repaymentPlan,
        kycVerified: kycData ? true : false,
        kycData,
        status: 'LOAN_REQUEST',
        escrowStatus: 'PENDING',
        ledger: [] // Initialize empty ledger
      });

      // Calculate initial platform fee
      const initialPlatformFee = Math.round(principal * INITIAL_PLATFORM_FEE_RATE * 100) / 100;
      loanRequest.initialPlatformFee = initialPlatformFee;

      await loanRequest.save();

      console.log(`📝 Created loan request: ${loanRequest.id} from ${borrowerId} to ${lenderId} for ₹${principal}`);

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
  static async getPendingLoanRequests(lenderId) {
    try {
      const query = {
        status: { $in: ['LOAN_REQUEST', 'PENDING_PAYMENT'] },
        escrowStatus: 'PENDING'
      };
      
      // Filter by specific lender - loan requests are only visible to the intended lender
      if (lenderId) {
        query.lenderId = lenderId;
      }
      
      const loanRequests = await Loan.find(query).sort({ createdAt: -1 });
      
      console.log(`📋 Found ${loanRequests.length} pending loan requests for lender ${lenderId || 'all'}`);
      console.log(`🔍 Query used:`, JSON.stringify(query, null, 2));
      
      // Debug: Check all loans for this lender
      const allLoans = await Loan.find({ lenderId }).sort({ createdAt: -1 });
      console.log(`🔍 All loans for lender ${lenderId}:`, allLoans.map(loan => ({
        id: loan.id,
        status: loan.status,
        escrowStatus: loan.escrowStatus,
        borrowerId: loan.borrowerId,
        lenderId: loan.lenderId
      })));
      
      loanRequests.forEach(req => {
        console.log(`  - Request ${req.id}: ${req.principal} from ${req.borrowerId} to ${req.lenderId}`);
      });
      
      return loanRequests;
    } catch (error) {
      console.error('Get pending loan requests error:', error);
      throw error;
    }
  }

  // Accept loan request (by lender)
  static async acceptLoanRequest(loanRequestId, lenderId, repaymentDate, req) {
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

      // Update loan request to pending payment status
      loanRequest.lenderId = lenderId;
      loanRequest.status = 'PENDING_PAYMENT';
      
      // Set the repayment date if provided
      if (repaymentDate) {
        loanRequest.dueAt = new Date(repaymentDate);
      }
      
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

  // Complete payment for accepted loan request
  static async completeLoanPayment(loanRequestId, lenderId, paymentId, paymentMethod, req) {
    try {
      const loanRequest = await Loan.findOne({ 
        id: loanRequestId, 
        status: 'PENDING_PAYMENT',
        lenderId: lenderId
      });
      
      if (!loanRequest) {
        throw new Error('Loan request not found or not in pending payment status');
      }

      // Update loan to active status and fund escrow directly
      loanRequest.status = 'ACTIVE';
      loanRequest.escrowStatus = 'RELEASED';
      loanRequest.disbursedAt = new Date();
      // Keep the dueAt date that was set by the lender when accepting the request
      // Only set default dueAt if none was set
      if (!loanRequest.dueAt) {
        loanRequest.dueAt = new Date(loanRequest.disbursedAt.getTime() + (TERM_DAYS * 24 * 60 * 60 * 1000));
      }
      
      // Add funding record to ledger (not a principal payment)
      loanRequest.ledger.push({
        id: uuidv4(),
        date: new Date(),
        type: 'funding',
        amount: loanRequest.principal,
        description: `Loan funded via ${paymentMethod}`,
        paymentId: paymentId
      });

      await loanRequest.save();

      // Log audit
      await this.logAudit(lenderId, 'LOAN_PAYMENT_COMPLETED', { 
        loanId: loanRequestId, 
        amount: loanRequest.principal,
        paymentId: paymentId,
        paymentMethod: paymentMethod
      }, req);

      return loanRequest;
    } catch (error) {
      console.error('Complete loan payment error:', error);
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








