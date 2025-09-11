import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLoan } from '../contexts/LoanContext';
import { downloadLoanPDF } from '../utils/pdfExport';
import toast from 'react-hot-toast';
import { 
  BanknotesIcon, 
  ClockIcon, 
  ChartBarIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
// Toast notifications replaced with modals

const LoanDetail = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { fetchLoanById, getLoanLedger, getLoanBlocks, fundEscrow, acceptLoanTerms } = useLoan();
  
  // Check if coming from KYC with T&C modal flag
  const [showTermsModal, setShowTermsModal] = useState(location.state?.showTermsModal || false);
  
  const [loan, setLoan] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [fundingLoan, setFundingLoan] = useState(false);

  useEffect(() => {
    fetchLoanData();
  }, [loanId]);

  const fetchLoanData = async () => {
    setLoading(true);
    try {
      const [loanData, ledgerData, blocksData] = await Promise.all([
        fetchLoanById(loanId),
        getLoanLedger(loanId),
        getLoanBlocks(loanId)
      ]);
      
      setLoan(loanData);
      setLedger(ledgerData);
      setBlocks(blocksData);
    } catch (error) {
      console.error('Error fetching loan data:', error);
      console.error('Failed to fetch loan details');
    } finally {
      setLoading(false);
    }
  };

  const handleFundLoan = async () => {
    setFundingLoan(true);
    try {
      // Show mock Razorpay payment UI
      const options = {
        key: "rzp_test_1DP5mmOlF5G5ag", // Test key
        amount: Math.round((loan.principal + loan.initialPlatformFee) * 100), // Amount in paise
        currency: "INR",
        name: "Lend & Borrow",
        description: `Funding loan to ${loan.borrower?.name || 'borrower'}`,
        image: "/logo.png",
        theme: {
          color: "#0b1540"
        },
        handler: async function (response) {
          try {
            // Process the payment response
            await fundEscrow(loanId);
            console.log('Loan funded successfully!');
            // Refresh loan data
            await fetchLoanData();
          } catch (error) {
            console.error('Error processing payment:', error);
            toast('Payment failed to process', { icon: '❌' });
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || ""
        },
        theme: {
          color: "#3399cc"
        },
        modal: {
          ondismiss: function() {
            setFundingLoan(false);
            toast('Payment cancelled', { icon: '❌' });
          }
        }
      };
      
      // Open Razorpay
      if (typeof window.Razorpay === 'function') {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        console.error('Razorpay not loaded');
        toast('Payment gateway not loaded. Please refresh the page and try again.', { icon: '❌' });
      }
    } catch (error) {
      console.error('Error funding loan:', error);
      toast('Failed to fund loan. Please try again.', { icon: '❌' });
      setFundingLoan(false);
    }
  };

  const handleCompleteKYC = () => {
    navigate('/kyc', { state: { fromDirectLoan: loanId, flowType: 'direct' } });
  };

  const handleAcceptLoan = async () => {
    // Only allow accepting if KYC is verified
    if (user.kycStatus !== 'VERIFIED') {
      handleCompleteKYC();
      return;
    }

    // Show T&C modal
    setShowTermsModal(true);
  };
  
  const handleConfirmAccept = async () => {
    setLoading(true);
    try {
      await acceptLoanTerms(loanId);
      toast('Loan accepted successfully!', { icon: '✅' });
      setShowTermsModal(false);
      // Refresh loan data
      await fetchLoanData();
    } catch (error) {
      console.error('Error accepting loan:', error);
      toast(error.response?.data?.error?.message || 'Failed to accept loan', { icon: '❌' });
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'COMPLETED': return 'text-blue-600 bg-blue-100';
      case 'PENDING_BORROWER_ACCEPT': return 'text-yellow-600 bg-yellow-100';
      case 'PENDING_LENDER_FUNDING': return 'text-orange-600 bg-orange-100';
      case 'DEFAULT_REPORTED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBlockStatus = (block) => {
    if (block.evaluated) {
      return block.satisfied ? 'Satisfied' : 'Defaulted';
    }
    const now = new Date();
    if (now < block.startDate) return 'Upcoming';
    if (now <= block.endDate) return 'Current';
    return 'Overdue';
  };

  const getBlockStatusColor = (block) => {
    const status = getBlockStatus(block);
    switch (status) {
      case 'Satisfied': return 'text-green-600 bg-green-100';
      case 'Defaulted': return 'text-red-600 bg-red-100';
      case 'Current': return 'text-blue-600 bg-blue-100';
      case 'Overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!loan) {
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

  const isLender = loan.lenderId === user.id;
  const isBorrower = loan.borrowerId === user.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Loan Details
              </h1>
              <p className="text-gray-600">
                Loan ID: {loan.id}
              </p>
            </div>
            <div className="text-right">
              <span className={`status-badge ${getStatusColor(loan.status).replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                {loan.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loan Summary */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">Loan Summary</h2>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Loan Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Principal Amount:</span>
                        <span className="font-medium">{formatCurrency(loan.principal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Platform Fee:</span>
                        <span className="font-medium">{formatCurrency(loan.initialPlatformFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Outstanding:</span>
                        <span className="font-medium">{formatCurrency(loan.outstanding)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Paid:</span>
                        <span className="font-medium">{formatCurrency(loan.totalPaymentsMade)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Participants</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Lender:</span>
                        <span className="font-medium ml-2">{loan.lender?.name || loan.lenderId || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Borrower:</span>
                        <span className="font-medium ml-2">{loan.borrower?.name || loan.borrowerId || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium ml-2">{formatDate(loan.createdAt)}</span>
                      </div>
                      {loan.disbursedAt && (
                        <div>
                          <span className="text-gray-600">Disbursed:</span>
                          <span className="font-medium ml-2">{formatDate(loan.disbursedAt)}</span>
                        </div>
                      )}
                      {loan.dueAt && (
                        <div>
                          <span className="text-gray-600">Due Date:</span>
                          <span className="font-medium ml-2">{formatDate(loan.dueAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="card">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  {[
                    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
                    { id: 'timeline', name: 'Timeline', icon: ClockIcon },
                    { id: 'ledger', name: 'Ledger', icon: DocumentTextIcon }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? 'border-teal-500 text-teal-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-2" />
                        {tab.name}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="card-body">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {loan.status === 'PENDING_BORROWER_ACCEPT' && loan.escrowStatus === 'PENDING' && isLender && !loan.borrower?.kycVerified && !loan.termsAcceptedAt && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <ClockIcon className="w-5 h-5 text-blue-600 mr-3" />
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-blue-800">
                              Waiting for Borrower to Accept and Complete KYC
                            </h3>
                            <p className="text-sm text-blue-700 mt-1">
                              The borrower needs to accept your loan offer and complete KYC verification before you can fund the loan.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {((loan.status === 'PENDING_LENDER_FUNDING') || 
                      (loan.status === 'PENDING_BORROWER_ACCEPT' && loan.borrower?.kycVerified && loan.termsAcceptedAt)) && 
                      loan.escrowStatus === 'PENDING' && isLender && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-green-800">
                              Ready to Fund Loan
                            </h3>
                            <p className="text-sm text-green-700 mt-1">
                              {loan.status === 'PENDING_LENDER_FUNDING' 
                                ? 'The borrower has accepted your loan offer and completed KYC verification. You can now fund the loan.'
                                : loan.termsAcceptedAt 
                                  ? 'The borrower has accepted your offer and completed KYC verification. You can now fund the loan.'
                                  : 'The borrower has completed KYC verification but has not yet accepted your offer.'
                              }
                            </p>
                            <div className="mt-3">
                              {(loan.status === 'PENDING_LENDER_FUNDING' || loan.termsAcceptedAt) && (
                                <button
                                  onClick={handleFundLoan}
                                  disabled={fundingLoan}
                                  className="btn-success text-sm flex items-center"
                                >
                                  {fundingLoan ? (
                                    <LoadingSpinner size="sm" />
                                  ) : (
                                    <>
                                      <BanknotesIcon className="w-4 h-4 mr-2" />
                                      Fund Loan (₹{formatCurrency(loan.principal + loan.initialPlatformFee).replace('₹', '')})
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {loan.status === 'PENDING_LENDER_FUNDING' && isBorrower && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <ClockIcon className="w-5 h-5 text-orange-600 mr-3" />
                          <div>
                            <h3 className="text-sm font-medium text-orange-800">
                              Waiting for Lender to Fund
                            </h3>
                            <p className="text-sm text-orange-700 mt-1">
                              You have accepted the loan terms. The lender will fund the loan shortly, and you'll receive the funds.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {loan.status === 'PENDING_BORROWER_ACCEPT' && isBorrower && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-3" />
                          <div>
                            <h3 className="text-sm font-medium text-yellow-800">
                              {user.kycStatus !== 'VERIFIED' 
                                ? 'KYC Required Before Acceptance' 
                                : 'Loan Pending Your Acceptance'
                              }
                            </h3>
                            <p className="text-sm text-yellow-700 mt-1">
                              {user.kycStatus !== 'VERIFIED'
                                ? 'You must complete KYC verification before you can accept this loan offer.'
                                : 'The lender has created a loan offer for you. You can now accept the loan terms.'
                              }
                            </p>
                            <div className="mt-3 space-x-3">
                              <button
                                onClick={user.kycStatus !== 'VERIFIED' ? handleCompleteKYC : handleAcceptLoan}
                                disabled={loading}
                                className="btn-success text-sm flex items-center"
                              >
                                {loading ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <>
                                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                                    {user.kycStatus !== 'VERIFIED' ? 'Complete KYC' : 'Accept Loan'}
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {loan.status === 'ACTIVE' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h3 className="font-medium text-blue-900 mb-2">Current Block</h3>
                          {loan.currentBlock ? (
                            <div className="space-y-1 text-sm text-blue-700">
                              <div>Block {loan.currentBlock.blockNumber}</div>
                              <div>Ends: {formatDate(loan.currentBlock.endDate)}</div>
                              <div>Min Payment: {formatCurrency(loan.outstanding * 0.20)}</div>
                            </div>
                          ) : (
                            <div className="text-sm text-blue-700">No active block</div>
                          )}
                        </div>

                        {isBorrower && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h3 className="font-medium text-green-900 mb-2">Payment Options</h3>
                            <div className="space-y-2">
                              <button
                                onClick={() => navigate(`/repayment/${loan.id}`)}
                                className="btn-primary w-full text-sm"
                              >
                                Make Payment
                              </button>
                              <button
                                onClick={() => navigate(`/collection/${loan.id}`)}
                                className="btn-outline w-full text-sm"
                              >
                                View Communications
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {isLender && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-medium text-blue-900 mb-2">Lender Actions</h3>
                            <div className="space-y-2">
                              <button
                                onClick={() => navigate(`/collection/${loan.id}`)}
                                className="btn-outline w-full text-sm"
                              >
                                View Communications
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {loan.status === 'COMPLETED' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                          <div>
                            <h3 className="text-sm font-medium text-green-800">
                              Loan Completed Successfully
                            </h3>
                            <p className="text-sm text-green-700 mt-1">
                              This loan has been fully repaid. No further action required.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {loan.status === 'DEFAULT_REPORTED' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-3" />
                          <div>
                            <h3 className="text-sm font-medium text-red-800">
                              Loan in Default
                            </h3>
                            <p className="text-sm text-red-700 mt-1">
                              This loan has been reported to CIBIL due to missed payments.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Timeline Tab */}
                {activeTab === 'timeline' && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 mb-4">Payment Timeline</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-blue-800 mb-2">Repayment Schedule</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Repayment Date:</span>
                          <span className="font-medium">{loan.dueAt ? formatDate(loan.dueAt) : 'To be determined'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Grace Period:</span>
                          <span className="font-medium">10 days after repayment date</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Block Calculation:</span>
                          <span className="font-medium">Starts after grace period</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700 font-medium">Full Payment:</span>
                          <span className="font-medium text-green-700">Available anytime without penalty</span>
                        </div>
                      </div>
                    </div>
                    {blocks.map((block, index) => (
                      <div key={block.blockNumber} className="flex items-start space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          getBlockStatusColor(block).replace('text-', 'text-').replace('bg-', 'bg-')
                        }`}>
                          {block.blockNumber}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">
                              Block {block.blockNumber}
                              {block.isMainGrace && ' (Grace Period)'}
                            </h4>
                            <span className={`status-badge ${getBlockStatusColor(block).replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                              {getBlockStatus(block)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <div>Period: {formatDate(block.startDate)} - {formatDate(block.endDate)}</div>
                            {block.evaluated && (
                              <div className="mt-2 space-y-1">
                                <div>Outstanding at start: {formatCurrency(block.outstandingAtStart)}</div>
                                <div>Fee applied: {formatCurrency(block.feeApplied)}</div>
                                <div>Payment made: {formatCurrency(block.paidDuringBlock)}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ledger Tab */}
                {activeTab === 'ledger' && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 mb-4">Transaction Ledger</h3>
                    {ledger.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {ledger.map((entry) => (
                              <tr key={entry.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatDate(entry.date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`status-badge ${
                                    entry.type === 'principal' ? 'bg-blue-100 text-blue-800' :
                                    entry.type === 'fee' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {entry.type}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {entry.description}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {formatCurrency(entry.amount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No transactions yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  {loan.status === 'ACTIVE' && isBorrower && (
                    <button
                      onClick={() => navigate(`/repayment/${loan.id}`)}
                      className="btn-primary w-full"
                    >
                      Make Payment
                    </button>
                  )}
                  
                  <button
                    onClick={() => navigate(`/collection/${loan.id}`)}
                    className="btn-outline w-full"
                  >
                    View Communications
                  </button>
                  
                  <button
                    onClick={() => downloadLoanPDF(loan)}
                    className="btn-secondary w-full"
                  >
                    Export PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Loan Statistics */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Statistics</h3>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-medium">
                      {Math.round(((loan.principal - loan.outstanding) / loan.principal) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fees Paid:</span>
                    <span className="font-medium">{formatCurrency(loan.totalFeesPaid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Days Active:</span>
                    <span className="font-medium">
                      {loan.disbursedAt ? Math.floor((new Date() - new Date(loan.disbursedAt)) / (1000 * 60 * 60 * 24)) : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Terms and Conditions Modal */}
      {showTermsModal && loan && (
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
                      <span className="font-semibold text-gray-900">{formatCurrency(loan.principal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform Fee (1%)</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(loan.initialPlatformFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount</span>
                      <span className="font-bold text-teal-600">{formatCurrency(loan.principal + loan.initialPlatformFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lender</span>
                      <span className="font-semibold text-gray-900">{loan.lender?.name || 'Lender'}</span>
                    </div>
                  </div>
                </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Terms & Conditions</h4>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>1. <strong>Repayment Date:</strong> {loan.dueAt ? new Date(loan.dueAt).toLocaleDateString() : 'To be determined'}</p>
                      <p>2. <strong>Grace Period:</strong> 10 days after repayment date</p>
                      <p>3. <strong>Block Structure:</strong> 4 blocks of 10 days each after grace period</p>
                      <p>4. <strong>Block Fees:</strong> 1% of outstanding amount per block if minimum payment not made</p>
                      <p>5. <strong>Full Payment:</strong> You can pay the full amount at any time without penalty</p>
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
                        by block end dates will result in additional fees and potential CIBIL reporting.
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
  );
};

export default LoanDetail;
