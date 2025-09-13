import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5001/api');

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  sendOTP: (phone) => api.post('/auth/send-otp', { phone }),
  verifyOTP: (phone, otp) => api.post('/auth/verify-otp', { phone, otp }),
};

export const userAPI = {
  getUsers: () => api.get('/users'),
  getUser: (userId) => api.get(`/users/${userId}`),
  updateKYC: (kycData) => api.post('/users/kyc', kycData),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  getDashboardSummary: () => api.get('/users/dashboard/summary'),
};

export const loanAPI = {
  getLoans: (params) => api.get('/loans', { params }),
  getLoan: (loanId) => api.get(`/loans/${loanId}`),
  createLoan: (loanData) => api.post('/loans', loanData),
  requestLoan: (loanRequestData) => api.post('/loans/request', loanRequestData),
  fundEscrow: (loanId) => api.post(`/loans/${loanId}/fund-escrow`),
  acceptLoanTerms: (loanId) => api.post(`/loans/${loanId}/accept`),
  makePayment: (loanId, amount) => api.post(`/loans/${loanId}/payment`, { amount }),
  cancelLoan: (loanId) => api.post(`/loans/${loanId}/cancel`),
  getPendingOffers: () => api.get('/loans/pending/offers'),
  getPaymentRequirements: (loanId) => api.get(`/loans/${loanId}/payment-requirements`),
  getLoanLedger: (loanId) => api.get(`/loans/${loanId}/ledger`),
  getLoanExcuses: (loanId) => api.get(`/loans/${loanId}/excuses`),
};

export const paymentAPI = {
  processRazorpayPayment: (paymentData) => api.post('/payments/razorpay', paymentData),
  createRazorpayOrder: (orderData) => api.post('/payments/razorpay/order', orderData),
  verifyRazorpayPayment: (verificationData) => api.post('/payments/razorpay/verify', verificationData),
  getPaymentMethods: () => api.get('/payments/methods'),
};

export const cibilAPI = {
  reportToCIBIL: (reportData) => api.post('/mock-cibil/report', reportData),
  getReports: (params) => api.get('/mock-cibil/reports', { params }),
  getReport: (reportId) => api.get(`/mock-cibil/reports/${reportId}`),
  updateReportStatus: (reportId, status) => api.put(`/mock-cibil/reports/${reportId}/status`, { status }),
  exportReports: () => api.get('/mock-cibil/reports/export/csv', { responseType: 'blob' }),
  getStatus: () => api.get('/mock-cibil/status'),
};

export const communicationAPI = {
  getCommunicationHistory: (loanId) => api.get(`/communications/loan/${loanId}`),
  sendCall: (callData) => api.post('/communications/call', callData),
  sendSMS: (smsData) => api.post('/communications/sms', smsData),
  sendEmail: (emailData) => api.post('/communications/email', emailData),
  generateTTS: (transcript) => api.post('/communications/tts', { transcript }),
  getCommunications: (params) => api.get('/communications', { params }),
  getCommunication: (communicationId) => api.get(`/communications/${communicationId}`),
  updateCommunicationStatus: (communicationId, status) => api.put(`/communications/${communicationId}/status`, { status }),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  runScheduler: () => api.post('/admin/scheduler/run'),
  simulateTime: (timeData) => api.post('/admin/time/simulate', timeData),
  getLoans: (params) => api.get('/admin/loans', { params }),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserKYC: (userId, kycData) => api.put(`/admin/users/${userId}/kyc`, kycData),
  forceCIBILReport: (reportData) => api.post('/admin/cibil/report', reportData),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  updateSettings: (settingsData) => api.put('/admin/settings', settingsData),
  getHealth: () => api.get('/admin/health'),
};

export const settingsAPI = {
  getSettings: () => api.get('/settings'),
};

export default api;






