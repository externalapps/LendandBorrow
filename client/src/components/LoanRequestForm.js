import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoan } from '../contexts/LoanContext';
import { 
  CurrencyDollarIcon, 
  DocumentTextIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const LoanRequestForm = ({ onRequestSubmitted }) => {
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [repaymentPlan, setRepaymentPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { requestLoan } = useLoan();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

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
      
      // This is a mock function that will be implemented in LoanContext
      await requestLoan({
        principal,
        purpose,
        repaymentPlan
      });
      
      toast.success('Loan request submitted successfully!');
      setAmount('');
      setPurpose('');
      setRepaymentPlan('');
      
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
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                Submit Loan Request
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoanRequestForm;
