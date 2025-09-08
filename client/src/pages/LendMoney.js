import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoan } from '../contexts/LoanContext';
import { 
  CurrencyDollarIcon, 
  CalculatorIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  PhoneIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import ContactSelector from '../components/ContactSelector';
import LoanRequestsList from '../components/LoanRequestsList';
import toast from 'react-hot-toast';

const LendMoney = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loanDetails, setLoanDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' or 'requests'
  const [loanRequests, setLoanRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const { createLoan, fundEscrow, getLoanRequests } = useLoan();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (activeTab === 'requests') {
      fetchLoanRequests();
    }
  }, [activeTab]);
  
  const fetchLoanRequests = async () => {
    setLoadingRequests(true);
    try {
      const requests = await getLoanRequests();
      setLoanRequests(requests);
    } catch (error) {
      console.error('Error fetching loan requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const calculateFees = (principal) => {
    const platformFee = Math.round(principal * 0.01 * 100) / 100; // 1% platform fee
    const totalAmount = principal + platformFee;
    return { platformFee, totalAmount };
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedContact) {
      newErrors.contact = 'Please select a friend to lend to';
    }

    if (!amount || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (amount < 100) {
      newErrors.amount = 'Minimum loan amount is ₹100';
    } else if (amount > 100000) {
      newErrors.amount = 'Maximum loan amount is ₹1,00,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const principal = parseFloat(amount);
    const { platformFee, totalAmount } = calculateFees(principal);
    
    setLoanDetails({
      borrowerId: selectedContact.id,
      borrowerName: selectedContact.name,
      borrowerPhone: selectedContact.phone,
      principal,
      platformFee,
      totalAmount
    });
    
    setShowConfirmModal(true);
  };

  const handleConfirmLoan = async () => {
    setLoading(true);
    try {
      // Create loan
      const loan = await createLoan(loanDetails.borrowerId, loanDetails.principal);
      
      // Fund escrow (mock payment)
      await fundEscrow(loan.id);
      
      toast.success('Loan created and escrow funded successfully!');
      navigate(`/loan/${loan.id}`);
    } catch (error) {
      console.error('Error creating loan:', error);
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
  };

  const handleContactClear = () => {
    setSelectedContact(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lend Money
          </h1>
          <p className="text-gray-600">
            Create a loan for a friend or respond to loan requests
          </p>
        </div>
        
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('direct')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'direct'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Direct Lending
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'requests'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Loan Requests
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'direct' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Loan Form */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Create New Loan
                  </h2>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Select Friend */}
                  <div>
                    <label className="form-label">
                      Choose Friend to Lend To
                    </label>
                    <ContactSelector
                      onSelectContact={handleContactSelect}
                      selectedContact={selectedContact}
                      onClear={handleContactClear}
                    />
                    {errors.contact && (
                      <p className="form-error">{errors.contact}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      Search your contacts or enter a phone number. Only friends registered on PaySafe can receive loans.
                    </p>
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
                        <span>Block Length:</span>
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
                    disabled={loading || !selectedContact}
                    className="btn-primary w-full flex items-center justify-center disabled:opacity-50"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        Create Loan
                        <ArrowRightIcon className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Loan Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  Loan Summary
                </h3>
              </div>
              <div className="card-body">
                {amount && selectedContact ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {selectedContact.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedContact.name}
                        </p>
                        <div className="flex items-center space-x-1">
                          <PhoneIcon className="w-3 h-3 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            {selectedContact.phone}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Principal Amount:</span>
                          <span className="font-medium">₹{parseFloat(amount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Platform Fee (1%):</span>
                          <span className="font-medium">₹{calculateFees(parseFloat(amount)).platformFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-medium text-gray-900">Total to Fund:</span>
                          <span className="font-bold text-lg">₹{calculateFees(parseFloat(amount)).totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start">
                        <ShieldCheckIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Escrow Protection</p>
                          <p className="text-sm text-blue-700">
                            Funds are held in escrow until borrower accepts terms
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalculatorIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Select a borrower and enter amount to see loan summary
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        ) : (
          <div>
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">
                  Pending Loan Requests
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Review and accept loan requests from borrowers
                </p>
              </div>
              <div className="card-body">
                <LoanRequestsList 
                  loanRequests={loanRequests}
                  loading={loadingRequests}
                  onRequestAccepted={() => {
                    fetchLoanRequests();
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Loan Creation
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {loanDetails.borrowerName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{loanDetails.borrowerName}</p>
                    <div className="flex items-center space-x-1">
                      <PhoneIcon className="w-3 h-3 text-gray-400" />
                      <p className="text-sm text-gray-500">{loanDetails.borrowerPhone}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Principal:</span>
                  <span className="font-medium">₹{loanDetails.principal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Fee:</span>
                  <span className="font-medium">₹{loanDetails.platformFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total to Fund:</span>
                  <span className="font-bold text-lg">₹{loanDetails.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This is a demo. The payment will be simulated and funds will be held in escrow until the borrower accepts the loan terms.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLoan}
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    'Create & Fund Loan'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LendMoney;


