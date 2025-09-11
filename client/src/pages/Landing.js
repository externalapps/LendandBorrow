import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { backgroundStyles } from '../components/BackgroundStyles';
import { 
  BanknotesIcon, 
  ShieldCheckIcon, 
  ClockIcon, 
  ChartBarIcon,
  ArrowRightIcon,
  CheckIcon,
  StarIcon,
  PlayIcon,
  SparklesIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const Landing = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Bank-Grade Security',
      description: '256-bit SSL encryption, secure escrow, and fraud protection',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50'
    },
    {
      icon: ClockIcon,
      title: 'Instant Processing',
      description: 'Get funds in minutes, not days. Real-time loan approval',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: ChartBarIcon,
      title: 'Smart Analytics',
      description: 'AI-powered risk assessment and credit scoring',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: CurrencyRupeeIcon,
      title: 'Zero Hidden Fees',
      description: 'Transparent pricing with no surprise charges',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50'
    }
  ];

  const testimonials = [
    {
      name: 'Sagar Kodem',
      role: 'Sales Executive, Wilmar International',
      content: 'Lending money through apps or in cash always created problems. With Lend & Borrow, I can still help friends while ensuring repayment through CIBIL reporting.',
      avatar: '👨‍💼'
    },
    {
      name: 'Mahesh Chimmalla',
      role: 'Professional Photographer',
      content: 'Friends often ask me for hand loans, but I could never be sure they\'d repay on time. L&B gives me the confidence to lend, knowing I\'ll get my money back.',
      avatar: '📸'
    },
    {
      name: 'Sathya',
      role: 'Waiter',
      content: 'I once had to refuse a friend in urgent need because I wasn\'t sure he could return the money. With L&B, I can lend without doubts about repayment.',
      avatar: '👨‍🍳'
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
    <div className="min-h-screen bg-white" style={backgroundStyles.landing}>
      {/* Modern Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="w-10 h-10 transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center hidden">
                  <span className="text-white font-bold text-sm">LB</span>
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Lend & Borrow
              </span>
            </Link>
            <div className="flex items-center space-x-6">
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-50"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Simple Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-16 bg-white/80 p-8 rounded-xl shadow-lg backdrop-blur-sm"> {/* Added mt-16 to move content down */}
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
              Lend & Borrow
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl mb-8 text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
              Simple, secure peer-to-peer lending between friends
            </p>
            
            {/* Description */}
            <p className="text-lg mb-12 text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Connect with trusted friends for secure lending and borrowing. 
              Complete KYC verification, transparent fees, and easy repayment tracking.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-xl"
              >
                Get Started
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
              
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold text-lg rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple, secure, and transparent peer-to-peer lending
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-200 bg-gray-50 hover:bg-white"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
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

      {/* Testimonials Section - Will be added when you provide real testimonials */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                What People Say
              </h2>
              <p className="text-lg text-gray-600">
                Feedback from our community
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="text-center">
                <div className="text-4xl mb-4">{testimonials[currentTestimonial].avatar}</div>
                <blockquote className="text-lg text-gray-700 mb-6 leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="font-semibold text-gray-900">{testimonials[currentTestimonial].name}</div>
                <div className="text-gray-600">{testimonials[currentTestimonial].role}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple steps to start lending or borrowing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Complete KYC',
                description: 'Verify your identity with PAN, Aadhaar, and bank account details'
              },
              {
                step: '2',
                title: 'Create or Accept Loan',
                description: 'Lenders fund escrow, borrowers accept terms to receive funds'
              },
              {
                step: '3',
                title: 'Repay & Track',
                description: 'Make payments, track progress, and build your credit history'
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join our platform and start lending or borrowing with friends in a secure, transparent way.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold text-lg rounded-xl shadow-lg hover:bg-gray-50 transition-all duration-200"
            >
              Get Started
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
            
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold text-lg rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-8 h-8"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center hidden">
                <span className="text-white font-bold text-sm">LB</span>
              </div>
              <span className="text-xl font-bold">Lend & Borrow</span>
            </div>
            <p className="text-gray-400 mb-6">
              Simple, secure peer-to-peer lending between friends
            </p>
            <div className="flex justify-center space-x-6 mb-8">
              <Link to="/login" className="text-gray-400 hover:text-white transition-colors duration-200">Sign In</Link>
              <Link to="/register" className="text-gray-400 hover:text-white transition-colors duration-200">Get Started</Link>
              <Link to="/team" className="text-gray-400 hover:text-white transition-colors duration-200">About Us</Link>
            </div>
            <p className="text-sm text-gray-500">
              © 2025 Beyondx Informatics Analytics Pvt. Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
