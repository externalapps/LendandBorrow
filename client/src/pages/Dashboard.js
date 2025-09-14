import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLoan } from '../contexts/LoanContext';
import { 
  BanknotesIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowRightIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import TimeSimulator from '../components/TimeSimulator';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const { dashboardData, fetchDashboardData, loading, fetchLoans } = useLoan();
  const [recentLoans, setRecentLoans] = useState([]);

  const fetchRecentLoans = React.useCallback(async () => {
    if (!fetchLoans) return;
    try {
      const loans = await fetchLoans();
      setRecentLoans(loans.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent loans:', error);
    }
  }, [fetchLoans]);
  
  useEffect(() => {
    if (user && fetchDashboardData && fetchRecentLoans) {
      fetchDashboardData();
      fetchRecentLoans();
    }
  }, [user, fetchDashboardData, fetchRecentLoans]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's an overview of your P2P lending activity
          </p>
        </div>

        {/* Time Simulator (Admin only) */}
        {isAdmin && (
          <div className="mb-8">
            <TimeSimulator />
          </div>
        )}


        {/* Dashboard Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Wallet Balance */}
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <BanknotesIcon className="w-6 h-6 text-teal-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Wallet Balance</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(dashboardData.wallet.balance)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Loans Given */}
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ArrowRightIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Loans Given</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.loansGiven.total}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(dashboardData.loansGiven.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Loans Taken */}
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <ArrowRightIcon className="w-6 h-6 text-green-600 transform rotate-180" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Loans Taken</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.loansTaken.total}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(dashboardData.loansTaken.outstanding)} outstanding
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Overdue */}
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Overdue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.overdue.count}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(dashboardData.overdue.amount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/lend"
                  className="flex items-center justify-between p-3 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  <div className="flex items-center">
                    <BanknotesIcon className="w-5 h-5 text-teal-600 mr-3" />
                    <span className="font-medium text-gray-900">Lend Money</span>
                  </div>
                  <PlusIcon className="w-5 h-5 text-teal-600" />
                </Link>
                
                <Link
                  to="/borrow"
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center">
                    <ArrowRightIcon className="w-5 h-5 text-blue-600 mr-3 transform rotate-180" />
                    <span className="font-medium text-gray-900">Borrow Money</span>
                  </div>
                  <PlusIcon className="w-5 h-5 text-blue-600" />
                </Link>

                <Link
                  to="/cibil"
                  className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center">
                    <ChartBarIcon className="w-5 h-5 text-purple-600 mr-3" />
                    <span className="font-medium text-gray-900">CIBIL Reports</span>
                  </div>
                  <EyeIcon className="w-5 h-5 text-purple-600" />
                </Link>
              </div>
            </div>
          </div>

          {/* Upcoming Checkpoints */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Checkpoints</h3>
              {dashboardData?.upcomingCheckpoints?.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.upcomingCheckpoints.slice(0, 3).map((checkpoint, index) => (
                    <div key={`checkpoint-${checkpoint.loanId}-${index}`} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          Excuse {checkpoint.excuseNumber || checkpoint.blockNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          Due: {checkpoint.excuseEndDate || checkpoint.blockEndDate ? 
                            new Date(checkpoint.excuseEndDate || checkpoint.blockEndDate).toLocaleDateString() : 
                            'Date not set'
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(checkpoint.minPayment)}
                        </p>
                        <p className="text-sm text-gray-600">min payment</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming checkpoints</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Loans */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Recent Loans</h3>
          </div>
          <div className="card-body">
            {recentLoans.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loan ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentLoans.map((loan) => (
                      <tr key={loan.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {loan.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {loan.lenderId === user.id ? 'Lent' : 'Borrowed'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(loan.principal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`status-badge ${getStatusColor(loan.status).replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                            {loan.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(loan.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/loan/${loan.id}`}
                            className="text-teal-600 hover:text-teal-900"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <BanknotesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No loans yet</p>
                <div className="space-x-4">
                  <Link to="/lend" className="btn-primary">
                    Lend Money
                  </Link>
                  <Link to="/borrow" className="btn-outline">
                    Borrow Money
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
