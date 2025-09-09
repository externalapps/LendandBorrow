// Mock authentication service for demo purposes
const DEMO_USERS = [
  {
    id: 'user_a',
    name: 'Priya Rajesh',
    email: 'user_a@paysafe.com',
    password: 'demo123',
    phone: '+919000000001',
    kycStatus: 'VERIFIED',
    kycData: {
      pan: 'ABCDE1234F',
      aadhaar: '123456789012',
      bankAccount: '12345678901111',
      ifsc: 'DEMO0001111'
    }
  },
  {
    id: 'user_b',
    name: 'Arjun Kumar',
    email: 'user_b@paysafe.com',
    password: 'demo123',
    phone: '+919000000002',
    kycStatus: 'VERIFIED',
    kycData: {
      pan: 'FGHIJ5678K',
      aadhaar: '987654321098',
      bankAccount: '98765432102222',
      ifsc: 'DEMO0002222'
    }
  },
  {
    id: 'admin',
    name: 'Suresh Venkatesh',
    email: 'admin@paysafe.com',
    password: 'admin123',
    phone: '+919000000000',
    kycStatus: 'VERIFIED',
    isAdmin: true,
    kycData: {
      pan: 'ADMIN1234A',
      aadhaar: '000000000000',
      bankAccount: '00000000000000',
      ifsc: 'ADMIN0000000'
    }
  }
];

export const mockAuth = {
  login: async (email, password) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = DEMO_USERS.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Generate mock JWT token
    const token = btoa(JSON.stringify({ 
      userId: user.id, 
      email: user.email,
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    }));
    
    return {
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          kycStatus: user.kycStatus,
          isAdmin: user.isAdmin || false
        }
      }
    };
  },
  
  getMe: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    
    try {
      const payload = JSON.parse(atob(token));
      if (payload.exp < Date.now()) {
        throw new Error('Token expired');
      }
      
      const user = DEMO_USERS.find(u => u.id === payload.userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      return {
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            kycStatus: user.kycStatus,
            isAdmin: user.isAdmin || false
          }
        }
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
};
