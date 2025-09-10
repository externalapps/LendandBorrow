const express = require('express');
const MockServices = require('../services/mockServices');
const Communication = require('../models/Communication');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get communication history for a loan
router.get('/loan/:loanId', auth, async (req, res) => {
  try {
    const communications = await MockServices.getCommunicationHistory(req.params.loanId);
    
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

    const callResult = await MockServices.makeVoIPCall(
      loanId, 
      borrowerPhone, 
      borrowerName, 
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

    const smsResult = await MockServices.sendSMS(
      loanId, 
      borrowerPhone, 
      borrowerName, 
      outstanding, 
      minPayment, 
      new Date(blockEndDate)
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

    const emailResult = await MockServices.sendEmail(
      loanId, 
      borrowerEmail, 
      borrowerName, 
      outstanding, 
      minPayment, 
      new Date(blockEndDate)
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

// Generate TTS audio (mock)
router.post('/tts', auth, async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: { message: 'Transcript is required' } });
    }

    const ttsResult = await MockServices.generateTTSAudio(transcript);

    res.json({
      message: 'TTS audio generated successfully',
      audio: ttsResult
    });
  } catch (error) {
    console.error('Generate TTS error:', error);
    res.status(500).json({ error: { message: 'Failed to generate TTS audio' } });
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







