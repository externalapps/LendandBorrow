import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BanknotesIcon, 
  ShieldCheckIcon, 
  ClockIcon, 
  ChartBarIcon,
  ArrowRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const Landing = () => {
  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Secure Escrow',
      description: 'Your money is held safely in escrow until loan terms are accepted'
    },
    {
      icon: ClockIcon,
      title: 'Flexible Repayment',
      description: '10-day grace periods with rolling 1% block fees for missed payments'
    },
    {
      icon: ChartBarIcon,
      title: 'CIBIL Reporting',
      description: 'Transparent credit reporting to help build your credit history'
    },
    {
      icon: BanknotesIcon,
      title: 'Low Fees',
      description: 'Only 1% initial platform fee, no hidden charges'
    }
  ];

  const benefits = [
    'Complete KYC verification process',
    'Real-time loan tracking and management',
    'Automated payment reminders',
    'Transparent fee structure',
    'Mobile-friendly interface',
    '24/7 customer support'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
              PaySafe
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-fade-in-up">
              Friend-to-Friend P2P Lending Platform
            </p>
            <p className="text-lg mb-12 text-gray-300 max-w-3xl mx-auto animate-fade-in-up">
              Lend and borrow money safely with friends. Complete KYC verification, 
              secure escrow, flexible repayment terms, and transparent CIBIL reporting.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
              <Link
                to="/register"
                className="bg-gold hover:bg-yellow-500 text-navy font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200 shadow-glow-gold hover:shadow-xl transform hover:-translate-y-1"
              >
                Get Started
                <ArrowRightIcon className="w-5 h-5 inline-block ml-2" />
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white hover:bg-white hover:text-navy font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose PaySafe?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with security, transparency, and user experience in mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-200 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to start lending or borrowing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center animate-slide-in-right">
              <div className="w-20 h-20 bg-navy text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Complete KYC
              </h3>
              <p className="text-gray-600">
                Verify your identity with PAN, Aadhaar, and bank account details
              </p>
            </div>

            <div className="text-center animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
              <div className="w-20 h-20 bg-teal-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Create or Accept Loan
              </h3>
              <p className="text-gray-600">
                Lenders fund escrow, borrowers accept terms to receive funds
              </p>
            </div>

            <div className="text-center animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
              <div className="w-20 h-20 bg-gold text-navy rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Repay & Track
              </h3>
              <p className="text-gray-600">
                Make payments, track progress, and build your credit history
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Everything You Need for Safe P2P Lending
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                PaySafe provides a complete platform for friend-to-friend lending 
                with enterprise-grade security and compliance features.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-8 rounded-2xl">
              <div className="text-center">
                <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BanknotesIcon className="w-12 h-12 text-teal-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Get Started?
                </h3>
                <p className="text-gray-600 mb-6">
                  Join thousands of users who trust PaySafe for their P2P lending needs
                </p>
                <Link
                  to="/register"
                  className="btn-primary inline-flex items-center"
                >
                  Create Account
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-navy to-teal rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PS</span>
              </div>
              <span className="text-xl font-bold">PaySafe</span>
            </div>
            <p className="text-gray-400 mb-4">
              Secure P2P Lending Platform
            </p>
            <p className="text-sm text-gray-500">
              © 2025 Beyondx Informatics Analytics Pvt. Ltd.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
