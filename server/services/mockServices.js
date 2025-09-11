/**
 * Mock services for use when MongoDB is not available
 */

const mockLoans = [
  {
    _id: 'loan_001',
    borrowerId: 'user_001',
    borrowerName: 'Priya Sharma',
    lenderId: 'user_002',
    lenderName: 'Arjun Kumar',
    amount: 10000,
    term: 30,
    interestRate: 5,
    purpose: 'Home renovation',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    disbursedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    nextPaymentDue: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    outstanding: 10500
  },
  {
    _id: 'loan_002',
    borrowerId: 'user_003',
    borrowerName: 'Suresh Patel',
    lenderId: 'user_001',
    lenderName: 'Priya Sharma',
    amount: 5000,
    term: 15,
    interestRate: 3,
    purpose: 'Education',
    status: 'PENDING_APPROVAL',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    _id: 'loan_003',
    borrowerId: 'user_002',
    borrowerName: 'Arjun Kumar',
    lenderId: 'user_003',
    lenderName: 'Suresh Patel',
    amount: 15000,
    term: 60,
    interestRate: 7,
    purpose: 'Business expansion',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    disbursedAt: new Date(Date.now() - 89 * 24 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    outstanding: 0
  }
];

// Mock dashboard summary
const getDashboardSummary = (userId) => {
  const summary = {
    totalBorrowed: 0,
    totalLent: 0,
    activeLoans: 0,
    pendingLoans: 0,
    completedLoans: 0,
    upcomingPayments: []
  };
  
  mockLoans.forEach(loan => {
    if (loan.borrowerId === userId) {
      summary.totalBorrowed += loan.amount;
    }
    
    if (loan.lenderId === userId) {
      summary.totalLent += loan.amount;
    }
    
    if (loan.status === 'ACTIVE' && (loan.borrowerId === userId || loan.lenderId === userId)) {
      summary.activeLoans++;
      
      // Add upcoming payment if it's due within 7 days
      if (loan.nextPaymentDue && new Date(loan.nextPaymentDue) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
        summary.upcomingPayments.push({
          loanId: loan._id,
          amount: loan.nextPaymentAmount || Math.round(loan.outstanding * 0.1),
          dueDate: loan.nextPaymentDue
        });
      }
    } else if (['PENDING_APPROVAL', 'PENDING_DISBURSAL'].includes(loan.status) && 
               (loan.borrowerId === userId || loan.lenderId === userId)) {
      summary.pendingLoans++;
    } else if (loan.status === 'COMPLETED' && 
               (loan.borrowerId === userId || loan.lenderId === userId)) {
      summary.completedLoans++;
    }
  });
  
  // Sort upcoming payments by due date
  summary.upcomingPayments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  
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

// Create a new loan
const createLoan = (lenderId, borrowerId, amount) => {
  const lenderUser = { id: lenderId, name: 'Demo Lender' };
  const borrowerUser = { id: borrowerId, name: 'Demo Borrower' };
  
  const newLoan = {
    _id: `loan_${Date.now()}`,
    lenderId: lenderUser.id,
    lenderName: lenderUser.name,
    borrowerId: borrowerUser.id,
    borrowerName: borrowerUser.name,
    amount: Number(amount),
    term: 30,
    interestRate: 5,
    purpose: 'Demo purpose',
    status: 'PENDING_APPROVAL',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  mockLoans.push(newLoan);
  return newLoan;
};

// Get pending loan offers
const getPendingOffers = (userId) => {
  return mockLoans.filter(loan => 
    loan.status === 'PENDING_APPROVAL' && loan.borrowerId === userId
  );
};

module.exports = {
  getDashboardSummary,
  getUserLoans,
  createLoan,
  getPendingOffers,
  mockLoans
};