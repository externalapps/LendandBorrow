/**
 * Mock services for use when MongoDB is not available
 */

const mockLoans = [];

// Mock dashboard summary
const getDashboardSummary = (userId) => {
  // Filter loans for this user
  const loansGiven = mockLoans.filter(loan => loan.lenderId === userId);
  const loansTaken = mockLoans.filter(loan => loan.borrowerId === userId);
  
  const summary = {
    loansGiven: {
      loans: loansGiven,
      count: loansGiven.length,
      totalAmount: loansGiven.reduce((sum, loan) => sum + loan.amount, 0),
      activeCount: loansGiven.filter(loan => loan.status === 'ACTIVE').length
    },
    loansTaken: {
      loans: loansTaken,
      count: loansTaken.length,
      totalAmount: loansTaken.reduce((sum, loan) => sum + loan.amount, 0),
      activeCount: loansTaken.filter(loan => loan.status === 'ACTIVE').length,
      outstanding: loansTaken.reduce((sum, loan) => sum + (loan.outstanding || loan.amount), 0)
    },
    overdue: {
      count: loansTaken.filter(loan => loan.status === 'ACTIVE' && loan.outstanding > 0).length,
      amount: loansTaken.filter(loan => loan.status === 'ACTIVE' && loan.outstanding > 0).reduce((sum, loan) => sum + loan.outstanding, 0)
    },
    upcomingCheckpoints: [],
    cibilReports: [
      {
        id: 'cibil_001',
        score: 750,
        status: 'VERIFIED',
        generatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        reportUrl: '/reports/cibil_001.pdf'
      },
      {
        id: 'cibil_002',
        score: 780,
        status: 'VERIFIED',
        generatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        reportUrl: '/reports/cibil_002.pdf'
      }
    ],
    cibilSnapshot: {
      reports: 2,
      lastReport: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  };
  
  return summary;
};

// Get loans for a user
const getUserLoans = (userId, type, status) => {
  let userLoans = mockLoans.filter(loan => 
    (loan.borrowerId === userId || loan.lenderId === userId) && 
    loan.status !== 'LOAN_REQUEST'
  );
  
  // Apply type filter
  if (type === 'lent') {
    userLoans = userLoans.filter(loan => loan.lenderId === userId && loan.status !== 'LOAN_REQUEST');
  } else if (type === 'borrowed') {
    userLoans = userLoans.filter(loan => loan.borrowerId === userId && loan.status !== 'LOAN_REQUEST');
  }
  
  // Apply status filter
  if (status) {
    userLoans = userLoans.filter(loan => loan.status === status);
  }
  
  return userLoans;
};

// Create a new loan offer (by lender for borrower)
const createLoan = (lenderId, borrowerId, amount) => {
  const { v4: uuidv4 } = require('uuid');
  
  const newLoan = {
    id: uuidv4(),
    _id: uuidv4(),
    lenderId,
    borrowerId,
    principal: Number(amount),
    amount: Number(amount),
    initialPlatformFee: Math.round(Number(amount) * 0.01 * 100) / 100,
    outstanding: Number(amount),
    status: 'PENDING_BORROWER_ACCEPT',
    escrowStatus: 'PENDING',
    term: 30,
    interestRate: 5,
    purpose: 'Demo purpose',
    createdAt: new Date(),
    updatedAt: new Date(),
    dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    ledger: [{
      id: uuidv4(),
      type: 'platform',
      amount: Math.round(Number(amount) * 0.01 * 100) / 100,
      date: new Date(),
      description: 'Initial platform fee',
      txRef: `PLATFORM_${uuidv4()}`
    }],
    excuseHistory: [],
    totalPaymentsMade: 0,
    totalFeesPaid: 0,
    currentExcuse: null
  };
  
  mockLoans.push(newLoan);
  console.log(`🚀 Mock loan offer created: ${newLoan.id} for ₹${amount}`);
  return newLoan;
};

// Create a new loan request (by borrower for lender)
const createLoanRequest = (lenderId, borrowerId, amount, purpose, repaymentPlan, kycVerified = false) => {
  const { v4: uuidv4 } = require('uuid');
  
  const newLoan = {
    id: uuidv4(),
    _id: uuidv4(),
    lenderId,
    borrowerId,
    principal: Number(amount),
    amount: Number(amount),
    initialPlatformFee: Math.round(Number(amount) * 0.01 * 100) / 100,
    outstanding: Number(amount),
    status: 'PENDING_LENDER_ACCEPT', // Different status for loan requests
    escrowStatus: 'PENDING',
    term: 30,
    interestRate: 5,
    purpose: purpose || 'Demo purpose',
    repaymentPlan: repaymentPlan || 'Standard repayment plan',
    kycVerified: kycVerified, // Per-loan KYC verification
    createdAt: new Date(),
    updatedAt: new Date(),
    dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    ledger: [{
      id: uuidv4(),
      type: 'platform',
      amount: Math.round(Number(amount) * 0.01 * 100) / 100,
      date: new Date(),
      description: 'Initial platform fee',
      txRef: `PLATFORM_${uuidv4()}`
    }],
    excuseHistory: [],
    repaymentHistory: [],
    escrowTransactions: [],
    disputeHistory: []
  };
  
  mockLoans.push(newLoan);
  console.log(`🚀 Mock loan request created: ${newLoan.id} for ₹${amount} (KYC: ${kycVerified ? 'Verified' : 'Pending'})`);
  return newLoan;
};

// Get pending loan offers for borrower (loans created by lenders for this borrower)
const getPendingOffers = (userId) => {
  const inMemoryAuth = require('./inMemoryAuth');
  
  const offers = mockLoans.filter(loan => 
    loan.status === 'PENDING_BORROWER_ACCEPT' && loan.borrowerId === userId
  );
  
  // Populate lender information
  return offers.map(offer => {
    const lender = inMemoryAuth.findUserById(offer.lenderId);
    return {
      ...offer,
      lenderId: {
        id: offer.lenderId,
        name: lender ? lender.name : 'Unknown Lender',
        email: lender ? lender.email : 'unknown@example.com',
        phone: lender ? lender.phone : '+919000000000'
      }
    };
  });
};

// Get pending loan requests for lender (requests created by borrowers for this lender)
const getPendingLoanRequests = (userId) => {
  const inMemoryAuth = require('./inMemoryAuth');
  
  const requests = mockLoans.filter(loan => 
    loan.status === 'PENDING_LENDER_ACCEPT' && loan.lenderId === userId
  );
  
  // Populate borrower information
  return requests.map(request => {
    const borrower = inMemoryAuth.findUserById(request.borrowerId);
    return {
      ...request,
      borrower: borrower ? {
        id: borrower.id,
        name: borrower.name,
        email: borrower.email,
        phone: borrower.phone,
        kycStatus: request.kycVerified ? 'VERIFIED' : 'PENDING',
        kycVerified: request.kycVerified || false
      } : { 
        id: request.borrowerId,
        name: 'Unknown User',
        email: 'unknown@example.com',
        phone: 'No phone',
        kycStatus: 'PENDING',
        kycVerified: false
      }
    };
  });
};

// Calculate excuse schedule for a loan (mock version)
const calculateExcuseSchedule = (loan) => {
  if (!loan.disbursedAt) return [];
  
  const excuses = [];
  const dueDate = new Date(loan.disbursedAt.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
  const mainGraceEnd = new Date(dueDate.getTime() + (10 * 24 * 60 * 60 * 1000)); // +10 days
  
  // First checkpoint (main grace end)
  excuses.push({
    excuseNumber: 1,
    startDate: dueDate,
    endDate: mainGraceEnd,
    isMainGrace: true
  });
  
  // Subsequent excuses (4 more excuses of 10 days each)
  for (let i = 2; i <= 5; i++) {
    const startDate = new Date(mainGraceEnd.getTime() + ((i - 2) * 10 * 24 * 60 * 60 * 1000));
    const endDate = new Date(startDate.getTime() + (10 * 24 * 60 * 60 * 1000));
    
    excuses.push({
      excuseNumber: i,
      startDate,
      endDate,
      isMainGrace: false
    });
  }
  
  return excuses;
};

// Get current excuse for a loan (mock version)
const getCurrentExcuse = (loan) => {
  const now = new Date();
  const excuses = calculateExcuseSchedule(loan);
  
  for (const excuse of excuses) {
    if (now >= excuse.startDate && now <= excuse.endDate) {
      return excuse;
    }
  }
  
  // If past all excuses, return the last one
  return excuses[excuses.length - 1] || null;
};

// Get loan by ID
const getLoanById = (loanId) => {
  const loan = mockLoans.find(loan => loan.id === loanId || loan._id === loanId);
  if (loan) {
    // Ensure totalPaid is calculated correctly
    if (loan.ledger && loan.ledger.length > 0) {
      const totalPaid = loan.ledger
        .filter(entry => entry.type === 'principal' || entry.type === 'fee')
        .reduce((sum, entry) => sum + entry.amount, 0);
      loan.totalPaid = totalPaid;
    } else {
      loan.totalPaid = 0;
    }
    
    // Add excuse calculation methods
    loan.calculateExcuseSchedule = () => calculateExcuseSchedule(loan);
    loan.getCurrentExcuse = () => getCurrentExcuse(loan);
  }
  return loan;
};

// Get loan ledger
const getLoanLedger = (loanId) => {
  const loan = getLoanById(loanId);
  return loan ? loan.ledger || [] : [];
};

// Get loan excuses
const getLoanExcuses = (loanId) => {
  const loan = getLoanById(loanId);
  return loan ? loan.excuseHistory || [] : [];
};

// Make payment (mock version)
const makePayment = (loanId, amount) => {
  const loan = getLoanById(loanId);
  if (!loan) {
    throw new Error('Loan not found');
  }

  if (loan.status !== 'ACTIVE') {
    throw new Error('Cannot make payment on inactive loan');
  }

  if (amount <= 0) {
    throw new Error('Payment amount must be positive');
  }

  // Calculate payment allocation (fees first, then principal)
  let remainingAmount = amount;
  const payments = [];

  // First, pay any outstanding fees
  const outstandingFees = loan.initialPlatformFee || 0; // Simplified for mock
  if (outstandingFees > 0 && remainingAmount > 0) {
    const feePayment = Math.min(remainingAmount, outstandingFees);
    payments.push({
      id: `FEE_${loanId}_${Date.now()}`,
      type: 'fee',
      amount: feePayment,
      date: new Date(),
      description: 'Fee payment',
      txRef: `FEE_${loanId}_${Date.now()}`
    });
    remainingAmount -= feePayment;
  }

  // Then, pay principal
  if (remainingAmount > 0) {
    const principalPayment = Math.min(remainingAmount, loan.outstanding);
    payments.push({
      id: `PRINCIPAL_${loanId}_${Date.now()}`,
      type: 'principal',
      amount: principalPayment,
      date: new Date(),
      description: 'Principal payment',
      txRef: `PRINCIPAL_${loanId}_${Date.now()}`
    });
  }

  // Add payments to ledger
  if (!loan.ledger) loan.ledger = [];
  loan.ledger.push(...payments);

  // Update outstanding amount
  const principalPayments = loan.ledger
    .filter(entry => entry.type === 'principal')
    .reduce((sum, entry) => sum + entry.amount, 0);
  loan.outstanding = Math.max(0, loan.principal - principalPayments);

  // Update total paid amount
  const totalPaid = loan.ledger
    .filter(entry => entry.type === 'principal' || entry.type === 'fee')
    .reduce((sum, entry) => sum + entry.amount, 0);
  loan.totalPaid = totalPaid;

  // Check if loan is completed
  if (loan.outstanding <= 0) {
    loan.status = 'COMPLETED';
  }

  console.log(`💰 Mock payment made: ₹${amount} for loan ${loanId}, new outstanding: ₹${loan.outstanding}, total paid: ₹${loan.totalPaid}`);
  
  return { loan, payments };
};

// Get payment requirements (mock version)
const getPaymentRequirements = (loanId) => {
  const loan = getLoanById(loanId);
  if (!loan) {
    throw new Error('Loan not found');
  }

  if (loan.status !== 'ACTIVE') {
    throw new Error('Loan is not active');
  }

  const currentExcuse = getCurrentExcuse(loan);
  if (!currentExcuse) {
    throw new Error('No active excuse found');
  }

  const outstanding = loan.outstanding;
  const excuseFee = Math.round(outstanding * 0.01 * 100) / 100; // 1% excuse fee
  const minPayment = Math.round(outstanding * 0.20 * 100) / 100; // 20% minimum
  const totalRequired = minPayment + excuseFee;

  return {
    currentExcuse,
    outstanding,
    excuseFee,
    minPayment,
    totalRequired,
    excuseEndDate: currentExcuse.endDate
  };
};

module.exports = {
  getDashboardSummary,
  getUserLoans,
  createLoan,
  createLoanRequest,
  getPendingOffers,
  getPendingLoanRequests,
  getLoanById,
  getLoanLedger,
  getLoanExcuses,
  makePayment,
  getPaymentRequirements,
  mockLoans
};