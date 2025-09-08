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
      bankMask: 'HDFC-1111',
      kycStatus: 'VERIFIED',
      kycData: {
        pan: 'ABCDE1234F',
        aadhaar: '123456789012',
        bankAccount: '12345678901111',
        ifsc: 'HDFC0001111',
        selfieUrl: '/uploads/selfie_priya.jpg',
        verifiedAt: new Date()
      },
      createdAt: new Date(),
      lastLoginAt: null
    },
    {
      id: 'user_002',
      name: 'Arjun Kumar',
      phone: '+919000000002',
      email: 'arjun@paysafe.com',
      password: 'demo123',
      bankMask: 'ICICI-2222',
      kycStatus: 'VERIFIED',
      kycData: {
        pan: 'FGHIJ5678K',
        aadhaar: '987654321098',
        bankAccount: '98765432102222',
        ifsc: 'ICIC0002222',
        selfieUrl: '/uploads/selfie_arjun.jpg',
        verifiedAt: new Date()
      },
      createdAt: new Date(),
      lastLoginAt: null
    },
    {
      id: 'user_003',
      name: 'Suresh Venkatesh',
      phone: '+919000000003',
      email: 'suresh@paysafe.com',
      password: 'demo123',
      bankMask: 'SBI-3333',
      kycStatus: 'VERIFIED',
      kycData: {
        pan: 'KLMNO9012P',
        aadhaar: '111111111111',
        bankAccount: '11111111113333',
        ifsc: 'SBIN0003333',
        selfieUrl: '/uploads/selfie_suresh.jpg',
        verifiedAt: new Date()
      },
      createdAt: new Date(),
      lastLoginAt: null
    },
    {
      id: 'user_004',
      name: 'Meera Patel',
      phone: '+919000000004',
      email: 'meera@paysafe.com',
      password: 'demo123',
      bankMask: 'AXIS-4444',
      kycStatus: 'VERIFIED',
      kycData: {
        pan: 'PQRST3456U',
        aadhaar: '222222222222',
        bankAccount: '22222222224444',
        ifsc: 'AXIS0004444',
        selfieUrl: '/uploads/selfie_meera.jpg',
        verifiedAt: new Date()
      },
      createdAt: new Date(),
      lastLoginAt: null
    },
    {
      id: 'user_005',
      name: 'Rajesh Gupta',
      phone: '+919000000005',
      email: 'rajesh@paysafe.com',
      password: 'demo123',
      bankMask: 'KOTAK-5555',
      kycStatus: 'VERIFIED',
      kycData: {
        pan: 'UVWXY7890Z',
        aadhaar: '333333333333',
        bankAccount: '33333333335555',
        ifsc: 'KKBK0005555',
        selfieUrl: '/uploads/selfie_rajesh.jpg',
        verifiedAt: new Date()
      },
      createdAt: new Date(),
      lastLoginAt: null
    },
    {
      id: 'user_006',
      name: 'Anita Sharma',
      phone: '+919000000006',
      email: 'anita@paysafe.com',
      password: 'demo123',
      bankMask: 'PNB-6666',
      kycStatus: 'VERIFIED',
      kycData: {
        pan: 'ZABCD1234E',
        aadhaar: '444444444444',
        bankAccount: '44444444446666',
        ifsc: 'PUNB0006666',
        selfieUrl: '/uploads/selfie_anita.jpg',
        verifiedAt: new Date()
      },
      createdAt: new Date(),
      lastLoginAt: null
    },
    {
      id: 'user_007',
      name: 'Vikram Singh',
      phone: '+919000000007',
      email: 'vikram@paysafe.com',
      password: 'demo123',
      bankMask: 'BOI-7777',
      kycStatus: 'VERIFIED',
      kycData: {
        pan: 'EFGHI5678J',
        aadhaar: '555555555555',
        bankAccount: '55555555557777',
        ifsc: 'BKID0007777',
        selfieUrl: '/uploads/selfie_vikram.jpg',
        verifiedAt: new Date()
      },
      createdAt: new Date(),
      lastLoginAt: null
    },
    {
      id: 'user_008',
      name: 'Deepika Reddy',
      phone: '+919000000008',
      email: 'deepika@paysafe.com',
      password: 'demo123',
      bankMask: 'CANARA-8888',
      kycStatus: 'VERIFIED',
      kycData: {
        pan: 'JKLMN9012O',
        aadhaar: '666666666666',
        bankAccount: '66666666668888',
        ifsc: 'CNRB0008888',
        selfieUrl: '/uploads/selfie_deepika.jpg',
        verifiedAt: new Date()
      },
      createdAt: new Date(),
      lastLoginAt: null
    },
    {
      id: 'user_009',
      name: 'Rohit Agarwal',
      phone: '+919000000009',
      email: 'rohit@paysafe.com',
      password: 'demo123',
      bankMask: 'UNION-9999',
      kycStatus: 'VERIFIED',
      kycData: {
        pan: 'OPQRS3456T',
        aadhaar: '777777777777',
        bankAccount: '77777777779999',
        ifsc: 'UBIN0009999',
        selfieUrl: '/uploads/selfie_rohit.jpg',
        verifiedAt: new Date()
      },
      createdAt: new Date(),
      lastLoginAt: null
    },
    {
      id: 'user_010',
      name: 'Kavya Nair',
      phone: '+919000000010',
      email: 'kavya@paysafe.com',
      password: 'demo123',
      bankMask: 'FEDERAL-0000',
      kycStatus: 'VERIFIED',
      kycData: {
        pan: 'TUVWX7890Y',
        aadhaar: '888888888888',
        bankAccount: '88888888880000',
        ifsc: 'FDRL0000000',
        selfieUrl: '/uploads/selfie_kavya.jpg',
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


