const mongoose = require('mongoose');

const ledgerEntrySchema = new mongoose.Schema({
  id: String,
  type: {
    type: String,
    enum: ['platform', 'fee', 'principal', 'funding'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  description: String,
  txRef: String
});

const excuseHistorySchema = new mongoose.Schema({
  excuseNumber: Number,
  startDate: Date,
  endDate: Date,
  outstandingAtStart: Number,
  feeApplied: Number,
  minPaymentRequired: Number,
  totalRequired: Number,
  paidDuringExcuse: Number,
  satisfied: Boolean,
  defaulted: Boolean,
  reportedToCIBIL: Boolean
});

const loanSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  lenderId: {
    type: String,
    ref: 'User'
  },
  borrowerId: {
    type: String,
    required: true,
    ref: 'User'
  },
  principal: {
    type: Number,
    required: true,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  disbursedAt: Date,
  dueAt: Date,
  status: {
    type: String,
    enum: [
      'LOAN_REQUEST',
      'PENDING_PAYMENT',
      'PENDING_BORROWER_ACCEPT',
      'PENDING_LENDER_FUNDING',
      'ACTIVE',
      'COMPLETED',
      'DEFAULT_REPORTED',
      'CANCELLED'
    ],
    default: 'PENDING_BORROWER_ACCEPT'
  },
  escrowStatus: {
    type: String,
    enum: ['PENDING', 'FUNDED', 'RELEASED'],
    default: 'PENDING'
  },
  initialPlatformFee: {
    type: Number,
    default: 0
  },
  feesAccrued: [Number],
  payments: [{
    id: String,
    amount: Number,
    date: Date,
    type: String,
    txRef: String
  }],
  ledger: [ledgerEntrySchema],
  excuseHistory: [excuseHistorySchema],
  termsAcceptedAt: Date,
  termsAcceptedBy: String,
  termsAcceptedIP: String,
  termsAcceptedUserAgent: String,
  purpose: String,
  repaymentPlan: String,
  kycVerified: {
    type: Boolean,
    default: false
  }
});

// Virtual for outstanding amount
loanSchema.virtual('outstanding').get(function() {
  const principalPayments = this.ledger
    .filter(entry => entry.type === 'principal')
    .reduce((sum, entry) => sum + entry.amount, 0);
  return Math.max(0, this.principal - principalPayments);
});

// Virtual for total fees paid
loanSchema.virtual('totalFeesPaid').get(function() {
  return this.ledger
    .filter(entry => entry.type === 'fee')
    .reduce((sum, entry) => sum + entry.amount, 0);
});

// Virtual for total payments made
loanSchema.virtual('totalPaymentsMade').get(function() {
  return this.ledger
    .reduce((sum, entry) => sum + entry.amount, 0);
});

// Method to calculate excuse schedule
loanSchema.methods.calculateExcuseSchedule = function() {
  if (!this.disbursedAt) return [];
  
  const excuses = [];
  const dueDate = new Date(this.disbursedAt.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
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

// Method to get current excuse
loanSchema.methods.getCurrentExcuse = function() {
  const now = new Date();
  const excuses = this.calculateExcuseSchedule();
  
  for (const excuse of excuses) {
    if (now >= excuse.startDate && now <= excuse.endDate) {
      return excuse;
    }
  }
  
  // If past all excuses, return the last one
  return excuses[excuses.length - 1] || null;
};

// Ensure virtual fields are included in JSON output
loanSchema.set('toJSON', { virtuals: true });
loanSchema.set('toObject', { virtuals: true });

// Method to check if loan is in grace period
loanSchema.methods.isInGracePeriod = function() {
  // If funds haven't been disbursed yet, the loan cannot be in grace period
  if (!this.disbursedAt) {
    return false;
  }
  const now = new Date();
  const dueDate = new Date(this.disbursedAt.getTime() + (30 * 24 * 60 * 60 * 1000));
  const graceEnd = new Date(dueDate.getTime() + (10 * 24 * 60 * 60 * 1000));
  
  return now >= dueDate && now <= graceEnd;
};

module.exports = mongoose.model('Loan', loanSchema);


