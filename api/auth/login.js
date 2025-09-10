module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'https://lendandborrow.vercel.app');
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

    // Mock authentication for testing - using existing PaySafe demo users
    const mockUsers = [
      { id: 'user_001', email: 'priya@paysafe.com', password: 'demo123', name: 'Priya Sharma' },
      { id: 'user_002', email: 'arjun@paysafe.com', password: 'demo123', name: 'Arjun Kumar' },
      { id: 'user_003', email: 'suresh@paysafe.com', password: 'demo123', name: 'Suresh Patel' },
      { id: 'user_004', email: 'meera@paysafe.com', password: 'demo123', name: 'Meera Patel' },
      { id: 'user_005', email: 'rajesh@paysafe.com', password: 'demo123', name: 'Rajesh Singh' },
      { id: 'user_006', email: 'anita@paysafe.com', password: 'demo123', name: 'Anita Reddy' },
      { id: 'user_007', email: 'vikram@paysafe.com', password: 'demo123', name: 'Vikram Joshi' },
      { id: 'user_008', email: 'deepika@paysafe.com', password: 'demo123', name: 'Deepika Agarwal' },
      { id: 'user_009', email: 'rohit@paysafe.com', password: 'demo123', name: 'Rohit Verma' },
      { id: 'user_010', email: 'kavya@paysafe.com', password: 'demo123', name: 'Kavya Nair' }
    ];

    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(401).json({ 
        error: { message: 'Invalid credentials' } 
      });
    }

    // Mock JWT token
    const token = 'mock-jwt-token-' + user.id;

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        kycStatus: 'VERIFIED'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: { message: 'Login failed' } });
  }
};
