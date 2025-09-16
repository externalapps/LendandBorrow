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
  origin: process.env.CLIENT_URL || 'https://lendandborrow.vercel.app',
  credentials: true
}));

// Additional CORS headers for production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
}

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

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://okatirendu77_db_user:4x5h2WxsbKx7D09a@lendandborrow.krnzcb9.mongodb.net/?retryWrites=true&w=majority&appName=lendandborrow';

// Connect to MongoDB with optimized settings for serverless
// Allow command buffering so initial writes wait for connection
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // 5 second timeout
  socketTimeoutMS: 45000 // 45 second timeout
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  global.mongoConnected = true;
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  global.mongoConnected = false;
  // Don't exit in serverless environment
  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    process.exit(1);
  }
});

// Middleware to ensure MongoDB connection for all routes
app.use('/api', (req, res, next) => {
  if (!global.mongoConnected) {
    // In serverless, try to reconnect quickly
    if (process.env.VERCEL) {
      mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 2000
      }).then(() => {
        global.mongoConnected = true;
        next();
      }).catch(() => {
        return res.status(503).json({ 
          error: { 
            message: 'Database temporarily unavailable. Please try again.' 
          } 
        });
      });
    } else {
      return res.status(503).json({ 
        error: { 
          message: 'Database not available. Please check MongoDB connection.' 
        } 
      });
    }
  } else {
    next();
  }
});


// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));

// Routes - setup immediately, MongoDB connection will be handled in route handlers
console.log('🔗 Setting up all routes');
app.use('/api/users', require('./routes/users'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/communications', require('./routes/communications'));
app.use('/api/mock-cibil', require('./routes/mockCibil'));
app.use('/api/settings', require('./routes/settings'));

// Debug middleware to log all API requests
app.use('/api', (req, res, next) => {
  console.log(`🔍 API Request: ${req.method} ${req.path}`);
  next();
});

// Health check endpoint (no DB required)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongoConnected: global.mongoConnected || false
  });
});

// Simple ping endpoint for serverless
app.get('/api/ping', (req, res) => {
  res.json({ 
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint to verify API routing
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    path: req.path
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

// 404 handler for API routes only
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: { message: 'API route not found' } });
});

// Start server (only in development)
if (process.env.NODE_ENV !== 'production') {
  // Start server only if not in serverless environment
  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`🚀 Lend & Borrow server running on port ${PORT}`);
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

