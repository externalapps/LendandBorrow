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
import { useModal } from '../contexts/ModalContext';

const Repayment = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchLoanById, getPaymentRequirements, makePayment } = useLoan();
  const { showError } = useModal();
  
  const [loan, setLoan] = useState(null);
  const [paymentRequirements, setPaymentRequirements] = useState(null);
  const [amount, setAmount] = useState('');
  const [selectedQuickAmount, setSelectedQuickAmount] = useState(null);
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
      
      // Make sure outstanding amount is available
      if (loanData && loanData.outstanding > 0) {
        // Set default amount to full outstanding amount
        setAmount(loanData.outstanding.toString());
      } else if (requirementsData && requirementsData.totalRequired > 0) {
        setAmount(requirementsData.totalRequired.toString());
      } else {
        // Fallback to a minimum amount
        setAmount("100");
      }
    } catch (error) {
      console.error('Error fetching loan data:', error);
      showError('Error', 'Failed to fetch loan details');
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
    if (numValue > loan.outstanding + (paymentRequirements.blockFee || 0)) {
      return 'Payment amount cannot exceed outstanding amount plus fees';
    }
    return null;
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    setSelectedQuickAmount(null); // Clear selection when manually typing
    
    const error = validateAmount(value);
    setErrors(prev => ({
      ...prev,
      amount: error
    }));
  };

  const handleQuickAmount = (percentage) => {
    if (!loan || !loan.outstanding) return;
    
    const outstanding = loan.outstanding || 0;
    const quickAmount = Math.round((outstanding * percentage) * 100) / 100;
    
    if (quickAmount <= 0) return;
    
    setAmount(quickAmount.toString());
    setSelectedQuickAmount(percentage);
    
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

    // Go directly to Razorpay payment (no modal)
    setProcessing(true);
    try {
      await processRazorpayRepayment(loanId, parseFloat(amount));
      // Payment was successful, refresh loan data and navigate
      await fetchLoanData(); // Refresh loan data to show updated outstanding amount
      setProcessing(false);
      navigate(`/loan/${loanId}`);
    } catch (error) {
      console.error('Error making payment:', error);
      setProcessing(false);
      // Only show error modal for actual payment failures
      if (error.message && error.message.includes('Payment failed')) {
        showError('Payment Failed', 'Payment failed. Please try again.');
      } else {
        // For other errors (like API failures), just log them and navigate
        console.error('Non-payment error:', error);
        navigate(`/loan/${loanId}`);
      }
    }
  };

  const processRazorpayRepayment = async (loanId, amount) => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return new Promise((resolve, reject) => {
      script.onload = () => {
        const options = {
          key: 'rzp_test_1DP5mmOlF5G5ag', // Test key
          amount: amount * 100, // Amount in paisa
          currency: 'INR',
          name: 'Lend & Borrow',
          description: 'Loan Repayment',
          image: '/logo.png',
          theme: {
            color: "#0b1540"
          },
          handler: async function (response) {
            // Razorpay payment was successful, resolve immediately
            resolve();
            
            // Record the payment in our system in the background (don't wait for it)
            makePayment(loanId, amount).catch(error => {
              console.warn('Payment recorded in Razorpay but failed to update our system:', error);
              // This is not critical since the payment was successful
            });
          },
          prefill: {
            name: user?.name || 'Test User',
            email: user?.email || 'test@example.com',
            contact: user?.phone || '9999999999'
          },
          theme: {
            color: '#0b1540'
          }
        };

        if (typeof window.Razorpay === 'function') {
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (response) {
            reject(new Error('Payment failed'));
          });
          rzp.open();
        } else {
          console.error('Razorpay not loaded');
          reject(new Error('Payment gateway not loaded. Please refresh the page and try again.'));
        }
      };

      script.onerror = () => {
        reject(new Error('Failed to load Razorpay'));
      };
    });
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
                  {/* Current Excuse Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">Current Excuse Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Excuse Number:</span>
                        <span className="font-medium ml-2">{paymentRequirements?.currentBlock?.blockNumber || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Excuse End Date:</span>
                        <span className="font-medium ml-2">
                          {paymentRequirements?.blockEndDate ? new Date(paymentRequirements.blockEndDate).toLocaleDateString() : 'Not set'}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-700">Outstanding Amount:</span>
                        <span className="font-medium ml-2">{formatCurrency(paymentRequirements?.outstanding || 0)}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Excuse Fee:</span>
                        <span className="font-medium ml-2">{formatCurrency(paymentRequirements?.blockFee || 0)}</span>
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
                      min={paymentRequirements?.minPayment || 1}
                      max={(paymentRequirements?.outstanding || 0) + (paymentRequirements?.blockFee || 0)}
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
                      Minimum: {formatCurrency(1)} | 
                      Maximum: {formatCurrency((loan?.outstanding || 0) + (paymentRequirements?.blockFee || 0))}
                    </p>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div>
                    <label className="form-label">Quick Amounts</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        { label: '25% Payment', percentage: 0.25 },
                        { label: '50% Payment', percentage: 0.50 },
                        { label: '75% Payment', percentage: 0.75 },
                        { 
                          label: 'Full Amount', 
                          percentage: 1.0
                        }
                      ].map((option, index) => {
                        const isSelected = selectedQuickAmount === option.percentage;
                        const buttonValue = option.percentage ? 
                          (loan && loan.outstanding > 0 ? (loan.outstanding * option.percentage) : 0) : 
                          option.value || 0;
                        
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              if (option.percentage) {
                                handleQuickAmount(option.percentage);
                              } else {
                                setAmount(option.value.toString());
                                setSelectedQuickAmount(null);
                                setErrors({});
                              }
                            }}
                            className={`p-3 text-sm border ${isSelected ? 'border-green-500 bg-green-50 hover:bg-green-100' : 'border-gray-300 hover:bg-gray-50'} rounded-lg transition-colors`}
                          >
                            {option.label}
                            <br />
                            <span className={`font-medium ${isSelected ? 'text-green-700' : ''}`}>
                              {formatCurrency(buttonValue)}
                            </span>
                          </button>
                        );
                      })}
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
                    <h4 className="font-medium text-gray-900 mb-2">Current Excuse</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Excuse Number:</span>
                        <span className="font-medium">{paymentRequirements?.currentBlock?.blockNumber || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>End Date:</span>
                        <span className="font-medium">
                          {paymentRequirements?.blockEndDate ? new Date(paymentRequirements.blockEndDate).toLocaleDateString() : 'Not set'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Amounts</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Outstanding:</span>
                        <span className="font-medium">{formatCurrency(loan?.outstanding || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Excuse Fee:</span>
                        <span className="font-medium">{formatCurrency(paymentRequirements?.blockFee || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Full Payment:</span>
                        <span className="font-medium text-green-600">Available anytime</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Total Outstanding:</span>
                        <span className="font-bold text-lg">{formatCurrency(loan?.outstanding || 0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Important</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          You must pay at least the minimum amount by the excuse end date to avoid additional fees and CIBIL reporting.
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






