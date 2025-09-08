const express = require('express');
const { v4: uuidv4 } = require('uuid');
const LoanService = require('../services/loanService');
const MockServices = require('../services/mockServices');
const Loan = require('../models/Loan');
const User = require('../models/User');
const CibilReport = require('../models/CibilReport');
const Communication = require('../models/Communication');
const Settings = require('../models/Settings');
const AuditLog = require('../models/AuditLog');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(auth);
router.use(adminAuth);

// Get admin dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Get system statistics
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ kycStatus: 'VERIFIED' });
    const totalLoans = await Loan.countDocuments();
    const activeLoans = await Loan.countDocuments({ status: 'ACTIVE' });
    const completedLoans = await Loan.countDocuments({ status: 'COMPLETED' });
    const defaultedLoans = await Loan.countDocuments({ status: 'DEFAULT_REPORTED' });
    const totalCibilReports = await CibilReport.countDocuments();
    const totalCommunications = await Communication.countDocuments();

    // Get recent activity
    const recentLoans = await Loan.find()
      .populate('lenderId', 'id name')
      .populate('borrowerId', 'id name')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentAuditLogs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(10);

    // Get settings
    const settings = await Settings.findOne({ id: 'default' });

    res.json({
      statistics: {
        users: { total: totalUsers, verified: verifiedUsers },
        loans: { total: totalLoans, active: activeLoans, completed: completedLoans, defaulted: defaultedLoans },
        reports: { cibil: totalCibilReports, communications: totalCommunications }
      },
      recentActivity: {
        loans: recentLoans,
        auditLogs: recentAuditLogs
      },
      settings
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch admin dashboard' } });
  }
});

// Run scheduler manually
router.post('/scheduler/run', async (req, res) => {
  try {
    const results = await LoanService.runScheduler(req);
    
    res.json({
      message: 'Scheduler executed successfully',
      results: {
        blocksEvaluated: results.length,
        details: results
      }
    });
  } catch (error) {
    console.error('Manual scheduler run error:', error);
    res.status(500).json({ error: { message: 'Failed to run scheduler' } });
  }
});

// Simulate time advancement
router.post('/time/simulate', async (req, res) => {
  try {
    const { days, action } = req.body;

    if (!days || days <= 0) {
      return res.status(400).json({ error: { message: 'Invalid days parameter' } });
    }

    // For demo purposes, we'll simulate time by running the scheduler
    // In a real implementation, you might want to store a "current time" offset
    const results = await LoanService.runScheduler(req);

    // Log the time simulation
    await AuditLog.create({
      id: uuidv4(),
      userId: req.user.id,
      action: 'TIME_SIMULATED',
      details: { days, action, blocksEvaluated: results.length },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: `Time advanced by ${days} days`,
      results: {
        blocksEvaluated: results.length,
        details: results
      }
    });
  } catch (error) {
    console.error('Time simulation error:', error);
    res.status(500).json({ error: { message: 'Failed to simulate time' } });
  }
});

// Get all loans with admin details
router.get('/loans', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query = {};
    if (status) query.status = status;

    const loans = await Loan.find(query)
      .populate('lenderId', 'id name phone email')
      .populate('borrowerId', 'id name phone email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Loan.countDocuments(query);

    res.json({
      loans,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
  } catch (error) {
    console.error('Get admin loans error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch loans' } });
  }
});

// Get all users with admin details
router.get('/users', async (req, res) => {
  try {
    const { kycStatus, limit = 50, offset = 0 } = req.query;
    
    let query = {};
    if (kycStatus) query.kycStatus = kycStatus;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch users' } });
  }
});

// Update user KYC status
router.put('/users/:userId/kyc', async (req, res) => {
  try {
    const { kycStatus, notes } = req.body;

    if (!['PENDING', 'VERIFIED', 'REJECTED'].includes(kycStatus)) {
      return res.status(400).json({ error: { message: 'Invalid KYC status' } });
    }

    const user = await User.findOne({ id: req.params.userId });
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    user.kycStatus = kycStatus;
    if (kycStatus === 'VERIFIED') {
      user.kycData.verifiedAt = new Date();
    }

    await user.save();

    // Log audit
    await AuditLog.create({
      id: uuidv4(),
      userId: req.user.id,
      action: 'KYC_STATUS_UPDATED',
      details: { targetUserId: req.params.userId, newStatus: kycStatus, notes },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'User KYC status updated',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update user KYC error:', error);
    res.status(500).json({ error: { message: 'Failed to update user KYC status' } });
  }
});

// Force CIBIL report
router.post('/cibil/report', async (req, res) => {
  try {
    const { loanId, blockNumber } = req.body;

    if (!loanId || !blockNumber) {
      return res.status(400).json({ error: { message: 'Loan ID and block number are required' } });
    }

    const loan = await Loan.findOne({ id: loanId });
    if (!loan) {
      return res.status(404).json({ error: { message: 'Loan not found' } });
    }

    const cibilReport = await LoanService.reportToCIBIL(loan, blockNumber, req);

    res.json({
      message: 'CIBIL report generated successfully',
      report: cibilReport
    });
  } catch (error) {
    console.error('Force CIBIL report error:', error);
    res.status(500).json({ error: { message: 'Failed to generate CIBIL report' } });
  }
});

// Get audit logs
router.get('/audit-logs', async (req, res) => {
  try {
    const { userId, action, limit = 100, offset = 0 } = req.query;
    
    let query = {};
    if (userId) query.userId = userId;
    if (action) query.action = action;

    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await AuditLog.countDocuments(query);

    res.json({
      logs,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch audit logs' } });
  }
});

// Update system settings
router.put('/settings', async (req, res) => {
  try {
    const {
      initialFeeRate,
      blockFeeRate,
      blockMinPercent,
      termDays,
      mainGraceDays,
      blockLengthDays,
      blockCount,
      cibilReportingEnabled,
      autoReportingEnabled
    } = req.body;

    const settings = await Settings.findOne({ id: 'default' });
    if (!settings) {
      return res.status(404).json({ error: { message: 'Settings not found' } });
    }

    // Update settings
    if (initialFeeRate !== undefined) settings.initialFeeRate = initialFeeRate;
    if (blockFeeRate !== undefined) settings.blockFeeRate = blockFeeRate;
    if (blockMinPercent !== undefined) settings.blockMinPercent = blockMinPercent;
    if (termDays !== undefined) settings.termDays = termDays;
    if (mainGraceDays !== undefined) settings.mainGraceDays = mainGraceDays;
    if (blockLengthDays !== undefined) settings.blockLengthDays = blockLengthDays;
    if (blockCount !== undefined) settings.blockCount = blockCount;
    if (cibilReportingEnabled !== undefined) settings.cibilReportingEnabled = cibilReportingEnabled;
    if (autoReportingEnabled !== undefined) settings.autoReportingEnabled = autoReportingEnabled;

    settings.updatedAt = new Date();
    await settings.save();

    // Log audit
    await AuditLog.create({
      id: uuidv4(),
      userId: req.user.id,
      action: 'SETTINGS_UPDATED',
      details: req.body,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: { message: 'Failed to update settings' } });
  }
});

// Get system health
router.get('/health', async (req, res) => {
  try {
    const dbStatus = 'connected'; // You could add actual DB health check
    const mockServicesStatus = 'operational';
    
    res.json({
      status: 'healthy',
      timestamp: new Date(),
      services: {
        database: dbStatus,
        mockServices: mockServicesStatus
      },
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: { message: 'Health check failed' } });
  }
});

module.exports = router;


