import React, { useState } from 'react';
import { 
  BanknotesIcon, 
  UserIcon,
  PhoneIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useLoan } from '../contexts/LoanContext';
import { useModal } from '../contexts/ModalContext';
import LoadingSpinner from './LoadingSpinner';
import CibilScoreDisplay from './CibilScoreDisplay';

const LoanRequestsList = ({ loanRequests, onRequestAccepted, loading }) => {
  const [processingId, setProcessingId] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [repaymentDate, setRepaymentDate] = useState('');
  const { acceptLoanRequest, completeLoanPayment } = useLoan();
  const { showSuccess, showError, showPayment } = useModal();

  const openDateSelectionModal = (requestId) => {
    setSelectedRequestId(requestId);
    // Set default date to 30 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    setRepaymentDate(defaultDate.toISOString().split('T')[0]);
    setShowDateModal(true);
  };

  const handleAcceptRequest = async () => {
    if (!selectedRequestId || !repaymentDate) return;
    
    setProcessingId(selectedRequestId);
    try {
      await acceptLoanRequest(selectedRequestId, new Date(repaymentDate));
      setShowDateModal(false);
      showSuccess('Loan Accepted', 'Loan request accepted! Please complete payment to fund the loan.');
      if (onRequestAccepted) {
        onRequestAccepted(selectedRequestId);
      }
    } catch (error) {
      console.error('Error accepting loan request:', error);
      showError('Error', 'Failed to accept loan request');
    } finally {
      setProcessingId(null);
    }
  };

  const handlePayNow = (requestId) => {
    const request = loanRequests.find(r => r.id === requestId);
    if (!request) return;

    showPayment(request.principal, async () => {
      setProcessingId(requestId);
      try {
        await processRazorpayPayment(requestId, request.principal);
        showSuccess('Payment Successful', `Payment of ₹${request.principal.toLocaleString()} completed successfully! Loan is now active.`);
        if (onRequestAccepted) {
          onRequestAccepted(requestId);
        }
      } catch (error) {
        console.error('Error completing payment:', error);
        showError('Payment Failed', 'Payment failed. Please try again.');
      } finally {
        setProcessingId(null);
      }
    });
  };

  const processRazorpayPayment = async (requestId, amount) => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return new Promise((resolve, reject) => {
      script.onload = () => {
        const options = {
          key: 'rzp_test_1DP5mmOlF5G5ag', // Test key - replace with your actual key
          amount: amount * 100, // Amount in paisa
          currency: 'INR',
          name: 'Lend & Borrow',
          description: 'Loan Funding Payment',
          image: '/logo.png',
          handler: async function (response) {
            try {
              const mockPaymentId = response.razorpay_payment_id;
              await completeLoanPayment(requestId, mockPaymentId, 'Razorpay');
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          prefill: {
            name: 'Test User',
            email: 'test@example.com',
            contact: '9999999999'
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (loanRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Loan Requests
        </h3>
        <p className="text-gray-600">
          There are currently no pending loan requests.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Repayment Date Selection Modal */}
      {showDateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Set Repayment Date
            </h3>
            
            <div className="space-y-4 mb-6">
              <p className="text-sm text-gray-600">
                Please select the date when the borrower should repay the loan. This date will be used to calculate the repayment schedule and grace period.
              </p>
              
              <div>
                <label htmlFor="repaymentDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Repayment Date
                </label>
                <input
                  id="repaymentDate"
                  type="date"
                  value={repaymentDate}
                  onChange={(e) => setRepaymentDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  min={new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 7 days from today
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDateModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptRequest}
                disabled={!repaymentDate || processingId === selectedRequestId}
                className="btn-primary flex-1 flex items-center justify-center"
              >
                {processingId === selectedRequestId ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Accept & Continue'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {loanRequests.map((request) => (
        <div key={request.id} className="card">
          <div className="card-body">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.borrower?.name || 'Unknown User'}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <PhoneIcon className="w-3 h-3 text-gray-400 mr-1" />
                        <p className="text-sm text-gray-500">
                          {request.borrower?.phone || 'No phone'}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {request.borrower?.kycVerified ? (
                          <div className="flex items-center text-green-600">
                            <ShieldCheckIcon className="w-4 h-4 mr-1" />
                            <span className="text-xs font-medium">KYC Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-yellow-600">
                            <ShieldExclamationIcon className="w-4 h-4 mr-1" />
                            <span className="text-xs font-medium">KYC Not Verified</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Requested Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(request.principal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Platform Fee (1%)</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {formatCurrency(request.initialPlatformFee)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(request.principal)}
                    </p>
                  </div>
                </div>
                
                {request.dueAt && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-blue-800">Repayment Date</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          {new Date(request.dueAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Loan Purpose</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {request.purpose || 'No purpose provided'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Repayment Plan</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {request.repaymentPlan || 'No repayment plan provided'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-3 ml-6">
                {/* CIBIL Score Display for Lender */}
                {request.status === 'LOAN_REQUEST' && (
                  <div className="mb-4">
                    <CibilScoreDisplay 
                      borrowerId={request.borrowerId} 
                      borrowerName={request.borrowerName} 
                    />
                  </div>
                )}
                
                {request.status === 'LOAN_REQUEST' ? (
                  <button
                    onClick={() => openDateSelectionModal(request.id)}
                    disabled={processingId === request.id}
                    className="btn-primary flex items-center justify-center"
                  >
                    {processingId === request.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        Accept Request
                      </>
                    )}
                  </button>
                ) : request.status === 'PENDING_PAYMENT' ? (
                  <button
                    onClick={() => handlePayNow(request.id)}
                    disabled={processingId === request.id}
                    className="btn-success flex items-center justify-center"
                  >
                    {processingId === request.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <BanknotesIcon className="w-5 h-5 mr-2" />
                        Fund Loan
                      </>
                    )}
                  </button>
                ) : null}
                <p className="text-xs text-center text-gray-500">
                  {request.borrower?.kycVerified 
                    ? 'KYC verified' 
                    : 'KYC not verified'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoanRequestsList;
