import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  ShieldCheckIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });
  const [errors, setErrors] = useState({});

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

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
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
      const response = await userAPI.updateProfile(formData);
      updateUser(response.data.user);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Profile update failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || ''
    });
    setErrors({});
    setEditing(false);
  };

  const getKYCStatusColor = (status) => {
    switch (status) {
      case 'VERIFIED': return 'text-green-600 bg-green-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'REJECTED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Personal Information
                  </h2>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="btn-outline flex items-center"
                    >
                      <PencilIcon className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                  )}
                </div>
              </div>
              <div className="card-body">
                {editing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="form-label">
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                        placeholder="Enter your full name"
                      />
                      {errors.name && (
                        <p className="form-error">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="form-label">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                        placeholder="Enter your phone number"
                      />
                      {errors.phone && (
                        <p className="form-error">{errors.phone}</p>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex items-center"
                      >
                        {loading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-8 h-8 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{user?.name}</h3>
                        <p className="text-gray-600">{user?.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <p className="text-gray-900">{user?.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <p className="text-gray-900">{user?.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <p className="text-gray-900">{user?.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bank Account
                        </label>
                        <p className="text-gray-900">{user?.bankMask || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* KYC Status */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">KYC Status</h3>
              </div>
              <div className="card-body">
                <div className="flex items-center space-x-3 mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-teal-600" />
                  <div>
                    <span className={`status-badge ${getKYCStatusColor(user?.kycStatus).replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                      {user?.kycStatus}
                    </span>
                  </div>
                </div>
                
                {user?.kycStatus === 'VERIFIED' ? (
                  <div className="text-sm text-gray-600">
                    <p>Your identity has been verified.</p>
                    <p className="mt-1">You can lend and borrow money.</p>
                  </div>
                ) : user?.kycStatus === 'PENDING' ? (
                  <div className="text-sm text-gray-600">
                    <p>Your KYC verification is pending.</p>
                    <p className="mt-1">Complete KYC to start lending and borrowing.</p>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    <p>Your KYC verification was rejected.</p>
                    <p className="mt-1">Please contact support for assistance.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
              </div>
              <div className="card-body">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">User ID:</span>
                    <span className="font-medium">{user?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since:</span>
                    <span className="font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Login:</span>
                    <span className="font-medium">
                      {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  {user?.kycStatus !== 'VERIFIED' && (
                    <a
                      href="/kyc"
                      className="btn-primary w-full text-center block"
                    >
                      Complete KYC
                    </a>
                  )}
                  
                  <button className="btn-outline w-full">
                    Change Password
                  </button>
                  
                  <button className="btn-secondary w-full">
                    Download Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;


