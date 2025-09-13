import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoanProvider } from './contexts/LoanContext';
import { ModalProvider } from './contexts/ModalContext';
import { Toaster } from 'react-hot-toast';
import BackgroundStyles from './components/BackgroundStyles';

// Components
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import KYC from './pages/KYC';
import LendMoney from './pages/LendMoney';
import BorrowMoney from './pages/BorrowMoney';
import LoanDetail from './pages/LoanDetail';
import Repayment from './pages/Repayment';
import Collection from './pages/Collection';
import CibilLog from './pages/CibilLog';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import Team from './pages/Team';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !['admin@lendandborrow.com', 'demo@lendandborrow.com'].includes(user.email)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <BackgroundStyles />
      {user && <Navbar />}
      <Toaster position="top-right" />
      
      <main className={user ? 'pt-16' : ''}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <Landing />
              </PublicRoute>
            } 
          />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/kyc" 
            element={
              <ProtectedRoute>
                <KYC />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lend" 
            element={
              <ProtectedRoute>
                <LendMoney />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/borrow" 
            element={
              <ProtectedRoute>
                <BorrowMoney />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/loan/:loanId" 
            element={
              <ProtectedRoute>
                <LoanDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/repayment/:loanId" 
            element={
              <ProtectedRoute>
                <Repayment />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/collection/:loanId" 
            element={
              <ProtectedRoute>
                <Collection />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cibil" 
            element={
              <ProtectedRoute>
                <CibilLog />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/team" 
            element={<Team />} 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LoanProvider>
        <ModalProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <AppContent />
          </Router>
        </ModalProvider>
      </LoanProvider>
    </AuthProvider>
  );
}

export default App;

