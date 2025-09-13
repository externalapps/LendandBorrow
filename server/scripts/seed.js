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
    
    console.log('\n🔑 Demo Login Credentials (All users have password: demo123):');
    console.log('Priya Rajesh - priya@lendandborrow.com');
    console.log('Arjun Kumar - arjun@lendandborrow.com');
    console.log('Suresh Venkatesh - suresh@lendandborrow.com');
    console.log('Meera Patel - meera@lendandborrow.com');
    console.log('Rajesh Gupta - rajesh@lendandborrow.com');
    console.log('Anita Sharma - anita@lendandborrow.com');
    console.log('Vikram Singh - vikram@lendandborrow.com');
    console.log('Deepika Reddy - deepika@lendandborrow.com');
    console.log('Rohit Agarwal - rohit@lendandborrow.com');
    console.log('Kavya Nair - kavya@lendandborrow.com');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

async function createDemoUsers() {
  const users = [];
  const hashedPassword = await bcrypt.hash('demo123', 10);

  // Demo users as per documentation
  const demoUsers = [
    {
      id: 'priya_rajesh',
      name: 'Priya Rajesh',
      email: 'priya@lendandborrow.com',
      phone: '+919000000001'
    },
    {
      id: 'arjun_kumar',
      name: 'Arjun Kumar',
      email: 'arjun@lendandborrow.com',
      phone: '+919000000002'
    },
    {
      id: 'suresh_venkatesh',
      name: 'Suresh Venkatesh',
      email: 'suresh@lendandborrow.com',
      phone: '+919000000003'
    },
    {
      id: 'meera_patel',
      name: 'Meera Patel',
      email: 'meera@lendandborrow.com',
      phone: '+919000000004'
    },
    {
      id: 'rajesh_gupta',
      name: 'Rajesh Gupta',
      email: 'rajesh@lendandborrow.com',
      phone: '+919000000005'
    },
    {
      id: 'anita_sharma',
      name: 'Anita Sharma',
      email: 'anita@lendandborrow.com',
      phone: '+919000000006'
    },
    {
      id: 'vikram_singh',
      name: 'Vikram Singh',
      email: 'vikram@lendandborrow.com',
      phone: '+919000000007'
    },
    {
      id: 'deepika_reddy',
      name: 'Deepika Reddy',
      email: 'deepika@lendandborrow.com',
      phone: '+919000000008'
    },
    {
      id: 'rohit_agarwal',
      name: 'Rohit Agarwal',
      email: 'rohit@lendandborrow.com',
      phone: '+919000000009'
    },
    {
      id: 'kavya_nair',
      name: 'Kavya Nair',
      email: 'kavya@lendandborrow.com',
      phone: '+919000000010'
    }
  ];

  for (const userData of demoUsers) {
    const user = new User({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: hashedPassword,
      kycStatus: 'PENDING',
      kycData: null
    });

    users.push(user);
    await user.save();
  }

  return users;
}

async function createDemoLoan(users) {
  const userA = users.find(u => u.id === 'priya_rajesh');
  const userB = users.find(u => u.id === 'arjun_kumar');

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
  const userA = users.find(u => u.id === 'priya_rajesh'); // Priya Rajesh (lender)
  const userB = users.find(u => u.id === 'arjun_kumar'); // Arjun Kumar (borrower)

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
    excuseFeeRate: 0.01,
    excuseMinPercent: 0.20,
    termDays: 30,
    mainGraceDays: 10,
    excuseLengthDays: 10,
    excuseCount: 4,
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
