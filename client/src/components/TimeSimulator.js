import React, { useState } from 'react';
import { adminAPI } from '../services/api';
import { ClockIcon, PlayIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const TimeSimulator = () => {
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(10);

  const handleTimeAdvance = async (advanceDays) => {
    setLoading(true);
    try {
      await adminAPI.simulateTime({ 
        days: advanceDays, 
        action: 'advance' 
      });
      
      toast.success(`Time advanced by ${advanceDays} days`);
      
      // Refresh dashboard data
      window.location.reload();
    } catch (error) {
      console.error('Time simulation error:', error);
      toast.error('Failed to advance time');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomAdvance = async () => {
    if (days <= 0) {
      toast.error('Please enter a valid number of days');
      return;
    }
    
    await handleTimeAdvance(days);
  };

  const quickAdvanceOptions = [
    { days: 10, label: '+10 days', description: 'Main grace period' },
    { days: 30, label: '+30 days', description: 'Full term' },
    { days: 40, label: '+40 days', description: 'First checkpoint' },
    { days: 50, label: '+50 days', description: 'Second checkpoint' }
  ];

  return (
    <div className="card border-2 border-yellow-200 bg-yellow-50">
      <div className="card-header bg-yellow-100">
        <div className="flex items-center">
          <ClockIcon className="w-6 h-6 text-yellow-600 mr-3" />
          <h3 className="text-lg font-semibold text-yellow-800">
            Time Simulator (Admin Only)
          </h3>
        </div>
        <p className="text-sm text-yellow-700 mt-1">
          Advance time to trigger loan evaluations and CIBIL reporting
        </p>
      </div>
      
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Advance Options */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Quick Advance</h4>
            <div className="space-y-2">
              {quickAdvanceOptions.map((option) => (
                <button
                  key={option.days}
                  onClick={() => handleTimeAdvance(option.days)}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-3 bg-white border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50"
                >
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{option.label}</p>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                  <PlayIcon className="w-5 h-5 text-yellow-600" />
                </button>
              ))}
            </div>
          </div>

          {/* Custom Advance */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Custom Advance</h4>
            <div className="space-y-3">
              <div>
                <label htmlFor="custom-days" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Days
                </label>
                <input
                  id="custom-days"
                  type="number"
                  min="1"
                  max="365"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value) || 0)}
                  className="form-input"
                  placeholder="Enter days"
                />
              </div>
              
              <button
                onClick={handleCustomAdvance}
                disabled={loading || days <= 0}
                className="w-full btn-warning flex items-center justify-center disabled:opacity-50"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <PlayIcon className="w-5 h-5 mr-2" />
                    Advance {days} Days
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Current Time Display */}
        <div className="mt-6 p-4 bg-white border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Current Simulation Time</p>
              <p className="text-lg font-bold text-gray-900">
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Demo Mode</p>
              <p className="text-sm font-medium text-yellow-600">Time can be advanced</p>
            </div>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Warning:</strong> Time advancement will trigger loan evaluations, 
            apply block fees, and potentially generate CIBIL reports for overdue loans.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TimeSimulator;


