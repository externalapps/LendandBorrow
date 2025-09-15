const express = require('express');
const { getCommunicationService } = require('../config/services');
const Communication = require('../models/Communication');
const { auth } = require('../middleware/auth');

// Get the active communication service (mock or real)
const communicationService = getCommunicationService();

const router = express.Router();

// Get communication history for a loan
router.get('/loan/:loanId', auth, async (req, res) => {
  try {
    const communications = await communicationService.getCommunicationHistory(req.params.loanId);
    
    res.json({ communications });
  } catch (error) {
    console.error('Get communication history error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch communication history' } });
  }
});

// Send VoIP call (mock)
router.post('/call', auth, async (req, res) => {
  try {
    const { loanId, borrowerPhone, borrowerName, outstanding, minPayment, blockEndDate } = req.body;

    if (!loanId || !borrowerPhone || !borrowerName || !outstanding || !minPayment || !blockEndDate) {
      return res.status(400).json({ error: { message: 'Missing required fields' } });
    }

    const callResult = await communicationService.makeVoIPCall(
      borrowerPhone, 
      borrowerName, 
      loanId, 
      outstanding, 
      minPayment, 
      new Date(blockEndDate)
    );

    res.json({
      message: 'VoIP call initiated successfully',
      call: callResult
    });
  } catch (error) {
    console.error('Send VoIP call error:', error);
    res.status(500).json({ error: { message: 'Failed to send VoIP call' } });
  }
});

// Send SMS (mock)
router.post('/sms', auth, async (req, res) => {
  try {
    const { loanId, borrowerPhone, borrowerName, outstanding, minPayment, blockEndDate } = req.body;

    if (!loanId || !borrowerPhone || !borrowerName || !outstanding || !minPayment || !blockEndDate) {
      return res.status(400).json({ error: { message: 'Missing required fields' } });
    }

    const smsResult = await communicationService.sendSMS(
      borrowerPhone, 
      `Payment reminder for loan #${loanId}. Outstanding: ₹${outstanding}. Please pay ₹${minPayment} by ${new Date(blockEndDate).toLocaleDateString()}.`,
      loanId
    );

    res.json({
      message: 'SMS sent successfully',
      sms: smsResult
    });
  } catch (error) {
    console.error('Send SMS error:', error);
    res.status(500).json({ error: { message: 'Failed to send SMS' } });
  }
});

// Send email (mock)
router.post('/email', auth, async (req, res) => {
  try {
    const { loanId, borrowerEmail, borrowerName, outstanding, minPayment, blockEndDate } = req.body;

    if (!loanId || !borrowerEmail || !borrowerName || !outstanding || !minPayment || !blockEndDate) {
      return res.status(400).json({ error: { message: 'Missing required fields' } });
    }

    const emailResult = await communicationService.sendEmail(
      borrowerEmail, 
      `Payment Reminder - Loan #${loanId}`,
      `Dear ${borrowerName},\n\nThis is a reminder that you have an outstanding payment of ₹${outstanding} for loan #${loanId}.\n\nMinimum payment required: ₹${minPayment}\nDue date: ${new Date(blockEndDate).toLocaleDateString()}\n\nPlease make your payment to avoid any penalties.\n\nBest regards,\nLend & Borrow Team`,
      loanId
    );

    res.json({
      message: 'Email sent successfully',
      email: emailResult
    });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ error: { message: 'Failed to send email' } });
  }
});

// Send overdue payment reminder
router.post('/overdue-reminder', auth, async (req, res) => {
  try {
    const { borrower, loan } = req.body;

    if (!borrower || !loan) {
      return res.status(400).json({ error: { message: 'Borrower and loan data are required' } });
    }

    const result = await communicationService.sendOverdueReminder(borrower, loan);

    res.json({
      message: 'Overdue reminder sent successfully',
      result
    });
  } catch (error) {
    console.error('Send overdue reminder error:', error);
    res.status(500).json({ error: { message: 'Failed to send overdue reminder' } });
  }
});

// Send payment confirmation
router.post('/payment-confirmation', auth, async (req, res) => {
  try {
    const { borrower, loan, paymentAmount } = req.body;

    if (!borrower || !loan || !paymentAmount) {
      return res.status(400).json({ error: { message: 'Borrower, loan, and payment amount are required' } });
    }

    const result = await communicationService.sendPaymentConfirmation(borrower, loan, paymentAmount);

    res.json({
      message: 'Payment confirmation sent successfully',
      result
    });
  } catch (error) {
    console.error('Send payment confirmation error:', error);
    res.status(500).json({ error: { message: 'Failed to send payment confirmation' } });
  }
});

// Send loan disbursement notification
router.post('/disbursement-notification', auth, async (req, res) => {
  try {
    const { borrower, loan } = req.body;

    if (!borrower || !loan) {
      return res.status(400).json({ error: { message: 'Borrower and loan data are required' } });
    }

    const result = await communicationService.sendDisbursementNotification(borrower, loan);

    res.json({
      message: 'Disbursement notification sent successfully',
      result
    });
  } catch (error) {
    console.error('Send disbursement notification error:', error);
    res.status(500).json({ error: { message: 'Failed to send disbursement notification' } });
  }
});

// Get communication service statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await communicationService.getServiceStats();

    res.json({ stats });
  } catch (error) {
    console.error('Get communication stats error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch communication statistics' } });
  }
});

// Get all communications (admin)
router.get('/', auth, async (req, res) => {
  try {
    const { type, status, limit = 50 } = req.query;
    
    let query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const communications = await Communication.find(query)
      .sort({ sentAt: -1 })
      .limit(parseInt(limit));

    res.json({ communications });
  } catch (error) {
    console.error('Get communications error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch communications' } });
  }
});

// Get communication by ID
router.get('/:communicationId', auth, async (req, res) => {
  try {
    const communication = await Communication.findOne({ id: req.params.communicationId });

    if (!communication) {
      return res.status(404).json({ error: { message: 'Communication not found' } });
    }

    res.json({ communication });
  } catch (error) {
    console.error('Get communication error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch communication' } });
  }
});

// Update communication status
router.put('/:communicationId/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['PENDING', 'SENT', 'DELIVERED', 'FAILED'].includes(status)) {
      return res.status(400).json({ error: { message: 'Invalid status' } });
    }

    const communication = await Communication.findOne({ id: req.params.communicationId });
    if (!communication) {
      return res.status(404).json({ error: { message: 'Communication not found' } });
    }

    communication.status = status;
    await communication.save();

    res.json({
      message: 'Communication status updated',
      communication
    });
  } catch (error) {
    console.error('Update communication status error:', error);
    res.status(500).json({ error: { message: 'Failed to update communication status' } });
  }
});

module.exports = router;















