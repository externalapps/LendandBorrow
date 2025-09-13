const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    // Validation
    if (!name || !phone || !email || !password) {
      return res.status(400).json({ error: { message: 'All fields are required' } });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: { message: 'Password must be at least 6 characters' } });
    }

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: { message: 'User already exists with this email' } });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in MongoDB
    const user = new User({
      id: uuidv4(),
      name,
      phone,
      email,
      password: hashedPassword,
      kycStatus: 'PENDING'
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'lendandborrow-jwt-secret-2024-very-secure-key', { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        kycStatus: user.kycStatus
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: { message: 'Registration failed' } });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({ error: { message: 'Email is required' } });
    }
    
    // For demo purposes, make password optional
    const demoPassword = 'demo123';

    // Find user in MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: { message: 'Invalid credentials' } });
    }

    // Check password - for demo purposes, allow demo123 or empty password
    const actualPassword = password || demoPassword;
    const isMatch = await bcrypt.compare(actualPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: { message: 'Invalid credentials' } });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'lendandborrow-jwt-secret-2024-very-secure-key', { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        kycStatus: user.kycStatus
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: { message: 'Login failed' } });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: { message: 'Failed to get user data' } });
  }
});

// Mock OTP verification (for demo)
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // For demo purposes, accept any 6-digit OTP
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ error: { message: 'Invalid OTP format' } });
    }

    // Mock verification - always succeeds in demo
    res.json({
      message: 'OTP verified successfully',
      verified: true
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: { message: 'OTP verification failed' } });
  }
});

// Send OTP (mock)
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: { message: 'Phone number is required' } });
    }

    // Mock OTP sending - always succeeds in demo
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log(`📱 Mock OTP sent to ${phone}: ${mockOtp}`);

    res.json({
      message: 'OTP sent successfully',
      otp: mockOtp // Only for demo - remove in production
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: { message: 'Failed to send OTP' } });
  }
});

module.exports = router;

