const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Loan = require('../models/Loan');
const Settings = require('../models/Settings');
const AuditLog = require('../models/AuditLog');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://okatirendu77_db_user:4x5h2WxsbKx7D09a@lendandborrow.krnzcb9.mongodb.net/?retryWrites=true&w=majority&appName=lendandborrow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB for seeding');
  seedDatabase();
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Loan.deleteMany({});
    await Settings.deleteMany({});
    await AuditLog.deleteMany({});

    console.log('🧹 Cleared existing data');

    // Create demo users
    const users = await createDemoUsers();
    console.log('👥 Created demo users');

    // Create demo loan
    const loan = await createDemoLoan(users);
    console.log('💰 Created demo loan');

    // Create demo loan request
    const loanRequest = await createDemoLoanRequest(users);
    console.log('📝 Created demo loan request');

    // Create default settings
    await createDefaultSettings();
    console.log('⚙️ Created default settings');

    // Create audit logs
    await createAuditLogs(users, loan);
    console.log('📝 Created audit logs');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Demo Data Summary:');
    console.log(`👤 Users: ${users.length}`);
    console.log(`💰 Loans: 1`);
    console.log(`📝 Loan Requests: 1`);
    console.log(`⚙️ Settings: 1`);
    console.log(`📝 Audit Logs: 3`);
    
    console.log('\n🔑 Demo Login Credentials:');
    console.log('User A (Lender) - Priya Rajesh:');
    console.log('  Email: user_a@paysafe.com');
    console.log('  Password: demo123');
    console.log('  Phone: +919000000001');
    
    console.log('\nUser B (Borrower) - Arjun Kumar:');
    console.log('  Email: user_b@paysafe.com');
    console.log('  Password: demo123');
    console.log('  Phone: +919000000002');
    
    console.log('\nAdmin User - Suresh Venkatesh:');
    console.log('  Email: admin@paysafe.com');
    console.log('  Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

async function createDemoUsers() {
  const users = [];

  // User A (Lender)
  const userA = new User({
    id: 'user_a',
    name: 'Priya Rajesh',
    phone: '+919000000001',
    email: 'user_a@paysafe.com',
    password: 'demo123',
    bankMask: 'DemoBank-1111',
    kycStatus: 'VERIFIED',
    kycData: {
      pan: 'ABCDE1234F',
      aadhaar: '123456789012',
      bankAccount: '12345678901111',
      ifsc: 'DEMO0001111',
      selfieUrl: '/uploads/selfie_user_a.jpg',
      verifiedAt: new Date()
    }
  });

  // User B (Borrower)
  const userB = new User({
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
    }
  });

  // Admin User
  const adminUser = new User({
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
    }
  });

  // Demo User (for additional testing)
  const demoUser = new User({
    id: 'demo',
    name: 'Lakshmi Devi',
    phone: '+919000000003',
    email: 'demo@paysafe.com',
    password: 'demo123',
    bankMask: 'DemoBank-3333',
    kycStatus: 'VERIFIED',
    kycData: {
      pan: 'DEMO1234D',
      aadhaar: '111111111111',
      bankAccount: '11111111113333',
      ifsc: 'DEMO0003333',
      selfieUrl: '/uploads/selfie_demo.jpg',
      verifiedAt: new Date()
    }
  });

  users.push(userA, userB, adminUser, demoUser);
  
  for (const user of users) {
    await user.save();
  }

  return users;
}

async function createDemoLoan(users) {
  const userA = users.find(u => u.id === 'user_a');
  const userB = users.find(u => u.id === 'user_b');

  const loan = new Loan({
    id: 'loan_1',
    lenderId: userA.id,
    borrowerId: userB.id,
    principal: 1000.00,
    createdAt: new Date(),
    termDays: 30,
    initialPlatformFee: 10.00,
    status: 'PENDING_BORROWER_ACCEPT',
    escrowStatus: 'FUNDED',
    ledger: [
      {
        id: uuidv4(),
        type: 'platform',
        amount: 10.00,
        date: new Date(),
        description: 'Initial platform fee',
        txRef: `PLATFORM_loan_1`
      }
    ]
  });

  await loan.save();
  return loan;
}

async function createDemoLoanRequest(users) {
  const userA = users.find(u => u.id === 'user_a'); // Priya Rajesh (lender)
  const userB = users.find(u => u.id === 'user_b'); // Arjun Kumar (borrower)

  const loanRequest = new Loan({
    id: 'loan_request_1',
    lenderId: userA.id, // Specific lender - Priya Rajesh
    borrowerId: userB.id,
    principal: 1000.00,
    purpose: 'bills',
    repaymentPlan: 'chit',
    kycVerified: userB.kycStatus === 'VERIFIED',
    kycData: userB.kycData,
    status: 'LOAN_REQUEST',
    escrowStatus: 'PENDING',
    initialPlatformFee: 10.00,
    ledger: [] // Empty ledger for loan requests
  });

  await loanRequest.save();
  return loanRequest;
}

async function createDefaultSettings() {
  const settings = new Settings({
    id: 'default',
    initialFeeRate: 0.01,
    blockFeeRate: 0.01,
    blockMinPercent: 0.20,
    termDays: 30,
    mainGraceDays: 10,
    blockLengthDays: 10,
    blockCount: 4,
    cibilReportingEnabled: true,
    autoReportingEnabled: true
  });

  await settings.save();
  return settings;
}

async function createAuditLogs(users, loan) {
  const logs = [];

  // User registration logs
  for (const user of users) {
    logs.push(new AuditLog({
      id: uuidv4(),
      userId: user.id,
      action: 'USER_REGISTERED',
      details: { email: user.email, phone: user.phone },
      timestamp: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24 hours
      severity: 'INFO'
    }));
  }

  // Loan creation log
  logs.push(new AuditLog({
    id: uuidv4(),
    userId: loan.lenderId,
    action: 'LOAN_CREATED',
    details: { 
      loanId: loan.id, 
      borrowerId: loan.borrowerId, 
      principal: loan.principal,
      platformFee: loan.initialPlatformFee
    },
    loanId: loan.id,
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    severity: 'INFO'
  }));

  // Escrow funding log
  logs.push(new AuditLog({
    id: uuidv4(),
    userId: loan.lenderId,
    action: 'ESCROW_FUNDED',
    details: { 
      loanId: loan.id, 
      amount: loan.principal + loan.initialPlatformFee
    },
    loanId: loan.id,
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    severity: 'INFO'
  }));

  for (const log of logs) {
    await log.save();
  }

  return logs;
}
