import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { 
  DocumentTextIcon, 
  PhotoIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const KYC = () => {
  const [formData, setFormData] = useState({
    pan: '',
    aadhaar: '',
    bankAccount: '',
    ifsc: '',
    selfieUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  const { user, updateUser } = useAuth();
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

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.pan) {
        newErrors.pan = 'PAN is required';
      } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
        newErrors.pan = 'Invalid PAN format';
      }

      if (!formData.aadhaar) {
        newErrors.aadhaar = 'Aadhaar number is required';
      } else if (!/^[0-9]{12}$/.test(formData.aadhaar)) {
        newErrors.aadhaar = 'Aadhaar must be 12 digits';
      }
    }

    if (step === 2) {
      if (!formData.bankAccount) {
        newErrors.bankAccount = 'Bank account number is required';
      } else if (!/^[0-9]{9,18}$/.test(formData.bankAccount)) {
        newErrors.bankAccount = 'Invalid bank account number';
      }

      if (!formData.ifsc) {
        newErrors.ifsc = 'IFSC code is required';
      } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc)) {
        newErrors.ifsc = 'Invalid IFSC code format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Mock file upload - in real app, upload to server
      const mockUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        selfieUrl: mockUrl
      }));
      toast.success('Selfie uploaded successfully!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(2)) {
      return;
    }

    setLoading(true);
    try {
      const response = await userAPI.updateKYC(formData);
      updateUser(response.data.user);
      toast.success('KYC completed successfully!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.error?.message || 'KYC submission failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Identity Verification', description: 'PAN & Aadhaar' },
    { number: 2, title: 'Bank Details', description: 'Account & IFSC' },
    { number: 3, title: 'Selfie Verification', description: 'Photo Upload' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete KYC Verification
          </h1>
          <p className="text-gray-600">
            Verify your identity to start lending and borrowing on the platform
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number
                    ? 'bg-teal-600 border-teal-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step.number ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <span className="text-sm font-medium">{step.number}</span>
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-teal-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-16 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-teal-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* KYC Form */}
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Identity Verification */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <DocumentTextIcon className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Identity Verification
                    </h2>
                    <p className="text-gray-600">
                      Please provide your PAN and Aadhaar details
                    </p>
                  </div>

                  <div>
                    <label htmlFor="pan" className="form-label">
                      PAN Number
                    </label>
                    <input
                      id="pan"
                      name="pan"
                      type="text"
                      value={formData.pan}
                      onChange={handleChange}
                      className={`form-input ${errors.pan ? 'border-red-500' : ''}`}
                      placeholder="ABCDE1234F"
                      style={{ textTransform: 'uppercase' }}
                    />
                    {errors.pan && (
                      <p className="form-error">{errors.pan}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Enter your 10-character PAN number
                    </p>
                  </div>

                  <div>
                    <label htmlFor="aadhaar" className="form-label">
                      Aadhaar Number
                    </label>
                    <input
                      id="aadhaar"
                      name="aadhaar"
                      type="text"
                      value={formData.aadhaar}
                      onChange={handleChange}
                      className={`form-input ${errors.aadhaar ? 'border-red-500' : ''}`}
                      placeholder="123456789012"
                      maxLength="12"
                    />
                    {errors.aadhaar && (
                      <p className="form-error">{errors.aadhaar}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Enter your 12-digit Aadhaar number
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Bank Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <DocumentTextIcon className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Bank Account Details
                    </h2>
                    <p className="text-gray-600">
                      Provide your bank account information for transactions
                    </p>
                  </div>

                  <div>
                    <label htmlFor="bankAccount" className="form-label">
                      Bank Account Number
                    </label>
                    <input
                      id="bankAccount"
                      name="bankAccount"
                      type="text"
                      value={formData.bankAccount}
                      onChange={handleChange}
                      className={`form-input ${errors.bankAccount ? 'border-red-500' : ''}`}
                      placeholder="1234567890123456"
                    />
                    {errors.bankAccount && (
                      <p className="form-error">{errors.bankAccount}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Enter your bank account number (9-18 digits)
                    </p>
                  </div>

                  <div>
                    <label htmlFor="ifsc" className="form-label">
                      IFSC Code
                    </label>
                    <input
                      id="ifsc"
                      name="ifsc"
                      type="text"
                      value={formData.ifsc}
                      onChange={handleChange}
                      className={`form-input ${errors.ifsc ? 'border-red-500' : ''}`}
                      placeholder="SBIN0001234"
                      style={{ textTransform: 'uppercase' }}
                    />
                    {errors.ifsc && (
                      <p className="form-error">{errors.ifsc}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Enter your bank's IFSC code
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Selfie Verification */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <PhotoIcon className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Selfie Verification
                    </h2>
                    <p className="text-gray-600">
                      Take a selfie to complete your verification
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                      {formData.selfieUrl ? (
                        <div>
                          <img
                            src={formData.selfieUrl}
                            alt="Selfie"
                            className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
                          />
                          <p className="text-green-600 font-medium">Selfie uploaded successfully!</p>
                        </div>
                      ) : (
                        <div>
                          <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-4">Upload your selfie</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="selfie-upload"
                          />
                          <label
                            htmlFor="selfie-upload"
                            className="btn-outline cursor-pointer"
                          >
                            Choose File
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Demo Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-900">Demo Mode</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      This is a demonstration. All KYC verification is simulated and will always succeed.
                      In a real application, this would integrate with actual identity verification services.
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !formData.selfieUrl}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      'Complete KYC'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYC;







