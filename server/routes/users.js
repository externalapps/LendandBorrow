const express = require('express');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { auth } = require('../middleware/auth');
const mockServices = require('../services/mockServices');

const router = express.Router();

// Log audit event
const logAudit = async (userId, action, details, req) => {
  try {
    await AuditLog.create({
      id: uuidv4(),
      userId,
      action,
      details,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
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

    // Get loans where user is lender (exclude LOAN_REQUEST status)
    const loansGiven = await Loan.find({ 
      lenderId: userId, 
      status: { $ne: 'LOAN_REQUEST' } 
    });
    const totalLent = loansGiven.reduce((sum, loan) => sum + loan.principal, 0);
    const activeLoansGiven = loansGiven.filter(loan => loan.status === 'ACTIVE').length;

    // Get loans where user is borrower (include all loans except CANCELLED)
    const loansTaken = await Loan.find({ 
      borrowerId: userId, 
      status: { $ne: 'CANCELLED' } 
    });
    const totalBorrowed = loansTaken.reduce((sum, loan) => sum + loan.principal, 0);
    const activeLoansTaken = loansTaken.filter(loan => loan.status === 'ACTIVE').length;

    // Calculate outstanding amounts
    const outstandingBorrowed = loansTaken.reduce((sum, loan) => sum + loan.outstanding, 0);

    // Get overdue loans (past due date and not completed)
    const now = new Date();
    const overdueLoans = loansTaken.filter(loan => 
      loan.status === 'ACTIVE' && 
      loan.dueAt && 
      loan.dueAt < now
    );

    // Get CIBIL reports
    const cibilReports = await CibilReport.find({ borrowerId: userId });

    // Calculate upcoming checkpoints
    const upcomingCheckpoints = [];
    for (const loan of loansTaken) {
      if (loan.status === 'ACTIVE' && loan.disbursedAt) {
        const blocks = loan.calculateBlockSchedule();
        const currentBlock = loan.getCurrentBlock();
        if (currentBlock) {
          upcomingCheckpoints.push({
            loanId: loan.id,
            blockNumber: currentBlock.blockNumber,
            endDate: currentBlock.endDate,
            outstanding: loan.outstanding,
            minPayment: Math.round(loan.outstanding * 0.20 * 100) / 100
          });
        }
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

// Update user KYC data (support both PUT and POST)
router.put('/kyc', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const kycData = req.body;
    
    // Validate KYC data
    if (!kycData.pan || !kycData.aadhaar || !kycData.bankAccount || !kycData.ifsc) {
      return res.status(400).json({ 
        error: { message: 'Missing required KYC fields' } 
      });
    }
    
    // Find the user in the in-memory store
    const inMemoryAuth = require('../services/inMemoryAuth');
    const user = inMemoryAuth.findUserById(userId);
    
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
    
    // Find the user in the in-memory store
    const inMemoryAuth = require('../services/inMemoryAuth');
    const user = inMemoryAuth.findUserById(userId);
    
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




