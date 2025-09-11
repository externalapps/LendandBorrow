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
      id: 'user_001',
      name: 'Priya Rajesh',
      phone: '+919000000001',
      email: 'priya@paysafe.com',
      password: 'demo123',
      bankMask: null,
      kycStatus: 'PENDING',
      kycData: null,
      createdAt: new Date(),
      lastLoginAt: null
    },
    {
      id: 'user_002',
      name: 'Arjun Kumar',
      phone: '+919000000002',
      email: 'arjun@paysafe.com',
      password: 'demo123',
      bankMask: null,
      kycStatus: 'PENDING',
      kycData: null,
      createdAt: new Date(),
      lastLoginAt: null
    },
    {
      id: 'user_003',
      name: 'Suresh Venkatesh',
      phone: '+919000000003',
      email: 'suresh@paysafe.com',
      password: 'demo123',
      bankMask: null,
      kycStatus: 'PENDING',
      kycData: null,
      createdAt: new Date(),
      lastLoginAt: null
    },
    {
      id: 'user_004',
      name: 'Meera Patel',
      phone: '+919000000004',
      email: 'meera@paysafe.com',
      password: 'demo123',
      bankMask: null,
      kycStatus: 'PENDING',
      kycData: null,
      createdAt: new Date(),
      lastLoginAt: null
    },
    {
      id: 'user_005',
      name: 'Rajesh Gupta',
      phone: '+919000000005',
      email: 'rajesh@paysafe.com',
      password: 'demo123',
      bankMask: null,
      kycStatus: 'PENDING',
      kycData: null,
      createdAt: new Date(),
      lastLoginAt: null
    },
    {
      id: 'user_006',
      name: 'Anita Sharma',
      phone: '+919000000006',
      email: 'anita@paysafe.com',
      password: 'demo123',
      bankMask: null,
      kycStatus: 'PENDING',
      kycData: null,
      createdAt: new Date(),
      lastLoginAt: null
    },
    {
      id: 'user_007',
      name: 'Vikram Singh',
      phone: '+919000000007',
      email: 'vikram@paysafe.com',
      password: 'demo123',
      bankMask: null,
      kycStatus: 'PENDING',
      kycData: null,
      createdAt: new Date(),
      lastLoginAt: null
    },
    {
      id: 'user_008',
      name: 'Deepika Reddy',
      phone: '+919000000008',
      email: 'deepika@paysafe.com',
      password: 'demo123',
      bankMask: null,
      kycStatus: 'PENDING',
      kycData: null,
      createdAt: new Date(),
      lastLoginAt: null
    },
    {
      id: 'user_009',
      name: 'Rohit Agarwal',
      phone: '+919000000009',
      email: 'rohit@paysafe.com',
      password: 'demo123',
      bankMask: null,
      kycStatus: 'PENDING',
      kycData: null,
      createdAt: new Date(),
      lastLoginAt: null
    },
    {
      id: 'user_010',
      name: 'Kavya Nair',
      phone: '+919000000010',
      email: 'kavya@paysafe.com',
      password: 'demo123',
      bankMask: null,
      kycStatus: 'PENDING', // Changed to PENDING to test the flow
      kycData: null,
      createdAt: new Date(),
      lastLoginAt: null
    },
    {
      id: 'user_011',
      name: 'Rahul Singh',
      phone: '+919000000011',
      email: 'rahul@paysafe.com',
      password: 'demo123',
      bankMask: null,
      kycStatus: 'PENDING', // Another user without KYC
      kycData: null,
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
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'paysafe-jwt-secret-2024-very-secure-key', { expiresIn: '7d' });
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


