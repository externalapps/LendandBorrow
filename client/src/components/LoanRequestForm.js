import React, { useState } from 'react';
import { useLoan } from '../contexts/LoanContext';
import { 
  CurrencyDollarIcon, 
  DocumentTextIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';
import ContactSelector from './ContactSelector';
import VideoKYC from './VideoKYC';
import toast from 'react-hot-toast';

const LoanRequestForm = ({ onRequestSubmitted }) => {
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [repaymentPlan, setRepaymentPlan] = useState('');
  const [selectedLender, setSelectedLender] = useState(null);
  const [kycCompleted, setKycCompleted] = useState(false);
  const [kycData, setKycData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
    } else if (amount > 100000) {
      newErrors.amount = 'Maximum loan amount is ₹1,00,000';
    }

    if (!purpose.trim()) {
      newErrors.purpose = 'Please enter the loan purpose';
    }

    if (!repaymentPlan.trim()) {
      newErrors.repaymentPlan = 'Please describe your repayment plan';
    }

    if (!kycCompleted) {
      newErrors.kyc = 'Please complete video KYC verification';
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
        lenderId: selectedLender.id,
        kycData
      });
      
      toast.success(`Loan request submitted to ${selectedLender.name} successfully!`);
      setAmount('');
      setPurpose('');
      setRepaymentPlan('');
      setSelectedLender(null);
      setKycCompleted(false);
      setKycData(null);
      
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
        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Video KYC Verification */}
          <div>
            <label className="form-label">
              Video KYC Verification (Required)
            </label>
            <VideoKYC
              onKYCComplete={(data) => {
                setKycCompleted(true);
                setKycData(data);
                toast.success('KYC verification completed!');
              }}
              onKYCError={(error) => {
                setKycCompleted(false);
                setKycData(null);
                toast.error('KYC verification failed');
              }}
            />
            {errors.kyc && (
              <p className="form-error">{errors.kyc}</p>
            )}
            {kycCompleted && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800">
                    KYC verification completed successfully
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
            <div className="relative">
              <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="amount"
                type="number"
                min="100"
                max="100000"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`form-input pl-10 ${errors.amount ? 'border-red-500' : ''}`}
                placeholder="Enter loan amount"
              />
            </div>
            {errors.amount && (
              <p className="form-error">{errors.amount}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Minimum: ₹100 | Maximum: ₹1,00,000
            </p>
          </div>

          {/* Loan Purpose */}
          <div>
            <label htmlFor="purpose" className="form-label">
              Loan Purpose
            </label>
            <div className="relative">
              <DocumentTextIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className={`form-input pl-10 ${errors.purpose ? 'border-red-500' : ''}`}
                placeholder="Explain why you need this loan"
                rows={3}
              />
            </div>
            {errors.purpose && (
              <p className="form-error">{errors.purpose}</p>
            )}
          </div>

          {/* Repayment Plan */}
          <div>
            <label htmlFor="repaymentPlan" className="form-label">
              Repayment Plan
            </label>
            <div className="relative">
              <DocumentTextIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                id="repaymentPlan"
                value={repaymentPlan}
                onChange={(e) => setRepaymentPlan(e.target.value)}
                className={`form-input pl-10 ${errors.repaymentPlan ? 'border-red-500' : ''}`}
                placeholder="Describe how you plan to repay this loan"
                rows={3}
              />
            </div>
            {errors.repaymentPlan && (
              <p className="form-error">{errors.repaymentPlan}</p>
            )}
          </div>

          {/* Loan Terms */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Loan Terms</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Loan Term:</span>
                <span className="font-medium">30 days</span>
              </div>
              <div className="flex justify-between">
                <span>Grace Period:</span>
                <span className="font-medium">10 days</span>
              </div>
              <div className="flex justify-between">
                <span>Block Fee Rate:</span>
                <span className="font-medium">1% per block</span>
              </div>
              <div className="flex justify-between">
                <span>Minimum Payment:</span>
                <span className="font-medium">20% per block</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !selectedLender || !kycCompleted}
            className={`w-full flex items-center justify-center ${
              loading || !selectedLender || !kycCompleted
                ? 'btn-disabled'
                : 'btn-primary'
            }`}
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                {!selectedLender || !kycCompleted
                  ? 'Complete Requirements to Submit'
                  : `Submit Request to ${selectedLender.name}`
                }
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </>
            )}
          </button>

          {/* Requirements Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements Status:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                {selectedLender ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                ) : (
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                )}
                <span className={selectedLender ? 'text-green-700' : 'text-gray-600'}>
                  Select a friend to borrow from
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {kycCompleted ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                ) : (
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                )}
                <span className={kycCompleted ? 'text-green-700' : 'text-gray-600'}>
                  Complete video KYC verification
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {amount && purpose && repaymentPlan ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
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
      </div>
    </div>
  );
};

export default LoanRequestForm;
