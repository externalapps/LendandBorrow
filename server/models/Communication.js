const mongoose = require('mongoose');

const communicationSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['sms', 'call', 'email'],
    required: true
  },
  template: String,
  transcript: String,
  sentAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['PENDING', 'SENT', 'DELIVERED', 'FAILED'],
    default: 'PENDING'
  },
  recipientPhone: String,
  recipientEmail: String,
  metadata: {
    blockNumber: Number,
    outstandingAmount: Number,
    minPayment: Number,
    blockEndDate: Date
  }
});

module.exports = mongoose.model('Communication', communicationSchema);







