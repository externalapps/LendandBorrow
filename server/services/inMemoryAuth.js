// In-memory authentication service for demo purposes
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// In-memory storage
let users = [];
let auditLogs = [];

// Initialize demo users
const initializeDemoUsers = () => {
  if (users.length > 0) return; // Already initialized

  const demoUsers = [
    {
      id: 'user_a',
      name: 'Priya Rajesh',
      phone: '+919000000001',
      email: 'user_a@paysafe.com',
      password: 'demo123', // Will be hashed
      bankMask: 'DemoBank-1111',
      kycStatus: 'VERIFIED',
      kycData: {
        pan: 'ABCDE1234F',
        aadhaar: '123456789012',
        bankAccount: '12345678901111',
        ifsc: 'DEMO0001111',
        selfieUrl: '/uploads/selfie_user_a.jpg',
        verifiedAt: new Date()
      },
      createdAt: new Date(),
      lastLoginAt: null
    },
    {
      id: 'user_b',
      name: 'Arjun Kumar',
      phone: '+919000000002',
      email: 'user_b@paysafe.com',
      password: 'demo123',
      bankMask: 'DemoBank-2222',
      kycStatus: 'VERIFIED',
      kycData: {
        pan: 'FGHIJ5678K',
        aadhaar: '987654321098',
        bankAccount: '98765432102222',
        ifsc: 'DEMO0002222',
        selfieUrl: '/uploads/selfie_user_b.jpg',
        verifiedAt: new Date()
      },
      createdAt: new Date(),
      lastLoginAt: null
    },
    {
      id: 'admin',
      name: 'Suresh Venkatesh',
      phone: '+919000000000',
      email: 'admin@paysafe.com',
      password: 'admin123',
      bankMask: 'DemoBank-0000',
      kycStatus: 'VERIFIED',
      kycData: {
        pan: 'ADMIN1234A',
        aadhaar: '000000000000',
        bankAccount: '00000000000000',
        ifsc: 'ADMIN0000000',
        selfieUrl: '/uploads/selfie_admin.jpg',
        verifiedAt: new Date()
      },
      createdAt: new Date(),
      lastLoginAt: null
    }
  ];

  // Hash passwords and store users
  demoUsers.forEach(user => {
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    users.push({
      ...user,
      password: hashedPassword
    });
  });

  console.log('✅ Demo users initialized in memory');
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'demo-secret', { expiresIn: '7d' });
};

// Find user by email
const findUserByEmail = (email) => {
  return users.find(user => user.email === email);
};

// Find user by ID
const findUserById = (id) => {
  return users.find(user => user.id === id);
};

// Compare password
const comparePassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};

// Log audit event
const logAudit = (userId, action, details, req) => {
  const log = {
    id: uuidv4(),
    userId,
    action,
    details,
    ipAddress: req?.ip || '127.0.0.1',
    userAgent: req?.get('User-Agent') || 'Demo',
    timestamp: new Date(),
    severity: 'INFO'
  };
  auditLogs.push(log);
  console.log(`📝 Audit: ${action} by ${userId}`);
};

// Create new user
const createUser = (userData) => {
  const hashedPassword = bcrypt.hashSync(userData.password, 10);
  const user = {
    id: uuidv4(),
    ...userData,
    password: hashedPassword,
    kycStatus: 'PENDING',
    createdAt: new Date(),
    lastLoginAt: null
  };
  users.push(user);
  return user;
};

// Update user
const updateUser = (id, updates) => {
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updates };
    return users[userIndex];
  }
  return null;
};

// Get user without password
const getUserSafe = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

module.exports = {
  initializeDemoUsers,
  generateToken,
  findUserByEmail,
  findUserById,
  comparePassword,
  logAudit,
  createUser,
  updateUser,
  getUserSafe,
  users: () => users,
  auditLogs: () => auditLogs
};


