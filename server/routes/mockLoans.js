const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Mock loan data storage
let mockLoans = [];

// Create a new loan (mock)
router.post('/', auth, async (req, res) => {
  try {
    const { borrowerId, principal } = req.body;

    if (!borrowerId || !principal || principal <= 0) {
      return res.status(400).json({ error: { message: 'Invalid loan parameters' } });
    }

    // Create mock loan
    const loan = {
      id: uuidv4(),
      lenderId: req.user.id,
      borrowerId: borrowerId,
      principal: parseFloat(principal),
      outstanding: parseFloat(principal),
      status: 'PENDING_ACCEPTANCE',
      createdAt: new Date(),
      disbursedAt: null,
      dueAt: null,
      totalFeesPaid: 0,
      totalPaymentsMade: 0,
      platformFee: Math.round(principal * 0.01 * 100) / 100,
      blockLength: 10, // days
      gracePeriod: 10, // days
      blockFeeRate: 0.01, // 1%
      minPaymentRate: 0.20, // 20%
      lender: {
        id: req.user.id,
        name: req.user.name,
        phone: req.user.phone,
        email: req.user.email
      },
      borrower: {
        id: borrowerId,
        name: `Contact ${borrowerId}`, // Mock name
        phone: '+919000000000', // Mock phone
        email: `contact${borrowerId}@lendandborrow.com`
      }
    };

    mockLoans.push(loan);

    res.status(201).json({
      message: 'Loan created successfully',
      loan
    });
  } catch (error) {
    console.error('Create loan error:', error);
    res.status(500).json({ error: { message: 'Failed to create loan' } });
  }
});

// Fund escrow (mock)
router.post('/:loanId/fund-escrow', auth, async (req, res) => {
  try {
    const { loanId } = req.params;
    
    const loan = mockLoans.find(l => l.id === loanId && l.lenderId === req.user.id);
    if (!loan) {
      return res.status(404).json({ error: { message: 'Loan not found' } });
    }

    if (loan.status !== 'PENDING_ACCEPTANCE') {
      return res.status(400).json({ error: { message: 'Loan is not in pending state' } });
    }

    // Update loan status
    loan.status = 'FUNDED_ESCROW';
    loan.disbursedAt = new Date();
    loan.dueAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    res.json({
      message: 'Escrow funded successfully',
      loan
    });
  } catch (error) {
    console.error('Fund escrow error:', error);
    res.status(500).json({ error: { message: 'Failed to fund escrow' } });
  }
});

// Get loans for current user (mock)
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userLoans = mockLoans.filter(loan => 
      loan.lenderId === userId || loan.borrowerId === userId
    );

    res.json({ loans: userLoans });
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch loans' } });
  }
});

// Get loan by ID (mock)
router.get('/:loanId', auth, async (req, res) => {
  try {
    const { loanId } = req.params;
    const loan = mockLoans.find(l => 
      l.id === loanId && (l.lenderId === req.user.id || l.borrowerId === req.user.id)
    );

    if (!loan) {
      return res.status(404).json({ error: { message: 'Loan not found' } });
    }

    res.json({ loan });
  } catch (error) {
    console.error('Get loan error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch loan' } });
  }
});

module.exports = router;
