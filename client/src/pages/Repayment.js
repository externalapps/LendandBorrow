import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLoan } from '../contexts/LoanContext';
import { 
  BanknotesIcon, 
  CalculatorIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Repayment = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchLoanById, getPaymentRequirements, makePayment } = useLoan();
  
  const [loan, setLoan] = useState(null);
  const [paymentRequirements, setPaymentRequirements] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchLoanData();
  }, [loanId]);

  const fetchLoanData = async () => {
    setLoading(true);
    try {
      const [loanData, requirementsData] = await Promise.all([
        fetchLoanById(loanId),
        getPaymentRequirements(loanId)
      ]);
      
      // Check if current user is the borrower
      if (loanData.borrowerId !== user.id) {
        setLoading(false);
        return; // This will show the access denied message
      }
      
      setLoan(loanData);
      setPaymentRequirements(requirementsData);
      
      // Set default amount to minimum required
      if (requirementsData) {
        setAmount(requirementsData.totalRequired.toString());
      }
    } catch (error) {
      console.error('Error fetching loan data:', error);
      toast.error('Failed to fetch loan details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const validateAmount = (value) => {
    const numValue = parseFloat(value);
    if (!value || numValue <= 0) {
      return 'Please enter a valid amount';
    }
    if (numValue < paymentRequirements.minPayment) {
      return `Minimum payment required is ${formatCurrency(paymentRequirements.minPayment)}`;
    }
    if (numValue > loan.outstanding + (paymentRequirements.blockFee || 0)) {
      return 'Payment amount cannot exceed outstanding amount plus fees';
    }
    return null;
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    
    const error = validateAmount(value);
    setErrors(prev => ({
      ...prev,
      amount: error
    }));
  };

  const handleQuickAmount = (percentage) => {
    if (!paymentRequirements) return;
    
    const quickAmount = Math.round((loan.outstanding * percentage) * 100) / 100;
    setAmount(quickAmount.toString());
    
    const error = validateAmount(quickAmount.toString());
    setErrors(prev => ({
      ...prev,
      amount: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const error = validateAmount(amount);
    if (error) {
      setErrors({ amount: error });
      return;
    }

    setProcessing(true);
    try {
      await makePayment(loanId, parseFloat(amount));
      toast.success('Payment made successfully!');
      navigate(`/loan/${loanId}`);
    } catch (error) {
      console.error('Error making payment:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!loan || !paymentRequirements) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loan Not Found</h2>
          <p className="text-gray-600 mb-4">The loan you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loan.borrowerId !== user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You can only make payments for loans you've borrowed.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loan.status !== 'ACTIVE') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loan Not Active</h2>
          <p className="text-gray-600 mb-4">This loan is not active and cannot accept payments.</p>
          <button
            onClick={() => navigate(`/loan/${loanId}`)}
            className="btn-primary"
          >
            View Loan Details
          </button>
        </div>
      </div>
    );
  }

  const paymentAmount = parseFloat(amount) || 0;
  const remainingAfterPayment = Math.max(0, loan.outstanding - paymentAmount);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/loan/${loanId}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Loan Details
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Make Payment
          </h1>
          <p className="text-gray-600">
            Loan ID: {loan.id}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">
                  Payment Details
                </h2>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Current Block Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">Current Block Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Block Number:</span>
                        <span className="font-medium ml-2">{paymentRequirements.currentBlock.blockNumber}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Block End Date:</span>
                        <span className="font-medium ml-2">
                          {new Date(paymentRequirements.blockEndDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-700">Outstanding Amount:</span>
                        <span className="font-medium ml-2">{formatCurrency(paymentRequirements.outstanding)}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Block Fee:</span>
                        <span className="font-medium ml-2">{formatCurrency(paymentRequirements.blockFee)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Amount */}
                  <div>
                    <label htmlFor="amount" className="form-label">
                      Payment Amount (₹)
                    </label>
                    <input
                      id="amount"
                      type="number"
                      min={paymentRequirements.minPayment}
                      max={paymentRequirements.outstanding + paymentRequirements.blockFee}
                      step="0.01"
                      value={amount}
                      onChange={handleAmountChange}
                      className={`form-input ${errors.amount ? 'border-red-500' : ''}`}
                      placeholder="Enter amount"
                    />
                    {errors.amount && (
                      <p className="form-error">{errors.amount}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Minimum: {formatCurrency(paymentRequirements.minPayment)} | 
                      Maximum: {formatCurrency(paymentRequirements.outstanding + paymentRequirements.blockFee)}
                    </p>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div>
                    <label className="form-label">Quick Amounts</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        { label: 'Min Payment', value: paymentRequirements.minPayment },
                        { label: '25%', percentage: 0.25 },
                        { label: '50%', percentage: 0.50 },
                        { label: 'Full Amount', value: paymentRequirements.outstanding + paymentRequirements.blockFee }
                      ].map((option, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            if (option.percentage) {
                              handleQuickAmount(option.percentage);
                            } else {
                              setAmount(option.value.toString());
                              setErrors({});
                            }
                          }}
                          className="p-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {option.label}
                          <br />
                          <span className="font-medium">
                            {formatCurrency(option.value || (loan.outstanding * option.percentage))}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Summary */}
                  {paymentAmount > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Payment Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Amount:</span>
                          <span className="font-medium">{formatCurrency(paymentAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Outstanding:</span>
                          <span className="font-medium">{formatCurrency(loan.outstanding)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-medium text-gray-900">Remaining After Payment:</span>
                          <span className="font-bold text-lg">{formatCurrency(remainingAfterPayment)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={processing || !!errors.amount}
                    className="btn-primary w-full flex items-center justify-center disabled:opacity-50"
                  >
                    {processing ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        Make Payment
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Payment Requirements */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  Payment Requirements
                </h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Current Block</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Block Number:</span>
                        <span className="font-medium">{paymentRequirements.currentBlock.blockNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>End Date:</span>
                        <span className="font-medium">
                          {new Date(paymentRequirements.blockEndDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Amounts</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Outstanding:</span>
                        <span className="font-medium">{formatCurrency(paymentRequirements.outstanding)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Block Fee:</span>
                        <span className="font-medium">{formatCurrency(paymentRequirements.blockFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Min Payment:</span>
                        <span className="font-medium">{formatCurrency(paymentRequirements.minPayment)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Total Required:</span>
                        <span className="font-bold text-lg">{formatCurrency(paymentRequirements.totalRequired)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Important</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          You must pay at least the minimum amount by the block end date to avoid additional fees and CIBIL reporting.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Repayment;






