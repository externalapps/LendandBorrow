const express = require('express');
const LoanService = require('../services/loanService');
const Loan = require('../models/Loan');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Create a new loan
router.post('/', auth, async (req, res) => {
  try {
    const { borrowerId, principal } = req.body;

    if (!borrowerId || !principal || principal <= 0) {
      return res.status(400).json({ error: { message: 'Invalid loan parameters' } });
    }

    // Use MongoDB directly for production-ready implementation
    const loan = await LoanService.createLoan(req.user.id, borrowerId, principal, req);
    
    res.status(201).json({
      message: 'Loan created successfully',
      loan
    });
  } catch (error) {
    console.error('Create loan error:', error);
    res.status(500).json({ error: { message: error.message || 'Failed to create loan' } });
  }
});

// Get loans for current user
router.get('/', auth, async (req, res) => {
  try {
    const { type, status } = req.query;
    const userId = req.user.id;
    

    let query = {
      $or: [{ lenderId: userId }, { borrowerId: userId }]
    };

    // Exclude LOAN_REQUEST status from main loans list - these should only show in loan requests
    query.status = { $ne: 'LOAN_REQUEST' };

    if (type === 'lent') {
      query = { lenderId: userId, status: { $ne: 'LOAN_REQUEST' } };
    } else if (type === 'borrowed') {
      query = { borrowerId: userId, status: { $ne: 'LOAN_REQUEST' } };
    }

    if (status) {
      query.status = status;
    }

    // Find loans without populate (since we're using string IDs, not ObjectIds)
    const loans = await Loan.find(query).sort({ createdAt: -1 });
    
    // Manually populate user data
    const User = require('../models/User');
    const lenderIds = [...new Set(loans.map(loan => loan.lenderId))];
    const borrowerIds = [...new Set(loans.map(loan => loan.borrowerId))];
    const allUserIds = [...new Set([...lenderIds, ...borrowerIds])];
    
    const users = await User.find({ id: { $in: allUserIds } });
    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email
      };
    });
    
    // Manually attach user data to loans
    const populatedLoans = loans.map(loan => {
      const loanObj = loan.toObject();
      loanObj.lender = userMap[loan.lenderId] || { id: loan.lenderId };
      loanObj.borrower = userMap[loan.borrowerId] || { id: loan.borrowerId };
      return loanObj;
    });

    res.json({ loans: populatedLoans });
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch loans' } });
  }
});

// Get loan requests available for lenders
router.get('/requests', auth, async (req, res) => {
  try {
    // Get pending loan requests directed to the current user (lender)
    const loanRequests = await LoanService.getPendingLoanRequests(req.user.id);
    
    // Manually populate user data
    const borrowerIds = [...new Set(loanRequests.map(request => request.borrowerId))];
    console.log('🔍 Looking for borrowers with IDs:', borrowerIds);
    
    // Use in-memory auth service to get borrower data
    const borrowers = await User.find({ id: { $in: borrowerIds } });
    console.log('👥 Found borrowers:', borrowers.map(b => ({ id: b.id, name: b.name })));
    
    const borrowerMap = {};
    borrowers.forEach(user => {
      borrowerMap[user.id] = {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        kycVerified: user.kycStatus === 'VERIFIED'
      };
    });
    
    // Attach borrower data to requests
    const populatedRequests = loanRequests.map(request => {
      const requestObj = request.toObject ? request.toObject() : request;
      requestObj.borrower = borrowerMap[request.borrowerId] || { id: request.borrowerId };
      return requestObj;
    });

    res.json({ loanRequests: populatedRequests });
  } catch (error) {
    console.error('Get loan requests error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch loan requests' } });
  }
});

// Get loan by ID
router.get('/:loanId', auth, async (req, res) => {
  try {
    // Use MongoDB directly for production-ready implementation
    const loan = await Loan.findOne({ 
      id: req.params.loanId,
      $or: [{ lenderId: req.user.id }, { borrowerId: req.user.id }]
    });

    if (!loan) {
      return res.status(404).json({ error: { message: 'Loan not found' } });
    }
    
    // Manually populate user data using MongoDB
    const lender = await User.findOne({ id: loan.lenderId });
    const borrower = await User.findOne({ id: loan.borrowerId });
    
    // Attach user data
    loan._doc.lender = lender ? {
      id: lender.id,
      name: lender.name,
      phone: lender.phone,
      email: lender.email
    } : { id: loan.lenderId };
    
    loan._doc.borrower = borrower ? {
      id: borrower.id,
      name: borrower.name,
      phone: borrower.phone,
      email: borrower.email,
      kycStatus: borrower.kycStatus,
      kycVerified: borrower.kycStatus === 'VERIFIED'
    } : { id: loan.borrowerId };

    // Calculate additional loan details
    const loanDetails = {
      ...loan.toObject(),
      outstanding: loan.outstanding,
      totalFeesPaid: loan.totalFeesPaid,
      totalPaymentsMade: loan.totalPaymentsMade,
      excuseSchedule: loan.calculateExcuseSchedule(),
      currentExcuse: loan.getCurrentExcuse(),
      isInGracePeriod: loan.isInGracePeriod()
    };

    res.json({ loan: loanDetails });
  } catch (error) {
    console.error('Get loan error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch loan' } });
  }
});

// Fund escrow
router.post('/:loanId/fund-escrow', auth, async (req, res) => {
  try {
    const loan = await LoanService.fundEscrow(req.params.loanId, req.user.id, req);
    
    res.json({
      message: 'Escrow funded successfully',
      loan
    });
  } catch (error) {
    console.error('Fund escrow error:', error);
    res.status(500).json({ error: { message: error.message || 'Failed to fund escrow' } });
  }
});

// Accept loan terms
router.post('/:loanId/accept', auth, async (req, res) => {
  try {
    const loan = await LoanService.acceptLoanTerms(req.params.loanId, req.user.id, req);
    
    res.json({
      message: 'Loan terms accepted successfully',
      loan
    });
  } catch (error) {
    console.error('Accept loan terms error:', error);
    res.status(500).json({ error: { message: error.message || 'Failed to accept loan terms' } });
  }
});

// Make payment
router.post('/:loanId/payment', auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: { message: 'Invalid payment amount' } });
    }

    // Use MongoDB directly for production-ready implementation
    const result = await LoanService.makePayment(req.params.loanId, req.user.id, amount, req);
    
    res.json({
      message: 'Payment made successfully',
      loan: result.loan,
      payments: result.payments
    });
  } catch (error) {
    console.error('Make payment error:', error);
    res.status(500).json({ error: { message: error.message || 'Failed to make payment' } });
  }
});

// Cancel loan
router.post('/:loanId/cancel', auth, async (req, res) => {
  try {
    const loan = await LoanService.cancelLoan(req.params.loanId, req.user.id, req);
    
    res.json({
      message: 'Loan cancelled successfully',
      loan
    });
  } catch (error) {
    console.error('Cancel loan error:', error);
    res.status(500).json({ error: { message: error.message || 'Failed to cancel loan' } });
  }
});

// Get pending offers for borrower
router.get('/pending/offers', auth, async (req, res) => {
  try {
    const loans = await Loan.find({
      borrowerId: req.user.id,
      status: 'PENDING_BORROWER_ACCEPT' // Only show loans that haven't been accepted yet
    }).sort({ createdAt: -1 });
    
    // Manually populate user data
    const User = require('../models/User');
    const lenderIds = [...new Set(loans.map(loan => loan.lenderId))];
    
    const lenders = await User.find({ id: { $in: lenderIds } });
    const lenderMap = {};
    lenders.forEach(user => {
      lenderMap[user.id] = {
        id: user.id,
        name: user.name,
        phone: user.phone
      };
    });
    
    // Manually attach user data to loans
    const populatedLoans = loans.map(loan => {
      const loanObj = loan.toObject();
      loanObj.lender = lenderMap[loan.lenderId] || { id: loan.lenderId };
      return loanObj;
    });

    res.json({ loans: populatedLoans });
  } catch (error) {
    console.error('Get pending offers error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch pending offers' } });
  }
});

// Get loan ledger
router.get('/:loanId/ledger', auth, async (req, res) => {
  try {
    // Use MongoDB directly for production-ready implementation
    const loan = await Loan.findOne({ 
      id: req.params.loanId,
      $or: [{ lenderId: req.user.id }, { borrowerId: req.user.id }]
    });

    if (!loan) {
      return res.status(404).json({ error: { message: 'Loan not found' } });
    }

    res.json({ ledger: loan.ledger });
  } catch (error) {
    console.error('Get ledger error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch ledger' } });
  }
});

// Get loan excuse history
router.get('/:loanId/excuses', auth, async (req, res) => {
  try {
    // Use MongoDB directly for production-ready implementation
    const loan = await Loan.findOne({ 
      id: req.params.loanId,
      $or: [{ lenderId: req.user.id }, { borrowerId: req.user.id }]
    });

    if (!loan) {
      return res.status(404).json({ error: { message: 'Loan not found' } });
    }

    const excuseSchedule = loan.calculateExcuseSchedule();
    const excuseHistory = loan.excuseHistory;

    // Merge schedule with history
    const excuses = excuseSchedule.map(excuse => {
      const history = excuseHistory.find(h => h.excuseNumber === excuse.excuseNumber);
      return {
        ...excuse,
        ...history,
        evaluated: !!history
      };
    });

    res.json({ blocks: excuses });
  } catch (error) {
    console.error('Get excuses error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch excuses' } });
  }
});

// Create a loan request
router.post('/request', auth, async (req, res) => {
  try {
    const { principal, purpose, repaymentPlan, lenderId, kycData } = req.body;
    const borrowerId = req.user.id;

    if (!principal || principal <= 0) {
      return res.status(400).json({ error: { message: 'Invalid loan amount' } });
    }

    if (!purpose || !repaymentPlan) {
      return res.status(400).json({ error: { message: 'Purpose and repayment plan are required' } });
    }

    if (!lenderId) {
      return res.status(400).json({ error: { message: 'Lender ID is required' } });
    }

    // KYC verification is checked via user.kycStatus in the database

    // Create a loan request for the specific lender
    const loanRequest = await LoanService.createLoanRequest(borrowerId, principal, purpose, repaymentPlan, lenderId, kycData, req);
    
    res.status(201).json({
      message: 'Loan request created successfully',
      loanRequest
    });
  } catch (error) {
    console.error('Create loan request error:', error);
    res.status(500).json({ error: { message: error.message || 'Failed to create loan request' } });
  }
});

// Accept a loan request (by lender) - moves to PENDING_PAYMENT status
router.post('/requests/:requestId/accept', auth, async (req, res) => {
  try {
    const lenderId = req.user.id;
    const requestId = req.params.requestId;
    const { repaymentDate } = req.body;
    
    const loan = await LoanService.acceptLoanRequest(requestId, lenderId, repaymentDate, req);
    
    res.json({
      message: 'Loan request accepted successfully. Please complete payment to fund the loan.',
      loan
    });
  } catch (error) {
    console.error('Accept loan request error:', error);
    res.status(500).json({ error: { message: error.message || 'Failed to accept loan request' } });
  }
});

// Complete payment for accepted loan request
router.post('/requests/:requestId/pay', auth, async (req, res) => {
  try {
    const lenderId = req.user.id;
    const requestId = req.params.requestId;
    const { paymentId, paymentMethod } = req.body;
    
    const loan = await LoanService.completeLoanPayment(requestId, lenderId, paymentId, paymentMethod, req);
    
    res.json({
      message: 'Payment completed successfully. Loan is now active.',
      loan
    });
  } catch (error) {
    console.error('Complete payment error:', error);
    res.status(500).json({ error: { message: error.message || 'Failed to complete payment' } });
  }
});

// Calculate payment requirements for current block
router.get('/:loanId/payment-requirements', auth, async (req, res) => {
  try {
    // Use MongoDB directly for production-ready implementation
    const loan = await Loan.findOne({ 
      id: req.params.loanId,
      $or: [{ lenderId: req.user.id }, { borrowerId: req.user.id }]
    });

    if (!loan) {
      return res.status(404).json({ error: { message: 'Loan not found' } });
    }

    // Allow payment requirements for ACTIVE loans or loans that have been funded
    if (!['ACTIVE', 'PENDING_LENDER_FUNDING'].includes(loan.status)) {
      return res.status(400).json({ error: { message: 'Loan is not ready for payments' } });
    }

    const outstanding = loan.outstanding || loan.principal || 0;
    
    // If loan is not yet active (not disbursed), return basic payment info
    if (loan.status !== 'ACTIVE' || !loan.disbursedAt) {
      return res.json({
        currentBlock: null,
        outstanding,
        blockFee: 0,
        minPayment: 1,
        totalRequired: outstanding,
        blockEndDate: null
      });
    }

    const currentExcuse = loan.getCurrentExcuse();
    if (!currentExcuse) {
      // If no current excuse, return basic payment info
      return res.json({
        currentBlock: null,
        outstanding,
        blockFee: 0,
        minPayment: 1,
        totalRequired: outstanding,
        blockEndDate: null
      });
    }

    // Check if excuse period is over (past excuse end date)
    const now = new Date();
    const isExcusePeriodOver = currentExcuse.endDate && now > currentExcuse.endDate;
    
    let excuseFee = 0;
    let minPayment = 1; // Minimum ₹1 payment allowed
    
    if (isExcusePeriodOver) {
      // Only apply excuse fees if excuse period is over
      excuseFee = Math.round(outstanding * 0.01 * 100) / 100; // 1% excuse fee
      minPayment = Math.round(outstanding * 0.20 * 100) / 100; // 20% minimum
    }
    
    const totalRequired = outstanding + excuseFee;

    res.json({
      currentBlock: {
        blockNumber: currentExcuse.excuseNumber,
        startDate: currentExcuse.startDate,
        endDate: currentExcuse.endDate
      },
      outstanding,
      blockFee: excuseFee,
      minPayment,
      totalRequired,
      blockEndDate: currentExcuse.endDate
    });
  } catch (error) {
    console.error('Get payment requirements error:', error);
    res.status(500).json({ error: { message: error.message || 'Failed to calculate payment requirements' } });
  }
});

module.exports = router;


