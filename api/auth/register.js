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
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ 
        error: { message: 'All fields are required' } 
      });
    }

    // Check if user already exists
    const existingUser = inMemoryAuth.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        error: { message: 'User already exists with this email' } 
      });
    }

    // Create new user
    const newUser = await inMemoryAuth.createUser({
      name,
      email,
      password,
      phone
    });

    // Generate token
    const token = inMemoryAuth.generateToken(newUser.id);

    // Log audit
    inMemoryAuth.logAudit(newUser.id, 'USER_REGISTER', { email }, req);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: inMemoryAuth.getUserSafe(newUser)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: { message: 'Registration failed' } });
  }
};
