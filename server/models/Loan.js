const mongoose = require('mongoose');

const ledgerEntrySchema = new mongoose.Schema({
  id: String,
  type: {
    type: String,
    enum: ['platform', 'fee', 'principal'],
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

const blockHistorySchema = new mongoose.Schema({
  blockNumber: Number,
  startDate: Date,
  endDate: Date,
  outstandingAtStart: Number,
  feeApplied: Number,
  minPaymentRequired: Number,
  totalRequired: Number,
  paidDuringBlock: Number,
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
  blockHistory: [blockHistorySchema],
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

// Method to calculate block schedule
loanSchema.methods.calculateBlockSchedule = function() {
  if (!this.disbursedAt) return [];
  
  const blocks = [];
  const dueDate = new Date(this.disbursedAt.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
  const mainGraceEnd = new Date(dueDate.getTime() + (10 * 24 * 60 * 60 * 1000)); // +10 days
  
  // First checkpoint (main grace end)
  blocks.push({
    blockNumber: 1,
    startDate: dueDate,
    endDate: mainGraceEnd,
    isMainGrace: true
  });
  
  // Subsequent blocks (4 more blocks of 10 days each)
  for (let i = 2; i <= 5; i++) {
    const startDate = new Date(mainGraceEnd.getTime() + ((i - 2) * 10 * 24 * 60 * 60 * 1000));
    const endDate = new Date(startDate.getTime() + (10 * 24 * 60 * 60 * 1000));
    
    blocks.push({
      blockNumber: i,
      startDate,
      endDate,
      isMainGrace: false
    });
  }
  
  return blocks;
};

// Method to get current block
loanSchema.methods.getCurrentBlock = function() {
  const now = new Date();
  const blocks = this.calculateBlockSchedule();
  
  for (const block of blocks) {
    if (now >= block.startDate && now <= block.endDate) {
      return block;
    }
  }
  
  // If past all blocks, return the last one
  return blocks[blocks.length - 1] || null;
};

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


