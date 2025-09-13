const express = require('express');
const { v4: uuidv4 } = require('uuid');
const CibilReport = require('../models/CibilReport');
const { getCibilService } = require('../config/services');
const { auth, adminAuth } = require('../middleware/auth');

// Get the active CIBIL service (mock or real)
const cibilService = getCibilService();

const router = express.Router();

// Report to CIBIL (mock)
router.post('/report', auth, async (req, res) => {
  try {
    const { loanId, borrowerId, amountReported, blockNumber } = req.body;

    if (!loanId || !borrowerId || !amountReported || !blockNumber) {
      return res.status(400).json({ error: { message: 'Missing required fields' } });
    }

    // Call mock CIBIL service
    const cibilResponse = await MockServices.reportToCIBIL(loanId, borrowerId, amountReported, blockNumber);

    // Save to database
    const cibilReport = new CibilReport({
      id: uuidv4(),
      loanId,
      borrowerId,
      amountReported,
      reportedAt: new Date(),
      blockNumber,
      status: 'REPORTED',
      cibilReferenceId: cibilResponse.referenceId
    });

    await cibilReport.save();

    res.json({
      message: 'Successfully reported to CIBIL',
      report: cibilReport,
      cibilResponse
    });
  } catch (error) {
    console.error('CIBIL reporting error:', error);
    res.status(500).json({ error: { message: 'Failed to report to CIBIL' } });
  }
});

// Get CIBIL reports
router.get('/reports', auth, async (req, res) => {
  try {
    const { borrowerId, loanId } = req.query;
    
    let query = {};
    if (borrowerId) query.borrowerId = borrowerId;
    if (loanId) query.loanId = loanId;

    const reports = await CibilReport.find(query)
      .populate('borrowerId', 'id name phone')
      .populate('loanId', 'id principal')
      .sort({ reportedAt: -1 });

    res.json({ reports });
  } catch (error) {
    console.error('Get CIBIL reports error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch CIBIL reports' } });
  }
});

// Get CIBIL report by ID
router.get('/reports/:reportId', auth, async (req, res) => {
  try {
    const report = await CibilReport.findOne({ id: req.params.reportId })
      .populate('borrowerId', 'id name phone email')
      .populate('loanId', 'id principal lenderId borrowerId');

    if (!report) {
      return res.status(404).json({ error: { message: 'CIBIL report not found' } });
    }

    res.json({ report });
  } catch (error) {
    console.error('Get CIBIL report error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch CIBIL report' } });
  }
});

// Update CIBIL report status (admin only)
router.put('/reports/:reportId/status', auth, adminAuth, async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!['PENDING', 'REPORTED', 'RESOLVED'].includes(status)) {
      return res.status(400).json({ error: { message: 'Invalid status' } });
    }

    const report = await CibilReport.findOne({ id: req.params.reportId });
    if (!report) {
      return res.status(404).json({ error: { message: 'CIBIL report not found' } });
    }

    report.status = status;
    if (notes) report.notes = notes;
    if (status === 'RESOLVED') report.resolutionDate = new Date();

    await report.save();

    res.json({
      message: 'CIBIL report status updated',
      report
    });
  } catch (error) {
    console.error('Update CIBIL report error:', error);
    res.status(500).json({ error: { message: 'Failed to update CIBIL report' } });
  }
});

// Export CIBIL reports as CSV
router.get('/reports/export/csv', auth, adminAuth, async (req, res) => {
  try {
    const reports = await CibilReport.find()
      .populate('borrowerId', 'id name phone')
      .populate('loanId', 'id principal')
      .sort({ reportedAt: -1 });

    // Generate CSV content
    const csvHeader = 'Report ID,Loan ID,Borrower Name,Borrower Phone,Amount Reported,Block Number,Reported At,Status,CIBIL Reference ID\n';
    const csvRows = reports.map(report => 
      `${report.id},${report.loanId?.id || 'N/A'},${report.borrowerId?.name || 'N/A'},${report.borrowerId?.phone || 'N/A'},${report.amountReported},${report.blockNumber},${report.reportedAt.toISOString()},${report.status},${report.cibilReferenceId || 'N/A'}`
    ).join('\n');

    const csvContent = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="cibil-reports.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('Export CIBIL reports error:', error);
    res.status(500).json({ error: { message: 'Failed to export CIBIL reports' } });
  }
});

// Generate CIBIL report for user
router.post('/generate-report', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const targetUserId = userId || req.user.id;

    // Get user data (you might need to fetch from User model)
    const User = require('../models/User');
    const user = await User.findOne({ id: targetUserId });
    
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    // Get user's loan history
    const Loan = require('../models/Loan');
    const loanHistory = await Loan.find({ 
      $or: [{ lenderId: targetUserId }, { borrowerId: targetUserId }] 
    });

    // Generate CIBIL report
    const report = await cibilService.generateCibilReport(targetUserId, user, loanHistory);

    res.json({
      message: 'CIBIL report generated successfully',
      report
    });
  } catch (error) {
    console.error('Generate CIBIL report error:', error);
    res.status(500).json({ error: { message: 'Failed to generate CIBIL report' } });
  }
});

// Get CIBIL report for user
router.get('/report/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const report = await cibilService.getCibilReport(userId);

    if (!report) {
      return res.status(404).json({ error: { message: 'CIBIL report not found' } });
    }

    res.json({ report });
  } catch (error) {
    console.error('Get CIBIL report error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch CIBIL report' } });
  }
});

// Get CIBIL score history for user
router.get('/score-history/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await cibilService.getScoreHistory(userId);

    res.json({ history });
  } catch (error) {
    console.error('Get CIBIL score history error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch CIBIL score history' } });
  }
});

// Update CIBIL score based on activity
router.post('/update-score', auth, async (req, res) => {
  try {
    const { userId, activity } = req.body;

    if (!userId || !activity) {
      return res.status(400).json({ error: { message: 'User ID and activity are required' } });
    }

    const updatedReport = await cibilService.updateScore(userId, activity);

    if (!updatedReport) {
      return res.status(404).json({ error: { message: 'CIBIL report not found for user' } });
    }

    res.json({
      message: 'CIBIL score updated successfully',
      report: updatedReport
    });
  } catch (error) {
    console.error('Update CIBIL score error:', error);
    res.status(500).json({ error: { message: 'Failed to update CIBIL score' } });
  }
});

// Get CIBIL service statistics
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const stats = await cibilService.getServiceStats();

    res.json({ stats });
  } catch (error) {
    console.error('Get CIBIL stats error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch CIBIL statistics' } });
  }
});

// Mock CIBIL API status
router.get('/status', auth, async (req, res) => {
  try {
    res.json({
      service: 'Mock CIBIL API',
      status: 'operational',
      version: '2.0.0',
      lastUpdated: new Date(),
      endpoints: {
        report: 'POST /api/mock-cibil/report',
        reports: 'GET /api/mock-cibil/reports',
        generateReport: 'POST /api/mock-cibil/generate-report',
        getReport: 'GET /api/mock-cibil/report/:userId',
        scoreHistory: 'GET /api/mock-cibil/score-history/:userId',
        updateScore: 'POST /api/mock-cibil/update-score',
        stats: 'GET /api/mock-cibil/stats',
        export: 'GET /api/mock-cibil/reports/export/csv'
      },
      note: 'This is a mock service for demo purposes. In production, this would integrate with real CIBIL APIs.'
    });
  } catch (error) {
    console.error('CIBIL status error:', error);
    res.status(500).json({ error: { message: 'Failed to get CIBIL status' } });
  }
});

module.exports = router;







