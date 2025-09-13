import React, { useState } from 'react';
import { XMarkIcon, BanknotesIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const PaymentModal = ({ isOpen, onClose, amount, onConfirm, loading }) => {
  const [step, setStep] = useState(1); // 1: Confirm, 2: Processing, 3: Success/Error

  const handleConfirm = async () => {
    setStep(2);
    try {
      await onConfirm();
      setStep(3);
    } catch (error) {
      setStep(3);
    }
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Confirm Payment</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BanknotesIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Fund Loan
                </h3>
                <p className="text-gray-600">
                  You are about to fund this loan request
                </p>
              </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Loan Amount:</span>
                  <span className="text-xl font-bold text-gray-900">₹{parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600">Platform Fee (1%):</span>
                  <span className="text-gray-900">₹{Math.round(parseFloat(amount || 0) * 0.01).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600">Amount to Borrower:</span>
                  <span className="text-gray-900">₹{Math.round(parseFloat(amount || 0) * 0.99).toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">You Pay:</span>
                    <span className="text-xl font-bold text-green-600">₹{parseFloat(amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Confirm Payment
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Processing Payment
              </h3>
              <p className="text-gray-600">
                Please wait while we process your payment...
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Payment Successful!
              </h3>
              <p className="text-gray-600 mb-6">
                Your loan has been funded successfully. The borrower will be notified.
              </p>
              <button
                onClick={handleClose}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
