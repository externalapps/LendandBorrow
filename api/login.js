// Serverless function for login
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: { message: 'Email is required' } 
      });
    }

    // For demo purposes, we'll accept any login with a valid demo email
    // This is ONLY for the demo - in a real app, you would validate passwords
    const mockUsers = [
      { id: 'user_001', email: 'priya@paysafe.com', name: 'Priya Sharma' },
      { id: 'user_002', email: 'arjun@paysafe.com', name: 'Arjun Kumar' },
      { id: 'user_003', email: 'suresh@paysafe.com', name: 'Suresh Patel' },
      { id: 'user_004', email: 'meera@paysafe.com', name: 'Meera Patel' },
      { id: 'user_005', email: 'rajesh@paysafe.com', name: 'Rajesh Singh' },
      { id: 'user_006', email: 'anita@paysafe.com', name: 'Anita Reddy' },
      { id: 'user_007', email: 'vikram@paysafe.com', name: 'Vikram Joshi' },
      { id: 'user_008', email: 'deepika@paysafe.com', name: 'Deepika Agarwal' },
      { id: 'user_009', email: 'rohit@paysafe.com', name: 'Rohit Verma' },
      { id: 'user_010', email: 'kavya@paysafe.com', name: 'Kavya Nair' }
    ];

    const user = mockUsers.find(u => u.email === email);
    
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
