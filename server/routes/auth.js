const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { auth } = require('../middleware/auth');
const inMemoryAuth = require('../services/inMemoryAuth');

const router = express.Router();

// Initialize demo users
inMemoryAuth.initializeDemoUsers();

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

    // Check if user already exists
    const existingUser = inMemoryAuth.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: { message: 'User already exists with this email' } });
    }

    // Create user
    const user = inMemoryAuth.createUser({
      name,
      phone,
      email,
      password
    });

    // Generate token
    const token = inMemoryAuth.generateToken(user.id);

    // Log audit
    inMemoryAuth.logAudit(user.id, 'USER_REGISTERED', { email, phone }, req);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: inMemoryAuth.getUserSafe(user)
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

    // Find user
    const user = inMemoryAuth.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: { message: 'Invalid credentials' } });
    }

    // Check password - for demo purposes, allow demo123 or empty password
    const actualPassword = password || demoPassword;
    const isMatch = inMemoryAuth.comparePassword(actualPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: { message: 'Invalid credentials' } });
    }

    // Update last login
    inMemoryAuth.updateUser(user.id, { lastLoginAt: new Date() });

    // Generate token
    const token = inMemoryAuth.generateToken(user.id);

    // Log audit
    inMemoryAuth.logAudit(user.id, 'USER_LOGIN', { email }, req);

    res.json({
      message: 'Login successful',
      token,
      user: inMemoryAuth.getUserSafe(user)
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

