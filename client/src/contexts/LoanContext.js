import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
// Toast notifications replaced with modals

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
      console.error('Failed to fetch loans');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // Make fetchLoans available as a memoized function
  const memoizedFetchLoans = React.useCallback(fetchLoans, []);

  const fetchLoanById = async (loanId) => {
    try {
      const response = await api.get(`/loans/${loanId}`);
      return response.data.loan;
    } catch (error) {
      console.error('Fetch loan error:', error);
      console.error('Failed to fetch loan details');
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
  
  // Make fetchDashboardData available as a memoized function
  const memoizedFetchDashboardData = React.useCallback(fetchDashboardData, []);

  const createLoan = async (borrowerId, principal, repaymentDate) => {
    try {
      const response = await api.post('/loans', { borrowerId, principal, repaymentDate });
      console.log('Loan created successfully!', response.data);
      
      // Ensure we have the loan object with ID
      const loan = response.data.loan || response.data;
      if (!loan.id && !loan._id) {
        throw new Error('Loan created but no ID returned');
      }
      
      await fetchLoans();
      await fetchDashboardData();
      return loan;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to create loan';
      console.error('Create loan error:', message);
      throw error;
    }
  };

  const fundEscrow = async (loanId) => {
    try {
      const response = await api.post(`/loans/${loanId}/fund-escrow`);
      console.log('Escrow funded successfully!');
      await fetchLoans();
      await fetchDashboardData();
      return response.data.loan;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to fund escrow';
      console.error(message);
      throw error;
    }
  };

  const acceptLoanTerms = async (loanId) => {
    try {
      const response = await api.post(`/loans/${loanId}/accept`);
      console.log('Loan terms accepted successfully!');
      await fetchLoans();
      await fetchDashboardData();
      return response.data.loan;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to accept loan terms';
      console.error(message);
      throw error;
    }
  };

  const makePayment = async (loanId, amount) => {
    try {
      const response = await api.post(`/loans/${loanId}/payment`, { amount });
      console.log('Payment made successfully!');
      await fetchLoans();
      await fetchDashboardData();
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to make payment';
      console.error(message);
      throw error;
    }
  };

  const cancelLoan = async (loanId) => {
    try {
      const response = await api.post(`/loans/${loanId}/cancel`);
      console.log('Loan cancelled successfully!');
      await fetchLoans();
      await fetchDashboardData();
      return response.data.loan;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to cancel loan';
      console.error(message);
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

  const getLoanExcuses = async (loanId) => {
    try {
      const response = await api.get(`/loans/${loanId}/excuses`);
      return response.data.excuses;
    } catch (error) {
      console.error('Fetch loan excuses error:', error);
      return [];
    }
  };

  const requestLoan = async (loanRequest) => {
    try {
      const response = await api.post('/loans/request', loanRequest);
      console.log('Loan request submitted successfully!');
      await fetchLoans();
      await fetchDashboardData();
      return response.data.loanRequest;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to submit loan request';
      console.error(message);
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
  
  const acceptLoanRequest = async (requestId, repaymentDate) => {
    try {
      const response = await api.post(`/loans/requests/${requestId}/accept`, { repaymentDate });
      console.log('Loan request accepted successfully!');
      await fetchLoans();
      await fetchDashboardData();
      return response.data.loan;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to accept loan request';
      console.error(message);
      throw error;
    }
  };

  const completeLoanPayment = async (requestId, paymentId, paymentMethod) => {
    try {
      const response = await api.post(`/loans/requests/${requestId}/pay`, {
        paymentId,
        paymentMethod
      });
      console.log('Payment completed successfully!');
      await fetchLoans();
      await fetchDashboardData();
      return response.data.loan;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to complete payment';
      console.error(message);
      throw error;
    }
  };

  const value = {
    loans,
    dashboardData,
    loading,
    fetchLoans: memoizedFetchLoans,
    fetchLoanById,
    fetchDashboardData: memoizedFetchDashboardData,
    createLoan,
    fundEscrow,
    acceptLoanTerms,
    makePayment,
    cancelLoan,
    getPendingOffers,
    getPaymentRequirements,
    getLoanLedger,
    getLoanExcuses,
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



