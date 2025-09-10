const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting - more lenient for development
const isDevelopment = process.env.NODE_ENV === 'development';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // 1000 requests in dev, 100 in production
  message: {
    error: {
      message: 'Too many requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// More lenient rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 50 : 10, // 50 login attempts in dev, 10 in production
  message: {
    error: {
      message: 'Too many login attempts, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection - using MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://okatirendu77_db_user:sUg2RID7cEe5PHOr@paysafe.lgkelc4.mongodb.net/?retryWrites=true&w=majority&appName=paysafe';

// Try to connect to MongoDB, but don't exit if it fails (for demo purposes)
let mongoConnected = false;
console.log('🔗 Connecting to MongoDB:', MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@')); // Log connection string (hide credentials)

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');
  mongoConnected = true;
  global.mongoConnected = true;
  // Initialize default settings
  initializeSettings();
})
.catch((error) => {
  console.warn('⚠️ MongoDB connection failed, using in-memory storage for demo:', error.message);
  console.log('💡 Connection string used:', MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@'));
  mongoConnected = false;
  global.mongoConnected = false;
  // Don't exit - continue with in-memory storage
  initializeSettings();
});

// Make mongoConnected available globally
global.mongoConnected = mongoConnected;

// Middleware to handle MongoDB-dependent routes
app.use('/api', (req, res, next) => {
  // Allow auth routes to work without MongoDB
  if (req.path.startsWith('/auth')) {
    return next();
  }
  
  // Allow loan routes to work with mock data
  if (req.path.startsWith('/loans')) {
    return next();
  }
  
  // For other routes, check if MongoDB is connected
  if (!global.mongoConnected) {
    return res.status(503).json({ 
      error: { 
        message: 'Database not available. This is a demo application using in-memory storage for authentication only.' 
      } 
    });
  }
  
  next();
});

// Initialize default settings
async function initializeSettings() {
  const Settings = require('./models/Settings');
  try {
    const existingSettings = await Settings.findOne({ id: 'default' });
    if (!existingSettings) {
      await Settings.create({ id: 'default' });
      console.log('✅ Default settings initialized');
    }
  } catch (error) {
    console.error('❌ Error initializing settings:', error);
  }
}

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));

// Routes - setup immediately, MongoDB connection will be handled in route handlers
console.log('🔗 Setting up all routes');
app.use('/api/users', require('./routes/users'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/mock-cibil', require('./routes/mockCibil'));
app.use('/api/communications', require('./routes/communications'));
app.use('/api/settings', require('./routes/settings'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: { message: 'Route not found' } });
});

// Start server (only in development)
if (process.env.NODE_ENV !== 'production') {
  // Start server only if not in serverless environment
  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`🚀 PaySafe server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  }
}

// Export for Vercel
module.exports = app;

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (mongoose.connection.readyState === 1) {
    mongoose.connection.close(() => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  if (mongoose.connection.readyState === 1) {
    mongoose.connection.close(() => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

module.exports = app;

