const mongoose = require('mongoose');

const cibilReportSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  loanId: {
    type: String,
    required: true,
    ref: 'Loan'
  },
  borrowerId: {
    type: String,
    required: true,
    ref: 'User'
  },
  amountReported: {
    type: Number,
    required: true,
    min: 0
  },
  reportedAt: {
    type: Date,
    default: Date.now
  },
  blockNumber: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'REPORTED', 'RESOLVED'],
    default: 'PENDING'
  },
  cibilReferenceId: String,
  resolutionDate: Date,
  notes: String
});

module.exports = mongoose.model('CibilReport', cibilReportSchema);







