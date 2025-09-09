import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const LoanContext = createContext();

export const useLoan = () => {
  const context = useContext(LoanContext);
  if (!context) {
    throw new Error('useLoan must be used within a LoanProvider');
  }
  return context;
};

export const LoanProvider = ({ children }) => {
  const [loans, setLoans] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchLoans = async (type = null, status = null) => {
    try {
      setLoading(true);
      const params = {};
      if (type) params.type = type;
      if (status) params.status = status;

      const response = await api.get('/loans', { params });
      setLoans(response.data.loans);
      return response.data.loans;
    } catch (error) {
      console.error('Fetch loans error:', error);
      toast.error('Failed to fetch loans');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchLoanById = async (loanId) => {
    try {
      const response = await api.get(`/loans/${loanId}`);
      return response.data.loan;
    } catch (error) {
      console.error('Fetch loan error:', error);
      toast.error('Failed to fetch loan details');
      return null;
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/users/dashboard/summary');
      setDashboardData(response.data.summary);
      return response.data.summary;
    } catch (error) {
      console.error('Fetch dashboard error:', error);
      return null;
    }
  };

  const createLoan = async (borrowerId, principal) => {
    try {
      const response = await api.post('/loans', { borrowerId, principal });
      toast.success('Loan created successfully!');
      await fetchLoans();
      await fetchDashboardData();
      return response.data.loan;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to create loan';
      toast.error(message);
      throw error;
    }
  };

  const fundEscrow = async (loanId) => {
    try {
      const response = await api.post(`/loans/${loanId}/fund-escrow`);
      toast.success('Escrow funded successfully!');
      await fetchLoans();
      await fetchDashboardData();
      return response.data.loan;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to fund escrow';
      toast.error(message);
      throw error;
    }
  };

  const acceptLoanTerms = async (loanId) => {
    try {
      const response = await api.post(`/loans/${loanId}/accept`);
      toast.success('Loan terms accepted successfully!');
      await fetchLoans();
      await fetchDashboardData();
      return response.data.loan;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to accept loan terms';
      toast.error(message);
      throw error;
    }
  };

  const makePayment = async (loanId, amount) => {
    try {
      const response = await api.post(`/loans/${loanId}/payment`, { amount });
      toast.success('Payment made successfully!');
      await fetchLoans();
      await fetchDashboardData();
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to make payment';
      toast.error(message);
      throw error;
    }
  };

  const cancelLoan = async (loanId) => {
    try {
      const response = await api.post(`/loans/${loanId}/cancel`);
      toast.success('Loan cancelled successfully!');
      await fetchLoans();
      await fetchDashboardData();
      return response.data.loan;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to cancel loan';
      toast.error(message);
      throw error;
    }
  };

  const getPendingOffers = async () => {
    try {
      const response = await api.get('/loans/pending/offers');
      return response.data.loans;
    } catch (error) {
      console.error('Fetch pending offers error:', error);
      return [];
    }
  };

  const getPaymentRequirements = async (loanId) => {
    try {
      const response = await api.get(`/loans/${loanId}/payment-requirements`);
      return response.data;
    } catch (error) {
      console.error('Fetch payment requirements error:', error);
      return null;
    }
  };

  const getLoanLedger = async (loanId) => {
    try {
      const response = await api.get(`/loans/${loanId}/ledger`);
      return response.data.ledger;
    } catch (error) {
      console.error('Fetch loan ledger error:', error);
      return [];
    }
  };

  const getLoanBlocks = async (loanId) => {
    try {
      const response = await api.get(`/loans/${loanId}/blocks`);
      return response.data.blocks;
    } catch (error) {
      console.error('Fetch loan blocks error:', error);
      return [];
    }
  };

  const requestLoan = async (loanRequest) => {
    try {
      const response = await api.post('/loans/request', loanRequest);
      toast.success('Loan request submitted successfully!');
      await fetchLoans();
      await fetchDashboardData();
      return response.data.loanRequest;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to submit loan request';
      toast.error(message);
      throw error;
    }
  };
  
  const getLoanRequests = async () => {
    try {
      const response = await api.get('/loans/requests');
      return response.data.loanRequests;
    } catch (error) {
      console.error('Fetch loan requests error:', error);
      return [];
    }
  };
  
  const acceptLoanRequest = async (requestId) => {
    try {
      const response = await api.post(`/loans/requests/${requestId}/accept`);
      toast.success('Loan request accepted successfully!');
      await fetchLoans();
      await fetchDashboardData();
      return response.data.loan;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to accept loan request';
      toast.error(message);
      throw error;
    }
  };

  const completeLoanPayment = async (requestId, paymentId, paymentMethod) => {
    try {
      const response = await api.post(`/loans/requests/${requestId}/pay`, {
        paymentId,
        paymentMethod
      });
      toast.success('Payment completed successfully!');
      await fetchLoans();
      await fetchDashboardData();
      return response.data.loan;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to complete payment';
      toast.error(message);
      throw error;
    }
  };

  const value = {
    loans,
    dashboardData,
    loading,
    fetchLoans,
    fetchLoanById,
    fetchDashboardData,
    createLoan,
    fundEscrow,
    acceptLoanTerms,
    makePayment,
    cancelLoan,
    getPendingOffers,
    getPaymentRequirements,
    getLoanLedger,
    getLoanBlocks,
    requestLoan,
    getLoanRequests,
    acceptLoanRequest,
    completeLoanPayment
  };

  return (
    <LoanContext.Provider value={value}>
      {children}
    </LoanContext.Provider>
  );
};



