const express = require('express');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Loan = require('../models/Loan');
const AuditLog = require('../models/AuditLog');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Mock audit event (no MongoDB needed)
const logAudit = async (userId, action, details, req) => {
  try {
    console.log(`📝 Audit: ${action} by ${userId}`);
    // Mock audit logging - no database storage needed
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

// Get all users (for friend selection)
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find(
      { id: { $ne: req.user.id } }, // Exclude current user
      'id name phone email kycStatus'
    ).sort({ name: 1 });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch users' } });
  }
});

// Get user by ID
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findOne(
      { id: req.params.userId },
      'id name phone email kycStatus bankMask'
    );

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch user' } });
  }
});

// Update KYC data
router.put('/kyc', auth, async (req, res) => {
  try {
    const { pan, aadhaar, bankAccount, ifsc, selfieUrl } = req.body;

    // Validation
    if (!pan || !aadhaar || !bankAccount || !ifsc) {
      return res.status(400).json({ error: { message: 'All KYC fields are required' } });
    }

    // Mock KYC verification - always succeeds in demo
    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    // Update KYC data
    user.kycData = {
      pan,
      aadhaar,
      bankAccount,
      ifsc,
      selfieUrl: selfieUrl || '',
      verifiedAt: new Date()
    };
    user.kycStatus = 'VERIFIED';
    user.bankMask = `DemoBank-${bankAccount.slice(-4)}`;

    await user.save();

    // Log audit
    await logAudit(req.user.id, 'KYC_COMPLETED', { 
      pan: pan.replace(/(.{2}).*(.{2})/, '$1****$2'),
      bankAccount: bankAccount.replace(/(.{4}).*(.{4})/, '$1****$2')
    }, req);

    res.json({
      message: 'KYC completed successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('KYC update error:', error);
    res.status(500).json({ error: { message: 'KYC update failed' } });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    // Check if phone is already taken by another user
    if (phone && phone !== user.phone) {
      const existingUser = await User.findOne({ phone, id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ error: { message: 'Phone number already in use' } });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    // Log audit
    await logAudit(req.user.id, 'PROFILE_UPDATED', { name, phone }, req);

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: { message: 'Profile update failed' } });
  }
});

// Get user dashboard data
router.get('/dashboard/summary', auth, async (req, res) => {
  try {
    const Loan = require('../models/Loan');
    const CibilReport = require('../models/CibilReport');

    const userId = req.user.id;

    // Get loans from MongoDB where user is lender
    const loansGiven = await Loan.find({ lenderId: userId });
    const totalLent = loansGiven.reduce((sum, loan) => sum + loan.principal, 0);
    const activeLoansGiven = loansGiven.filter(loan => loan.status === 'ACTIVE').length;

    // Get loans from MongoDB where user is borrower
    const loansTaken = await Loan.find({ borrowerId: userId });
    const totalBorrowed = loansTaken.reduce((sum, loan) => sum + loan.principal, 0);
    const activeLoansTaken = loansTaken.filter(loan => loan.status === 'ACTIVE').length;

    // Calculate outstanding amounts
    const outstandingBorrowed = loansTaken.reduce((sum, loan) => sum + (loan.outstanding || loan.principal), 0);

    // Get overdue loans (past due date and not completed)
    const now = new Date();
    const overdueLoans = loansTaken.filter(loan => 
      loan.status === 'ACTIVE' && 
      loan.dueAt && 
      loan.dueAt < now
    );

    // Get CIBIL reports from MongoDB
    const cibilReports = await CibilReport.find({ userId: userId }).sort({ createdAt: -1 });

    // Calculate upcoming checkpoints - mock data for demo
    const upcomingCheckpoints = [];
    for (const loan of loansTaken) {
      if (loan.status === 'ACTIVE' && loan.disbursedAt) {
        // Mock upcoming checkpoint for demo
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7); // Next week
        
        upcomingCheckpoints.push({
          loanId: loan.id,
          blockNumber: 1,
          endDate: dueDate,
          outstanding: loan.principal || loan.amount || 0,
          minPayment: Math.round((loan.principal || loan.amount || 0) * 0.20 * 100) / 100
        });
      }
    }

    res.json({
      summary: {
        wallet: {
          balance: 0, // Mock wallet balance
          currency: 'INR'
        },
        loansGiven: {
          total: loansGiven.length,
          active: activeLoansGiven,
          totalAmount: totalLent
        },
        loansTaken: {
          total: loansTaken.length,
          active: activeLoansTaken,
          totalAmount: totalBorrowed,
          outstanding: outstandingBorrowed
        },
        overdue: {
          count: overdueLoans.length,
          amount: overdueLoans.reduce((sum, loan) => sum + loan.outstanding, 0)
        },
        upcomingCheckpoints,
        cibilSnapshot: {
          reports: cibilReports.length,
          lastReport: cibilReports.length > 0 ? cibilReports[cibilReports.length - 1].reportedAt : null
        }
      }
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch dashboard data' } });
  }
});

// Duplicate route removed - using the first PUT /kyc route above

// Also support POST for KYC updates (some browsers/clients have issues with PUT)
router.post('/kyc', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const kycData = req.body;
    
    // Validate KYC data
    if (!kycData.pan || !kycData.aadhaar || !kycData.bankAccount || !kycData.ifsc) {
      return res.status(400).json({ 
        error: { message: 'Missing required KYC fields' } 
      });
    }
    
    // Find the user in MongoDB
    const user = await User.findOne({ id: userId });
    
    if (!user) {
      return res.status(404).json({ 
        error: { message: 'User not found' } 
      });
    }
    
    // Update KYC data
    user.kycStatus = 'VERIFIED';
    user.kycData = {
      ...kycData,
      verifiedAt: new Date()
    };
    
    await user.save();
    
    // Check if this is for Direct Lending flow - auto-accept pending loan offers
    const { fromDirectLoan } = req.body;
    if (fromDirectLoan) {
      try {
        const loan = await Loan.findOne({ id: fromDirectLoan });
        if (loan && loan.status === 'PENDING_BORROWER_ACCEPT' && loan.borrowerId === userId) {
          // Auto-accept the loan after KYC completion
          loan.status = 'PENDING_LENDER_FUNDING';
          loan.acceptedAt = new Date();
          loan.termsAcceptedAt = new Date();
          await loan.save();
          console.log(`🚀 Loan auto-accepted after KYC: ${loan.id}`);
        }
      } catch (error) {
        console.error('Error auto-accepting loan after KYC:', error);
      }
    }
    
    // Log audit
    await logAudit(userId, 'KYC_UPDATED', { kycStatus: 'VERIFIED' }, req);
    
    res.json({
      message: 'KYC updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        kycStatus: user.kycStatus
      }
    });
  } catch (error) {
    console.error('KYC update error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to update KYC data' } 
    });
  }
});

module.exports = router;




