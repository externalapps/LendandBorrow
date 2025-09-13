const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: { message: 'No token provided' } });
    }

    // Check if it's a demo token
    if (token.startsWith('demo-token-')) {
      const userId = token.replace('demo-token-', '');
      
      // Demo user data mapping
      const demoUsers = {
        'priya_rajesh': { id: 'priya_rajesh', name: 'Priya Rajesh', email: 'priya@lendandborrow.com', phone: '+919000000001', kycStatus: 'VERIFIED' },
        'arjun_kumar': { id: 'arjun_kumar', name: 'Arjun Kumar', email: 'arjun@lendandborrow.com', phone: '+919000000002', kycStatus: 'VERIFIED' },
        'suresh_venkatesh': { id: 'suresh_venkatesh', name: 'Suresh Venkatesh', email: 'suresh@lendandborrow.com', phone: '+919000000003', kycStatus: 'VERIFIED' },
        'meera_patel': { id: 'meera_patel', name: 'Meera Patel', email: 'meera@lendandborrow.com', phone: '+919000000004', kycStatus: 'VERIFIED' },
        'rajesh_gupta': { id: 'rajesh_gupta', name: 'Rajesh Gupta', email: 'rajesh@lendandborrow.com', phone: '+919000000005', kycStatus: 'VERIFIED' },
        'anita_sharma': { id: 'anita_sharma', name: 'Anita Sharma', email: 'anita@lendandborrow.com', phone: '+919000000006', kycStatus: 'VERIFIED' },
        'vikram_singh': { id: 'vikram_singh', name: 'Vikram Singh', email: 'vikram@lendandborrow.com', phone: '+919000000007', kycStatus: 'VERIFIED' },
        'deepika_reddy': { id: 'deepika_reddy', name: 'Deepika Reddy', email: 'deepika@lendandborrow.com', phone: '+919000000008', kycStatus: 'VERIFIED' },
        'rohit_agarwal': { id: 'rohit_agarwal', name: 'Rohit Agarwal', email: 'rohit@lendandborrow.com', phone: '+919000000009', kycStatus: 'VERIFIED' },
        'kavya_nair': { id: 'kavya_nair', name: 'Kavya Nair', email: 'kavya@lendandborrow.com', phone: '+919000000010', kycStatus: 'VERIFIED' }
      };

      if (demoUsers[userId]) {
        req.user = demoUsers[userId];
        next();
        return;
      }
    }

    // Regular JWT token verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'lendandborrow-jwt-secret-2024-very-secure-key');
    
    // Use MongoDB only
    const user = await User.findOne({ id: decoded.userId });
    
    if (!user) {
      return res.status(401).json({ error: { message: 'User not found' } });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      kycStatus: user.kycStatus
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: { message: 'Invalid token' } });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    // For demo purposes, we'll consider users with specific emails as admins
    const adminEmails = ['admin@lendandborrow.com', 'demo@lendandborrow.com'];
    
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

