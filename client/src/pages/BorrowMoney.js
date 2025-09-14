import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLoan } from '../contexts/LoanContext';
import { 
  BanknotesIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import LoanRequestForm from '../components/LoanRequestForm';
import toast from 'react-hot-toast';

const BorrowMoney = () => {
  const { user } = useAuth();
  const [pendingOffers, setPendingOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'offers'); // 'offers' or 'request'
  const [kycVerified, setKycVerified] = useState(location.state?.kycVerified || false);
  const { acceptLoanTerms, cancelLoan, getPendingOffers } = useLoan();
  
  // BIBLE: "B automatically redirects to KYC (same 4 steps) After KYC, B returns to form, enters details, submits request"
  // If user switches to 'request' tab and is not KYC verified, redirect to KYC immediately
  useEffect(() => {
    if (activeTab === 'request' && user?.kycStatus !== 'VERIFIED') {
      navigate('/kyc', { 
        state: { 
          returnTo: '/borrow', 
          flowType: 'request',
          activeTab: 'request'
        } 
      });
    }
  }, [activeTab, user?.kycStatus, navigate]);

  useEffect(() => {
    fetchPendingOffers();
  }, []);

  const fetchPendingOffers = async () => {
    setLoading(true);
    try {
      const offers = await getPendingOffers();
      setPendingOffers(offers);
    } catch (error) {
      console.error('Error fetching pending offers:', error);
      toast.error('Failed to fetch pending offers');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptLoan = (loan) => {
    setSelectedLoan(loan);
    setShowTermsModal(true);
  };

  const handleConfirmAccept = async () => {
    if (!selectedLoan) return;

    // BIBLE: "B automatically redirects to KYC" - ALWAYS, no exceptions
    toast('Please complete your KYC verification to accept this loan.', {
      icon: 'ℹ️',
    });
    setShowTermsModal(false);
    navigate('/kyc', { state: { fromDirectLoan: selectedLoan.id, flowType: 'direct' } });
  };

  const handleRejectLoan = async (loanId) => {
    if (!window.confirm('Are you sure you want to reject this loan offer?')) {
      return;
    }

    setLoading(true);
    try {
      await cancelLoan(loanId);
      toast.success('Loan offer rejected');
      fetchPendingOffers();
    } catch (error) {
      console.error('Error rejecting loan:', error);
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

  const calculateTotalAmount = (principal, platformFee) => {
    // CORRECT LOGIC: Borrower only repays the principal amount
    // Platform fee is deducted from disbursement, not added to repayment
    return principal;
  };

  if (loading && pendingOffers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Borrow Money
          </h1>
          <p className="text-gray-600">
            Accept loan offers or request money from friends
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('offers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'offers'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Loan Offers ({pendingOffers.length})
              </button>
              <button
                onClick={() => setActiveTab('request')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'request'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Request Loan
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'offers' ? (
          <>
            {/* Pending Offers Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Pending Loan Offers
              </h2>
              <p className="text-gray-600 mb-6">
                Review and accept loan offers from your friends
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Loan Request Form */}
            <div className="mb-12">
              <LoanRequestForm 
                onRequestSubmitted={() => {
                  toast.success('Your loan request has been submitted!');
                  setActiveTab('offers'); // Switch back to offers tab
                  fetchPendingOffers();
                }}
              />
            </div>
          </>
        )}

        {activeTab === 'offers' && (
          <>
            {pendingOffers.length > 0 ? (
          <div className="space-y-6">
            {pendingOffers.map((loan) => (
              <div key={loan.id} className="card">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                          <BanknotesIcon className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Loan from {loan.lender?.name || 'Unknown Lender'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Loan ID: {loan.id}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2">Principal Amount</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {formatCurrency(loan.principal)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2">Platform Fee (1%)</p>
                            <p className="text-xl font-semibold text-gray-900">
                              {formatCurrency(loan.initialPlatformFee)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2">Amount You'll Receive</p>
                            <p className="text-2xl font-bold text-teal-600">
                              {formatCurrency(loan.principal - loan.initialPlatformFee)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Loan Terms</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex justify-between">
                              <span>Repayment Date:</span>
                              <span className="font-medium">{loan.dueAt ? new Date(loan.dueAt).toLocaleDateString() : 'To be determined'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Grace Period:</span>
                              <span className="font-medium">10 days after repayment date</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Excuse Fee Rate:</span>
                              <span className="font-medium">1% per excuse</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Full Payment:</span>
                              <span className="font-medium text-green-600">Available anytime</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Payment Schedule</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex justify-between">
                              <span>Due Date:</span>
                              <span className="font-medium">Day 30</span>
                            </div>
                            <div className="flex justify-between">
                              <span>First Checkpoint:</span>
                              <span className="font-medium">Day 40</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Excuse Length:</span>
                              <span className="font-medium">10 days</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Excuses:</span>
                              <span className="font-medium">4 excuses</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-yellow-800">Important Terms</h4>
                            <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                              <li>• You must make minimum payments by each excuse end date</li>
                              <li>• Missing payments will result in 1% excuse fees</li>
                              <li>• Outstanding amounts may be reported to CIBIL if payments are missed</li>
                              <li>• You can pay more than the minimum amount at any time</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-3 ml-6">
                      <button
                        onClick={() => handleAcceptLoan(loan)}
                        className="btn-success flex items-center justify-center"
                      >
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        Accept Loan
                      </button>
                      <button
                        onClick={() => handleRejectLoan(loan.id)}
                        className="btn-danger flex items-center justify-center"
                      >
                        <XMarkIcon className="w-5 h-5 mr-2" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BanknotesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Pending Loan Offers
            </h3>
            <p className="text-gray-600 mb-6">
              You don't have any pending loan offers at the moment.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/lend')}
                className="btn-primary"
              >
                Lend Money Instead
              </button>
              <button
                onClick={fetchPendingOffers}
                className="btn-outline"
              >
                Refresh
              </button>
            </div>
          </div>
        )}
          </>
        )}

        {/* Terms and Conditions Modal */}
        {showTermsModal && selectedLoan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Loan Terms & Conditions
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Loan Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Principal Amount</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(selectedLoan.principal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Platform Fee (1%)</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(selectedLoan.initialPlatformFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount You'll Receive</span>
                        <span className="font-bold text-teal-600">{formatCurrency(selectedLoan.principal - selectedLoan.initialPlatformFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Repayment</span>
                        <span className="font-bold text-green-600">{formatCurrency(selectedLoan.principal)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Terms & Conditions</h4>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>1. <strong>Loan Term:</strong> 30 days from disbursement date</p>
                      <p>2. <strong>Grace Period:</strong> 10 days after due date (Day 40)</p>
                      <p>3. <strong>Excuse Structure:</strong> 4 excuses of 10 days each after grace period</p>
                      <p>4. <strong>Excuse Fees:</strong> 1% of outstanding amount per excuse if minimum payment not made</p>
                      <p>5. <strong>Minimum Payment:</strong> 20% of outstanding amount per excuse</p>
                      <p>6. <strong>CIBIL Reporting:</strong> Outstanding amounts may be reported to credit bureaus if payments are missed</p>
                      <p>7. <strong>Early Repayment:</strong> You can pay the full amount at any time without penalty</p>
                      <p>8. <strong>Payment Allocation:</strong> Payments are first applied to fees, then to principal</p>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-red-800">Important Notice</h4>
                        <p className="text-sm text-red-700 mt-1">
                          By accepting this loan, you agree to the terms above. Failure to make minimum payments 
                          by excuse end dates will result in additional fees and potential CIBIL reporting.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowTermsModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAccept}
                    disabled={loading}
                    className="btn-success flex-1 flex items-center justify-center"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        Accept & Receive Funds
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BorrowMoney;
