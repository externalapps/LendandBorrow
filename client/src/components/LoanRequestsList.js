import React, { useState } from 'react';
import { 
  CurrencyDollarIcon, 
  UserIcon,
  PhoneIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useLoan } from '../contexts/LoanContext';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const LoanRequestsList = ({ loanRequests, onRequestAccepted, loading }) => {
  const [processingId, setProcessingId] = useState(null);
  const { acceptLoanRequest } = useLoan();

  const handleAcceptRequest = async (requestId) => {
    setProcessingId(requestId);
    try {
      await acceptLoanRequest(requestId);
      toast.success('Loan request accepted successfully!');
      if (onRequestAccepted) {
        onRequestAccepted(requestId);
      }
    } catch (error) {
      console.error('Error accepting loan request:', error);
      toast.error('Failed to accept loan request');
    } finally {
      setProcessingId(null);
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
                      {formatCurrency(request.principal + request.initialPlatformFee)}
                    </p>
                  </div>
                </div>

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
                <button
                  onClick={() => handleAcceptRequest(request.id)}
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
