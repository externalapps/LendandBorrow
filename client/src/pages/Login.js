import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (email, password) => {
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Demo login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-3 mb-6">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-16 h-16"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-16 h-16 bg-gradient-to-r from-navy to-teal rounded-xl flex items-center justify-center hidden">
              <span className="text-white font-bold text-lg">LB</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Lend & Borrow</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-teal-600 hover:text-teal-500 transition-colors"
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* Demo Accounts */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-3">Demo Accounts (All users can lend & borrow)</h3>
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
            <button
              onClick={() => handleDemoLogin('priya@paysafe.com', 'demo123')}
              disabled={loading}
              className="w-full text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors text-sm"
            >
              <div className="font-medium">Priya Rajesh</div>
              <div className="text-gray-500">priya@paysafe.com</div>
            </button>
            <button
              onClick={() => handleDemoLogin('arjun@paysafe.com', 'demo123')}
              disabled={loading}
              className="w-full text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors text-sm"
            >
              <div className="font-medium">Arjun Kumar</div>
              <div className="text-gray-500">arjun@paysafe.com</div>
            </button>
            <button
              onClick={() => handleDemoLogin('suresh@paysafe.com', 'demo123')}
              disabled={loading}
              className="w-full text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors text-sm"
            >
              <div className="font-medium">Suresh Venkatesh</div>
              <div className="text-gray-500">suresh@paysafe.com</div>
            </button>
            <button
              onClick={() => handleDemoLogin('meera@paysafe.com', 'demo123')}
              disabled={loading}
              className="w-full text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors text-sm"
            >
              <div className="font-medium">Meera Patel</div>
              <div className="text-gray-500">meera@paysafe.com</div>
            </button>
            <button
              onClick={() => handleDemoLogin('rajesh@paysafe.com', 'demo123')}
              disabled={loading}
              className="w-full text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors text-sm"
            >
              <div className="font-medium">Rajesh Gupta</div>
              <div className="text-gray-500">rajesh@paysafe.com</div>
            </button>
            <button
              onClick={() => handleDemoLogin('anita@paysafe.com', 'demo123')}
              disabled={loading}
              className="w-full text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors text-sm"
            >
              <div className="font-medium">Anita Sharma</div>
              <div className="text-gray-500">anita@paysafe.com</div>
            </button>
            <button
              onClick={() => handleDemoLogin('vikram@paysafe.com', 'demo123')}
              disabled={loading}
              className="w-full text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors text-sm"
            >
              <div className="font-medium">Vikram Singh</div>
              <div className="text-gray-500">vikram@paysafe.com</div>
            </button>
            <button
              onClick={() => handleDemoLogin('deepika@paysafe.com', 'demo123')}
              disabled={loading}
              className="w-full text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors text-sm"
            >
              <div className="font-medium">Deepika Reddy</div>
              <div className="text-gray-500">deepika@paysafe.com</div>
            </button>
            <button
              onClick={() => handleDemoLogin('rohit@paysafe.com', 'demo123')}
              disabled={loading}
              className="w-full text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors text-sm"
            >
              <div className="font-medium">Rohit Agarwal</div>
              <div className="text-gray-500">rohit@paysafe.com</div>
            </button>
            <button
              onClick={() => handleDemoLogin('kavya@paysafe.com', 'demo123')}
              disabled={loading}
              className="w-full text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors text-sm"
            >
              <div className="font-medium">Kavya Nair</div>
              <div className="text-gray-500">kavya@paysafe.com</div>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="form-error">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-teal-600 hover:text-teal-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            This is a demo application. All data is for demonstration purposes only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
