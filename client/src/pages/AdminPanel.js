import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';
import { 
  CogIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  PlayIcon,
  EyeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import TimeSimulator from '../components/TimeSimulator';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
      toast.error('Failed to fetch admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRunScheduler = async () => {
    try {
      const response = await adminAPI.runScheduler();
      toast.success('Scheduler executed successfully!');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error running scheduler:', error);
      toast.error('Failed to run scheduler');
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'users', name: 'Users', icon: UsersIcon },
    { id: 'loans', name: 'Loans', icon: CurrencyDollarIcon },
    { id: 'system', name: 'System', icon: CogIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-600">
            System administration and monitoring
          </p>
        </div>

        {/* Time Simulator */}
        <div className="mb-8">
          <TimeSimulator />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <PlayIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">Run Scheduler</h3>
                  <p className="text-sm text-gray-500">Execute loan evaluations</p>
                </div>
              </div>
              <button
                onClick={handleRunScheduler}
                className="mt-4 btn-primary w-full"
              >
                Execute Now
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">System Health</h3>
                  <p className="text-sm text-gray-500">Check system status</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('system')}
                className="mt-4 btn-outline w-full"
              >
                View Status
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UsersIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">User Management</h3>
                  <p className="text-sm text-gray-500">Manage users and KYC</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('users')}
                className="mt-4 btn-outline w-full"
              >
                Manage Users
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
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
            {activeTab === 'overview' && dashboardData && (
              <div className="space-y-6">
                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <UsersIcon className="w-8 h-8 text-blue-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-600">Total Users</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {dashboardData.statistics.users.total}
                        </p>
                        <p className="text-sm text-blue-700">
                          {dashboardData.statistics.users.verified} verified
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-600">Total Loans</p>
                        <p className="text-2xl font-bold text-green-900">
                          {dashboardData.statistics.loans.total}
                        </p>
                        <p className="text-sm text-green-700">
                          {dashboardData.statistics.loans.active} active
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <ChartBarIcon className="w-8 h-8 text-yellow-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-yellow-600">CIBIL Reports</p>
                        <p className="text-2xl font-bold text-yellow-900">
                          {dashboardData.statistics.reports.cibil}
                        </p>
                        <p className="text-sm text-yellow-700">
                          {dashboardData.statistics.reports.communications} communications
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-600">Defaulted Loans</p>
                        <p className="text-2xl font-bold text-red-900">
                          {dashboardData.statistics.loans.defaulted}
                        </p>
                        <p className="text-sm text-red-700">
                          {dashboardData.statistics.loans.completed} completed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Loans</h3>
                    <div className="space-y-3">
                      {dashboardData.recentActivity.loans.slice(0, 5).map((loan) => (
                        <div key={loan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{loan.id}</p>
                            <p className="text-sm text-gray-500">
                              {loan.lenderId?.name} → {loan.borrowerId?.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{formatCurrency(loan.principal)}</p>
                            <span className={`status-badge ${
                              loan.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                              loan.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {loan.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Audit Logs</h3>
                    <div className="space-y-3">
                      {dashboardData.recentActivity.auditLogs.slice(0, 5).map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{log.action}</p>
                            <p className="text-sm text-gray-500">
                              {log.userId} • {formatDate(log.timestamp)}
                            </p>
                          </div>
                          <span className={`status-badge ${
                            log.severity === 'ERROR' ? 'bg-red-100 text-red-800' :
                            log.severity === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {log.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                  <button
                    onClick={fetchDashboardData}
                    className="btn-outline"
                  >
                    Refresh
                  </button>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">User Management Features</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        In a full implementation, this would include user listing, KYC status management, 
                        user suspension/activation, and detailed user analytics.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loans Tab */}
            {activeTab === 'loans' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Loan Management</h3>
                  <button
                    onClick={fetchDashboardData}
                    className="btn-outline"
                  >
                    Refresh
                  </button>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Loan Management Features</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        In a full implementation, this would include loan listing, manual loan adjustments, 
                        payment overrides, and detailed loan analytics.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
                  <button
                    onClick={fetchDashboardData}
                    className="btn-outline"
                  >
                    Refresh
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <h4 className="font-medium text-green-900">Database</h4>
                        <p className="text-sm text-green-700">Connected</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <h4 className="font-medium text-green-900">Mock Services</h4>
                        <p className="text-sm text-green-700">Operational</p>
                      </div>
                    </div>
                  </div>
                </div>

                {dashboardData?.settings && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">System Settings</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Initial Fee Rate:</span>
                          <span className="font-medium">{(dashboardData.settings.initialFeeRate * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Block Fee Rate:</span>
                          <span className="font-medium">{(dashboardData.settings.blockFeeRate * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Block Min Percent:</span>
                          <span className="font-medium">{(dashboardData.settings.blockMinPercent * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Term Days:</span>
                          <span className="font-medium">{dashboardData.settings.termDays} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Main Grace Days:</span>
                          <span className="font-medium">{dashboardData.settings.mainGraceDays} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Block Length:</span>
                          <span className="font-medium">{dashboardData.settings.blockLengthDays} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Block Count:</span>
                          <span className="font-medium">{dashboardData.settings.blockCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">CIBIL Reporting:</span>
                          <span className="font-medium">
                            {dashboardData.settings.cibilReportingEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;


