const jwt = require('jsonwebtoken');
const inMemoryAuth = require('../services/inMemoryAuth');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: { message: 'No token provided' } });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'paysafe-jwt-secret-2024-very-secure-key');
    const user = inMemoryAuth.findUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: { message: 'Invalid token' } });
    }

    req.user = inMemoryAuth.getUserSafe(user);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: { message: 'Invalid token' } });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    // For demo purposes, we'll consider users with specific emails as admins
    const adminEmails = ['admin@paysafe.com', 'demo@paysafe.com'];
    
    if (!req.user || !adminEmails.includes(req.user.email)) {
      return res.status(403).json({ error: { message: 'Admin access required' } });
    }
    
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(403).json({ error: { message: 'Admin access required' } });
  }
};

module.exports = { auth, adminAuth };

