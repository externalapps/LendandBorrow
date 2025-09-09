import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLoan } from '../contexts/LoanContext';
import { downloadLoanPDF } from '../utils/pdfExport';
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
import toast from 'react-hot-toast';

const LoanDetail = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchLoanById, getLoanLedger, getLoanBlocks } = useLoan();
  
  const [loan, setLoan] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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
                    {loan.status === 'PENDING_BORROWER_ACCEPT' && isBorrower && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-3" />
                          <div>
                            <h3 className="text-sm font-medium text-yellow-800">
                              Loan Pending Your Acceptance
                            </h3>
                            <p className="text-sm text-yellow-700 mt-1">
                              The lender has funded the escrow. You need to accept the loan terms to receive the funds.
                            </p>
                            <div className="mt-3 space-x-3">
                              <button
                                onClick={() => navigate(`/borrow`)}
                                className="btn-success text-sm"
                              >
                                Accept Loan
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
                              {block.isMainGrace && ' (Main Grace Period)'}
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
                                <div>Min payment required: {formatCurrency(block.minPaymentRequired)}</div>
                                <div>Paid during block: {formatCurrency(block.paidDuringBlock)}</div>
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
    </div>
  );
};

export default LoanDetail;
