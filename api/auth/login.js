const { inMemoryAuth } = require('../../server/services/inMemoryAuth');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: { message: 'Email and password are required' } 
      });
    }

    // Find user by email
    const user = inMemoryAuth.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        error: { message: 'Invalid credentials' } 
      });
    }

    // Check password
    const isValidPassword = await inMemoryAuth.comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: { message: 'Invalid credentials' } 
      });
    }

    // Generate token
    const token = inMemoryAuth.generateToken(user.id);

    // Log audit
    inMemoryAuth.logAudit(user.id, 'USER_LOGIN', { email }, req);

    res.json({
      message: 'Login successful',
      token,
      user: inMemoryAuth.getUserSafe(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: { message: 'Login failed' } });
  }
};
