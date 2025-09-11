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
      const response = await api.post('/auth/verify-otp', { phone, otp });
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
    isAdmin: user && ['admin@paysafe.com', 'demo@paysafe.com'].includes(user.email)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};







