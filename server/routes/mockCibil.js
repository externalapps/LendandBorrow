const express = require('express');
const { v4: uuidv4 } = require('uuid');
const CibilReport = require('../models/CibilReport');
const MockServices = require('../services/mockServices');
const { auth, adminAuth } = require('../middleware/auth');

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

// Mock CIBIL API status
router.get('/status', auth, async (req, res) => {
  try {
    res.json({
      service: 'Mock CIBIL API',
      status: 'operational',
      version: '1.0.0',
      lastUpdated: new Date(),
      endpoints: {
        report: 'POST /api/mock-cibil/report',
        reports: 'GET /api/mock-cibil/reports',
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






