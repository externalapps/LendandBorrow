import React, { useState, useEffect } from 'react';
import { useLoan } from '../contexts/LoanContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BanknotesIcon, 
  DocumentTextIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';
import ContactSelector from './ContactSelector';
import VideoKYC from './VideoKYC';
import toast from 'react-hot-toast';

const LoanRequestForm = ({ onRequestSubmitted }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [repaymentPlan, setRepaymentPlan] = useState('');
  const [selectedLender, setSelectedLender] = useState(null);
  // Use user's KYC status from AuthContext instead of local state
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  // Check if coming from KYC completion
  const [kycVerified, setKycVerified] = useState(location.state?.kycVerified || false);
  // Show KYC first unless already verified from KYC flow
  const [showKycFirst, setShowKycFirst] = useState(!kycVerified);
  
  // Check for KYC status changes
  useEffect(() => {
    // If coming from KYC with verified status, don't show KYC first
    if (location.state?.kycVerified) {
      setKycVerified(true);
      setShowKycFirst(false);
    } else {
      // Otherwise always require KYC
      setShowKycFirst(true);
    }
  }, [location.state?.kycVerified]);

  const { requestLoan } = useLoan();

  const validateForm = () => {
    const newErrors = {};

    if (!selectedLender) {
      newErrors.lender = 'Please select a friend to request money from';
    }

    if (!amount || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (amount < 100) {
      newErrors.amount = 'Minimum loan amount is ₹100';
    } else if (amount > 50000) {
      newErrors.amount = 'Maximum loan amount is ₹50,000';
    }

    if (!purpose.trim()) {
      newErrors.purpose = 'Please enter the loan purpose';
    }

    if (!repaymentPlan.trim()) {
      newErrors.repaymentPlan = 'Please describe your repayment plan';
    }

    if (user?.kycStatus !== 'VERIFIED') {
      newErrors.kyc = 'Please complete KYC verification';
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
      const principal = parseFloat(amount);
      
      await requestLoan({
        principal,
        purpose,
        repaymentPlan,
        lenderId: selectedLender.id
      });
      
      toast.success(`Loan request submitted to ${selectedLender.name} successfully!`);
      setAmount('');
      setPurpose('');
      setRepaymentPlan('');
      setSelectedLender(null);
      
      if (onRequestSubmitted) {
        onRequestSubmitted();
      }
    } catch (error) {
      console.error('Error requesting loan:', error);
      toast.error('Failed to submit loan request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-semibold text-gray-900">
          Request a Loan
        </h2>
      </div>
      <div className="card-body">
        {showKycFirst ? (
          <div className="space-y-6">
            <div>
              <label className="form-label">
                KYC Verification {kycVerified ? '(Verified)' : '(Required)'}
              </label>
              {kycVerified ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-green-800">
                        KYC Verification Completed
                      </h3>
                      <p className="text-sm text-green-700 mt-1">
                        Your KYC verification has been completed successfully. You can now proceed with your loan request.
                      </p>
                      <button
                        onClick={() => setShowKycFirst(false)}
                        className="mt-3 btn-success text-sm flex items-center"
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Continue to Loan Request
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-yellow-800">
                        KYC Required
                      </h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        You must complete KYC verification before requesting a loan.
                        This is a mandatory step to ensure secure and compliant lending.
                      </p>
                      <button
                        onClick={() => navigate('/kyc', { state: { returnTo: '/borrow', flowType: 'request' } })}
                        className="mt-3 btn-warning text-sm flex items-center"
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Complete KYC
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* KYC Verification Status - Show success message */}
            <div className="mb-6">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800">
                    KYC verification completed successfully
                  </span>
                </div>
              </div>
            </div>
            
            {/* Select Friend to Borrow From */}
            <div>
              <label className="form-label">
                Choose Friend to Borrow From
              </label>
              <ContactSelector
                onSelectContact={setSelectedLender}
                selectedContact={selectedLender}
                onClear={() => setSelectedLender(null)}
              />
              {errors.lender && (
                <p className="form-error">{errors.lender}</p>
              )}
              {selectedLender && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-800">
                      Selected: {selectedLender.name} ({selectedLender.phone})
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Loan Amount */}
            <div>
              <label htmlFor="amount" className="form-label">
                Loan Amount (₹)
              </label>
              <input
                id="amount"
                type="number"
                min="100"
                max="50000"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`form-input ${errors.amount ? 'border-red-500' : ''}`}
                placeholder="Enter loan amount"
              />
              {errors.amount && (
                <p className="form-error">{errors.amount}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Minimum: ₹100 | Maximum: ₹50,000
              </p>
            </div>

            {/* Loan Purpose */}
            <div>
              <label htmlFor="purpose" className="form-label">
                Loan Purpose
              </label>
              <textarea
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className={`form-textarea ${errors.purpose ? 'border-red-500' : ''}`}
                placeholder="What do you need the money for?"
                rows={3}
              />
              {errors.purpose && (
                <p className="form-error">{errors.purpose}</p>
              )}
            </div>

            {/* Repayment Plan */}
            <div>
              <label htmlFor="repaymentPlan" className="form-label">
                Repayment Plan
              </label>
              <textarea
                id="repaymentPlan"
                value={repaymentPlan}
                onChange={(e) => setRepaymentPlan(e.target.value)}
                className={`form-textarea ${errors.repaymentPlan ? 'border-red-500' : ''}`}
                placeholder="How and when do you plan to repay the loan?"
                rows={3}
              />
              {errors.repaymentPlan && (
                <p className="form-error">{errors.repaymentPlan}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading || !selectedLender || user?.kycStatus !== 'VERIFIED'}
                className="btn-primary w-full flex items-center justify-center"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <BanknotesIcon className="w-5 h-5 mr-2" />
                    Submit Loan Request
                  </>
                )}
              </button>
            </div>

            {/* Application Process */}
            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Application Process
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {selectedLender ? (
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                  )}
                  <span className={selectedLender ? 'text-green-700' : 'text-gray-600'}>
                    Select friend
                  </span>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                <div className="flex items-center space-x-2">
                  {user?.kycStatus === 'VERIFIED' ? (
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                  )}
                  <span className={user?.kycStatus === 'VERIFIED' ? 'text-green-700' : 'text-gray-600'}>
                    Complete KYC
                  </span>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                <div className="flex items-center space-x-2">
                  {amount && purpose && repaymentPlan ? (
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                  )}
                  <span className={amount && purpose && repaymentPlan ? 'text-green-700' : 'text-gray-600'}>
                    Fill loan details
                  </span>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoanRequestForm;