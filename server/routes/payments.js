const express = require('express');
const { v4: uuidv4 } = require('uuid');
const MockServices = require('../services/mockServices');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Process Razorpay payment (mock)
router.post('/razorpay', auth, async (req, res) => {
  try {
    const { amount, currency = 'INR', description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: { message: 'Invalid payment amount' } });
    }

    // Process payment through mock Razorpay service
    const paymentResult = await MockServices.processRazorpayPayment(amount, currency);

    res.json({
      message: 'Payment processed successfully',
      payment: paymentResult
    });
  } catch (error) {
    console.error('Razorpay payment error:', error);
    res.status(500).json({ error: { message: 'Payment processing failed' } });
  }
});

// Create Razorpay order (mock)
router.post('/razorpay/order', auth, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: { message: 'Invalid order amount' } });
    }

    // Mock Razorpay order creation
    const order = {
      id: `order_${uuidv4().replace(/-/g, '')}`,
      amount: amount * 100, // Convert to paisa
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      status: 'created',
      created_at: new Date(),
      notes: {
        description: 'PaySafe Escrow Payment'
      }
    };

    res.json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({ error: { message: 'Failed to create order' } });
  }
});

// Verify Razorpay payment (mock)
router.post('/razorpay/verify', auth, async (req, res) => {
  try {
    const { paymentId, orderId, signature } = req.body;

    if (!paymentId || !orderId) {
      return res.status(400).json({ error: { message: 'Payment ID and Order ID are required' } });
    }

    // Mock verification - always succeeds in demo
    const verification = {
      success: true,
      paymentId,
      orderId,
      signature: signature || `mock_signature_${Date.now()}`,
      verified: true,
      verifiedAt: new Date()
    };

    res.json({
      message: 'Payment verified successfully',
      verification
    });
  } catch (error) {
    console.error('Verify Razorpay payment error:', error);
    res.status(500).json({ error: { message: 'Payment verification failed' } });
  }
});

// Get payment methods
router.get('/methods', auth, async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'netbanking',
        name: 'Net Banking',
        description: 'Pay using your bank account',
        enabled: true,
        icon: '🏦'
      },
      {
        id: 'upi',
        name: 'UPI',
        description: 'Pay using UPI ID or QR code',
        enabled: true,
        icon: '📱'
      },
      {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Pay using your card',
        enabled: true,
        icon: '💳'
      },
      {
        id: 'wallet',
        name: 'Digital Wallet',
        description: 'Pay using digital wallet',
        enabled: false,
        icon: '👛'
      }
    ];

    res.json({ paymentMethods });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch payment methods' } });
  }
});

module.exports = router;







