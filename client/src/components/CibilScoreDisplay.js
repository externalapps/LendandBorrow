import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const CibilScoreDisplay = ({ borrowerId, borrowerName }) => {
  const [cibilData, setCibilData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Generate mock CIBIL data - completely isolated from real data
  const generateMockCibilData = (borrowerId) => {
    // Create a deterministic seed based on borrowerId for consistent scores
    const seed = borrowerId ? borrowerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 12345;
    const seededRandom = (offset = 0) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };
    
    // Generate consistent but realistic CIBIL score based on borrowerId
    const cibilScore = Math.floor(seededRandom(1) * 400) + 400; // 400-800 range
    const platformScore = Math.floor(seededRandom(2) * 200) + 600; // 600-800 range
    
    // Determine risk levels
    const getRiskLevel = (score) => {
      if (score >= 750) return { level: 'Low Risk', color: 'green', icon: CheckCircleIcon };
      if (score >= 650) return { level: 'Medium Risk', color: 'yellow', icon: ExclamationTriangleIcon };
      return { level: 'High Risk', color: 'red', icon: ExclamationTriangleIcon };
    };

    const cibilRisk = getRiskLevel(cibilScore);
    const platformRisk = getRiskLevel(platformScore);
    
    // Calculate combined risk
    const combinedScore = Math.round((cibilScore + platformScore) / 2);
    const combinedRisk = getRiskLevel(combinedScore);

    // Generate mock platform history using seeded random
    const loanCount = Math.floor(seededRandom(3) * 5) + 1; // 1-5 loans
    const successRate = Math.floor(seededRandom(4) * 30) + 70; // 70-100%
    const avgPaymentDays = Math.floor(seededRandom(5) * 10) - 5; // -5 to +5 days
    const borrowerRating = Math.floor(seededRandom(6) * 2) + 4; // 4-5 stars

    // Generate mock community feedback
    const feedbacks = [
      "Reliable borrower, always pays on time",
      "Good communication, trustworthy",
      "Excellent payment history",
      "Responsible borrower",
      "Highly recommended",
      "Consistent with payments",
      "Professional and reliable"
    ];

    return {
      cibilScore,
      platformScore,
      combinedScore,
      cibilRisk,
      platformRisk,
      combinedRisk,
      platformHistory: {
        loanCount,
        successRate,
        avgPaymentDays,
        borrowerRating,
        communityFeedback: feedbacks[Math.floor(seededRandom(7) * feedbacks.length)]
      },
      scoreRecovery: {
        points: Math.floor(seededRandom(8) * 50) + 20, // 20-70 points
        period: "6 months"
      }
    };
  };

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setCibilData(generateMockCibilData(borrowerId));
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [borrowerId]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!cibilData) return null;

  const { cibilScore, platformScore, combinedScore, cibilRisk, platformRisk, combinedRisk, platformHistory, scoreRecovery } = cibilData;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 overflow-hidden w-full max-w-full text-sm md:text-base">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center truncate">
          <ChartBarIcon className="w-5 h-5 mr-2 text-blue-600" />
          Credit Score Assessment
        </h3>
        <span className="text-xs md:text-sm text-gray-500 flex-shrink-0">Mock Data</span>
      </div>

      {/* Dual Scoring System */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 min-w-0">
        {/* CIBIL Score */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">CIBIL Score</span>
            <span className="text-xs text-gray-500">External</span>
          </div>
          <div className="flex items-center space-x-2 min-w-0">
            <span className="text-lg md:text-2xl font-bold text-gray-900">{cibilScore}</span>
            <span className="text-xs md:text-sm text-gray-500">/900</span>
            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              cibilRisk.color === 'green' ? 'bg-green-100 text-green-800' :
              cibilRisk.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              <cibilRisk.icon className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{cibilRisk.level}</span>
            </div>
          </div>
        </div>

        {/* Platform Score */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Platform Score</span>
            <span className="text-xs text-gray-500">Internal</span>
          </div>
          <div className="flex items-center space-x-2 min-w-0">
            <span className="text-lg md:text-2xl font-bold text-blue-900">{platformScore}</span>
            <span className="text-xs md:text-sm text-gray-500">/900</span>
            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              platformRisk.color === 'green' ? 'bg-green-100 text-green-800' :
              platformRisk.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              <platformRisk.icon className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{platformRisk.level}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Combined Risk Assessment */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-3 mb-4">
        <div className="flex items-start md:items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-gray-600 truncate">Combined Risk Assessment</span>
            <div className="flex items-center space-x-2 mt-1 min-w-0">
              <span className="text-base md:text-lg font-bold text-gray-900">{combinedScore}</span>
              <span className="text-xs md:text-sm text-gray-500">/900</span>
              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                combinedRisk.color === 'green' ? 'bg-green-100 text-green-800' :
                combinedRisk.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                <combinedRisk.icon className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{combinedRisk.level}</span>
              </div>
            </div>
          </div>
          <ArrowTrendingUpIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
        </div>
      </div>

      {/* Platform History */}
      <div className="space-y-2 overflow-hidden">
        <h4 className="text-xs font-medium text-gray-700 mb-2">Platform History</h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-3 h-3 text-green-600 flex-shrink-0" />
            <span className="text-gray-600">Loans Completed:</span>
            <span className="font-medium">{platformHistory.loanCount}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-3 h-3 text-green-600 flex-shrink-0" />
            <span className="text-gray-600">Success Rate:</span>
            <span className="font-medium">{platformHistory.successRate}%</span>
          </div>
          <div className="flex items-center space-x-2">
            {platformHistory.avgPaymentDays < 0 ? (
              <ArrowTrendingUpIcon className="w-3 h-3 text-green-600 flex-shrink-0" />
            ) : (
              <ArrowTrendingDownIcon className="w-3 h-3 text-red-600 flex-shrink-0" />
            )}
            <span className="text-gray-600">Avg Payment:</span>
            <span className={`font-medium text-xs ${
              platformHistory.avgPaymentDays < 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {Math.abs(platformHistory.avgPaymentDays)} days {platformHistory.avgPaymentDays < 0 ? 'early' : 'late'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <StarIcon className="w-3 h-3 text-yellow-500 flex-shrink-0" />
            <span className="text-gray-600">Rating:</span>
            <span className="font-medium">{platformHistory.borrowerRating}/5</span>
          </div>
        </div>
        
        {/* Community Feedback */}
        <div className="mt-3 p-2 bg-gray-50 rounded">
          <span className="text-xs text-gray-500">Community Feedback:</span>
          <p className="text-xs text-gray-700 mt-1 break-words">"{platformHistory.communityFeedback}"</p>
        </div>

        {/* Score Recovery */}
        <div className="mt-3 p-2 bg-green-50 rounded">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
            <span className="text-xs text-green-800 break-words">
              Score Recovery: +{scoreRecovery.points} points in last {scoreRecovery.period}
            </span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-xs text-yellow-800 break-words leading-tight">
          <strong>Note:</strong> This is mock credit data for demonstration purposes. In production, this would integrate with real CIBIL APIs and credit bureaus.
        </p>
      </div>
    </div>
  );
};

export default CibilScoreDisplay;
