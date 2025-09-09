const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  bankMask: {
    type: String,
    default: ''
  },
  kycStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING'
  },
  kycData: {
    pan: String,
    aadhaar: String,
    bankAccount: String,
    ifsc: String,
    selfieUrl: String,
    verifiedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Mask sensitive data for API responses
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  if (user.kycData) {
    user.kycData.pan = user.kycData.pan ? user.kycData.pan.replace(/(.{2}).*(.{2})/, '$1****$2') : '';
    user.kycData.aadhaar = user.kycData.aadhaar ? user.kycData.aadhaar.replace(/(.{4}).*(.{4})/, '$1****$2') : '';
    user.kycData.bankAccount = user.kycData.bankAccount ? user.kycData.bankAccount.replace(/(.{4}).*(.{4})/, '$1****$2') : '';
  }
  return user;
};

module.exports = mongoose.model('User', userSchema);






