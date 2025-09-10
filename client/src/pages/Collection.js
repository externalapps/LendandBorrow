import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLoan } from '../contexts/LoanContext';
import { communicationAPI } from '../services/api';
import { 
  PhoneIcon, 
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PlayIcon,
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Collection = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchLoanById } = useLoan();
  
  const [loan, setLoan] = useState(null);
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, [loanId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [loanData, communicationsData] = await Promise.all([
        fetchLoanById(loanId),
        communicationAPI.getCommunicationHistory(loanId)
      ]);
      
      setLoan(loanData);
      setCommunications(communicationsData.data.communications || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (type) => {
    if (!loan) return;

    setSending(true);
    try {
      const borrower = loan.borrowerId;
      const borrowerName = borrower.name;
      const borrowerPhone = borrower.phone;
      const borrowerEmail = borrower.email;
      const outstanding = loan.outstanding;
      const minPayment = Math.round(loan.outstanding * 0.20 * 100) / 100;
      const blockEndDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days from now

      let result;
      switch (type) {
        case 'call':
          result = await communicationAPI.sendCall({
            loanId,
            borrowerPhone,
            borrowerName,
            outstanding,
            minPayment,
            blockEndDate
          });
          break;
        case 'sms':
          result = await communicationAPI.sendSMS({
            loanId,
            borrowerPhone,
            borrowerName,
            outstanding,
            minPayment,
            blockEndDate
          });
          break;
        case 'email':
          result = await communicationAPI.sendEmail({
            loanId,
            borrowerEmail,
            borrowerName,
            outstanding,
            minPayment,
            blockEndDate
          });
          break;
        default:
          throw new Error('Invalid communication type');
      }

      toast.success(`${type.toUpperCase()} sent successfully!`);
      fetchData(); // Refresh communications
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error(`Failed to send ${type.toUpperCase()}`);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED': return 'text-green-600 bg-green-100';
      case 'SENT': return 'text-blue-600 bg-blue-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'FAILED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'call': return PhoneIcon;
      case 'sms': return ChatBubbleLeftRightIcon;
      case 'email': return EnvelopeIcon;
      default: return ChatBubbleLeftRightIcon;
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            Communications & Collection
          </h1>
          <p className="text-gray-600">
            Loan ID: {loan.id}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Send Reminders (Lender only) */}
            {isLender && loan.status === 'ACTIVE' && (
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900">Send Payment Reminder</h2>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => sendReminder('call')}
                      disabled={sending}
                      className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <PhoneIcon className="w-6 h-6 text-blue-600 mr-3" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Voice Call</p>
                        <p className="text-sm text-gray-500">Automated call</p>
                      </div>
                    </button>

                    <button
                      onClick={() => sendReminder('sms')}
                      disabled={sending}
                      className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-600 mr-3" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">SMS</p>
                        <p className="text-sm text-gray-500">Text message</p>
                      </div>
                    </button>

                    <button
                      onClick={() => sendReminder('email')}
                      disabled={sending}
                      className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <EnvelopeIcon className="w-6 h-6 text-purple-600 mr-3" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-500">Email reminder</p>
                      </div>
                    </button>
                  </div>

                  {sending && (
                    <div className="mt-4 flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2 text-gray-600">Sending reminder...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Communications History */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">Communication History</h2>
              </div>
              <div className="card-body">
                {communications.length > 0 ? (
                  <div className="space-y-4">
                    {communications.map((comm) => {
                      const Icon = getTypeIcon(comm.type);
                      return (
                        <div key={comm.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <Icon className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900 capitalize">
                                  {comm.type} {comm.type === 'call' ? 'Call' : comm.type === 'sms' ? 'Message' : 'Email'}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {formatDate(comm.sentAt)}
                                </p>
                              </div>
                            </div>
                            <span className={`status-badge ${getStatusColor(comm.status).replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                              {comm.status}
                            </span>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {comm.transcript}
                            </p>
                          </div>

                          {comm.type === 'call' && (
                            <div className="flex items-center space-x-4">
                              <button className="flex items-center text-blue-600 hover:text-blue-800 text-sm">
                                <PlayIcon className="w-4 h-4 mr-1" />
                                Play Call
                              </button>
                              <span className="text-sm text-gray-500">
                                Duration: {Math.floor(Math.random() * 120) + 30}s
                              </span>
                            </div>
                          )}

                          {comm.metadata && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Block:</span>
                                  <span className="font-medium ml-1">{comm.metadata.blockNumber}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Outstanding:</span>
                                  <span className="font-medium ml-1">₹{comm.metadata.outstandingAmount}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Min Payment:</span>
                                  <span className="font-medium ml-1">₹{comm.metadata.minPayment}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Due Date:</span>
                                  <span className="font-medium ml-1">
                                    {new Date(comm.metadata.blockEndDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Communications Yet</h3>
                    <p className="text-gray-600">
                      {isLender 
                        ? 'Send payment reminders to the borrower'
                        : 'Communications from the lender will appear here'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Loan Summary */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Loan Summary</h3>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">{loan.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Outstanding:</span>
                    <span className="font-medium">₹{loan.outstanding.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Borrower:</span>
                    <span className="font-medium">{loan.borrowerId?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lender:</span>
                    <span className="font-medium">{loan.lenderId?.name}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Communication Stats */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Communication Stats</h3>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Communications:</span>
                    <span className="font-medium">{communications.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Calls:</span>
                    <span className="font-medium">
                      {communications.filter(c => c.type === 'call').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SMS:</span>
                    <span className="font-medium">
                      {communications.filter(c => c.type === 'sms').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Emails:</span>
                    <span className="font-medium">
                      {communications.filter(c => c.type === 'email').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <button
                    onClick={() => navigate(`/loan/${loanId}`)}
                    className="btn-outline w-full"
                  >
                    View Loan Details
                  </button>
                  
                  {isBorrower && loan.status === 'ACTIVE' && (
                    <button
                      onClick={() => navigate(`/repayment/${loanId}`)}
                      className="btn-primary w-full"
                    >
                      Make Payment
                    </button>
                  )}
                  
                  <button
                    onClick={fetchData}
                    className="btn-secondary w-full"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;







