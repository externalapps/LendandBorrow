import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { backgroundStyles } from '../components/BackgroundStyles';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';

const Login = () => {
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showError } = useModal();
  const navigate = useNavigate();

  const handleDemoLogin = async (email, password = 'demo123') => {
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        showError('Login Failed', result.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      showError('Login Failed', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={backgroundStyles.login}>
      <div className="max-w-md w-full space-y-8 bg-white/90 p-8 rounded-2xl shadow-xl">
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
              onClick={() => handleDemoLogin('priya@lendandborrow.com', 'demo123')}
              disabled={loading}
              className="w-full text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors text-sm"
            >
              <div className="font-medium">Priya Rajesh</div>
              <div className="text-gray-500">priya@lendandborrow.com</div>
            </button>
            <button
              onClick={() => handleDemoLogin('arjun@lendandborrow.com', 'demo123')}
              disabled={loading}
              className="w-full text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors text-sm"
            >
              <div className="font-medium">Arjun Kumar</div>
              <div className="text-gray-500">arjun@lendandborrow.com</div>
            </button>
            <button
              onClick={() => handleDemoLogin('suresh@lendandborrow.com', 'demo123')}
              disabled={loading}
              className="w-full text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors text-sm"
            >
              <div className="font-medium">Suresh Venkatesh</div>
              <div className="text-gray-500">suresh@lendandborrow.com</div>
            </button>
            <button
              onClick={() => handleDemoLogin('meera@lendandborrow.com', 'demo123')}
              disabled={loading}
              className="w-full text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors text-sm"
            >
              <div className="font-medium">Meera Patel</div>
              <div className="text-gray-500">meera@lendandborrow.com</div>
            </button>
            <button
              onClick={() => handleDemoLogin('rajesh@lendandborrow.com', 'demo123')}
              disabled={loading}
              className="w-full text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors text-sm"
            >
              <div className="font-medium">Rajesh Gupta</div>
              <div className="text-gray-500">rajesh@lendandborrow.com</div>
            </button>
            <button
              onClick={() => handleDemoLogin('anita@lendandborrow.com', 'demo123')}
              disabled={loading}
              className="w-full text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors text-sm"
            >
              <div className="font-medium">Anita Sharma</div>
              <div className="text-gray-500">anita@lendandborrow.com</div>
            </button>
            <button
              onClick={() => handleDemoLogin('vikram@lendandborrow.com', 'demo123')}
              disabled={loading}
              className="w-full text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors text-sm"
            >
              <div className="font-medium">Vikram Singh</div>
              <div className="text-gray-500">vikram@lendandborrow.com</div>
            </button>
            <button
              onClick={() => handleDemoLogin('deepika@lendandborrow.com', 'demo123')}
              disabled={loading}
              className="w-full text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors text-sm"
            >
              <div className="font-medium">Deepika Reddy</div>
              <div className="text-gray-500">deepika@lendandborrow.com</div>
            </button>
            <button
              onClick={() => handleDemoLogin('rohit@lendandborrow.com', 'demo123')}
              disabled={loading}
              className="w-full text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors text-sm"
            >
              <div className="font-medium">Rohit Agarwal</div>
              <div className="text-gray-500">rohit@lendandborrow.com</div>
            </button>
            <button
              onClick={() => handleDemoLogin('kavya@lendandborrow.com', 'demo123')}
              disabled={loading}
              className="w-full text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors text-sm"
            >
              <div className="font-medium">Kavya Nair</div>
              <div className="text-gray-500">kavya@lendandborrow.com</div>
            </button>
          </div>
        </div>


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
