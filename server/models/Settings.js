const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: 'default'
  },
  initialFeeRate: {
    type: Number,
    default: 0.01,
    min: 0,
    max: 1
  },
  blockFeeRate: {
    type: Number,
    default: 0.01,
    min: 0,
    max: 1
  },
  blockMinPercent: {
    type: Number,
    default: 0.20,
    min: 0,
    max: 1
  },
  termDays: {
    type: Number,
    default: 30,
    min: 1
  },
  mainGraceDays: {
    type: Number,
    default: 10,
    min: 0
  },
  blockLengthDays: {
    type: Number,
    default: 10,
    min: 1
  },
  blockCount: {
    type: Number,
    default: 4,
    min: 0
  },
  cibilReportingEnabled: {
    type: Boolean,
    default: true
  },
  autoReportingEnabled: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Settings', settingsSchema);


