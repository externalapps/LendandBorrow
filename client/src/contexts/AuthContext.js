import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Check if it's a demo token
      if (token.startsWith('demo-token-')) {
        const userId = token.replace('demo-token-', '');
        
        // Demo user data mapping
        const demoUsers = {
          'priya_rajesh': { id: 'priya_rajesh', name: 'Priya Rajesh', email: 'priya@lendandborrow.com', phone: '+919000000001', kycStatus: 'PENDING' },
          'arjun_kumar': { id: 'arjun_kumar', name: 'Arjun Kumar', email: 'arjun@lendandborrow.com', phone: '+919000000002', kycStatus: 'PENDING' },
          'suresh_venkatesh': { id: 'suresh_venkatesh', name: 'Suresh Venkatesh', email: 'suresh@lendandborrow.com', phone: '+919000000003', kycStatus: 'PENDING' },
          'meera_patel': { id: 'meera_patel', name: 'Meera Patel', email: 'meera@lendandborrow.com', phone: '+919000000004', kycStatus: 'PENDING' },
          'rajesh_gupta': { id: 'rajesh_gupta', name: 'Rajesh Gupta', email: 'rajesh@lendandborrow.com', phone: '+919000000005', kycStatus: 'PENDING' },
          'anita_sharma': { id: 'anita_sharma', name: 'Anita Sharma', email: 'anita@lendandborrow.com', phone: '+919000000006', kycStatus: 'PENDING' },
          'vikram_singh': { id: 'vikram_singh', name: 'Vikram Singh', email: 'vikram@lendandborrow.com', phone: '+919000000007', kycStatus: 'PENDING' },
          'deepika_reddy': { id: 'deepika_reddy', name: 'Deepika Reddy', email: 'deepika@lendandborrow.com', phone: '+919000000008', kycStatus: 'PENDING' },
          'rohit_agarwal': { id: 'rohit_agarwal', name: 'Rohit Agarwal', email: 'rohit@lendandborrow.com', phone: '+919000000009', kycStatus: 'PENDING' },
          'kavya_nair': { id: 'kavya_nair', name: 'Kavya Nair', email: 'kavya@lendandborrow.com', phone: '+919000000010', kycStatus: 'PENDING' }
        };

        if (demoUsers[userId]) {
          setUser(demoUsers[userId]);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setLoading(false);
          return;
        }
      }

      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Verify token and get user data
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password = '') => {
    try {
      // Demo user data mapping
      const demoUsers = {
        'priya@lendandborrow.com': { id: 'priya_rajesh', name: 'Priya Rajesh', email: 'priya@lendandborrow.com', phone: '+919000000001', kycStatus: 'PENDING' },
        'arjun@lendandborrow.com': { id: 'arjun_kumar', name: 'Arjun Kumar', email: 'arjun@lendandborrow.com', phone: '+919000000002', kycStatus: 'PENDING' },
        'suresh@lendandborrow.com': { id: 'suresh_venkatesh', name: 'Suresh Venkatesh', email: 'suresh@lendandborrow.com', phone: '+919000000003', kycStatus: 'PENDING' },
        'meera@lendandborrow.com': { id: 'meera_patel', name: 'Meera Patel', email: 'meera@lendandborrow.com', phone: '+919000000004', kycStatus: 'PENDING' },
        'rajesh@lendandborrow.com': { id: 'rajesh_gupta', name: 'Rajesh Gupta', email: 'rajesh@lendandborrow.com', phone: '+919000000005', kycStatus: 'PENDING' },
        'anita@lendandborrow.com': { id: 'anita_sharma', name: 'Anita Sharma', email: 'anita@lendandborrow.com', phone: '+919000000006', kycStatus: 'PENDING' },
        'vikram@lendandborrow.com': { id: 'vikram_singh', name: 'Vikram Singh', email: 'vikram@lendandborrow.com', phone: '+919000000007', kycStatus: 'PENDING' },
        'deepika@lendandborrow.com': { id: 'deepika_reddy', name: 'Deepika Reddy', email: 'deepika@lendandborrow.com', phone: '+919000000008', kycStatus: 'PENDING' },
        'rohit@lendandborrow.com': { id: 'rohit_agarwal', name: 'Rohit Agarwal', email: 'rohit@lendandborrow.com', phone: '+919000000009', kycStatus: 'PENDING' },
        'kavya@lendandborrow.com': { id: 'kavya_nair', name: 'Kavya Nair', email: 'kavya@lendandborrow.com', phone: '+919000000010', kycStatus: 'PENDING' }
      };

      // Check if it's a demo user
      if (demoUsers[email]) {
        const user = demoUsers[email];
        const token = 'demo-token-' + user.id;
        
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);

        console.log('Demo login successful!', user.name);
        return { success: true };
      }

      // Fallback to API login for non-demo users
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);

      console.log('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Login failed';
      console.error('Login failed:', message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);

      console.log('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Registration failed';
      console.error('Registration failed:', message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    console.log('Logged out successfully');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const sendOTP = async (phone) => {
    try {
      const response = await api.post('/auth/send-otp', { phone });
      console.log('OTP sent successfully!');
      return { success: true, otp: response.data.otp }; // Demo only
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to send OTP';
      console.error('Failed to send OTP:', message);
      return { success: false, error: message };
    }
  };

  const verifyOTP = async (phone, otp) => {
    try {
      await api.post('/auth/verify-otp', { phone, otp });
      console.log('OTP verified successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error?.message || 'OTP verification failed';
      console.error('OTP verification failed:', message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    sendOTP,
    verifyOTP,
    isAuthenticated: !!user,
    isAdmin: user && ['admin@lendandborrow.com', 'demo@lendandborrow.com'].includes(user.email)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};







