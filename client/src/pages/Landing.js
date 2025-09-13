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
      <link href="https://fonts.googleapis.com/css2?family=Tomorrow:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInDown {
          0% {
            opacity: 0;
            transform: translateY(-30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes glowPulse {
          0%, 100% {
            text-shadow: 0 0 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6), 0 0 60px rgba(0,0,0,0.4);
          }
          50% {
            text-shadow: 0 0 30px rgba(0,0,0,1), 0 0 50px rgba(0,0,0,0.8), 0 0 70px rgba(0,0,0,0.6);
          }
        }
        
        @keyframes clarify {
          0% {
            opacity: 0.3;
            filter: blur(10px);
            transform: scale(0.8);
          }
          50% {
            opacity: 0.7;
            filter: blur(5px);
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            filter: blur(0px);
            transform: scale(1);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 1.5s ease-out forwards;
        }
        
        .animate-fadeInDown {
          animation: fadeInDown 1.5s ease-out forwards;
        }
        
        .animate-glowPulse {
          animation: glowPulse 3s ease-in-out infinite;
        }
        
        .animate-clarify {
          animation: clarify 2s ease-out forwards;
        }
      `}</style>
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
              <span className="text-xl font-normal bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent" style={{fontFamily: 'Tomorrow, sans-serif'}}>
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
                className="bg-gradient-to-r from-[#00b66b] to-[#00a05e] text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-[#00a05e] hover:to-[#009052] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Blurred Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Clear Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/5"></div>
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-20">
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Main Headline */}
            <h1 className="text-6xl md:text-8xl font-normal mb-6 text-white drop-shadow-2xl tracking-wider" style={{fontFamily: 'Tomorrow, sans-serif'}}>
              {['L', 'e', 'n', 'd'].map((letter, index) => (
                <span 
                  key={index}
                  className="inline-block animate-clarify"
                  style={{
                    textShadow: '0 0 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6), 0 0 60px rgba(0,0,0,0.4)',
                    animationDelay: `${0.2 + (index * 0.1)}s`,
                    animationDuration: '2s'
                  }}
                >
                  {letter}
                </span>
              ))}
              <span className="mx-4 text-white/60 text-6xl md:text-8xl" style={{fontFamily: 'Tomorrow, sans-serif'}}> & </span>
              {['B', 'o', 'r', 'r', 'o', 'w'].map((letter, index) => (
                <span 
                  key={index}
                  className="inline-block animate-clarify"
                  style={{
                    textShadow: '0 0 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6), 0 0 60px rgba(0,0,0,0.4)',
                    animationDelay: `${0.8 + (index * 0.1)}s`,
                    animationDuration: '2s'
                  }}
                >
                  {letter}
                </span>
              ))}
            </h1>
            
            {/* Subtitle */}
            <p className="text-2xl md:text-3xl mb-8 text-white font-normal max-w-3xl mx-auto leading-relaxed drop-shadow-lg" style={{textShadow: '0 0 15px rgba(0,0,0,0.7), 0 0 30px rgba(0,0,0,0.5)', fontFamily: 'Tomorrow, sans-serif'}}>
              Simple, secure peer-to-peer lending between friends
            </p>
            
            {/* Description */}
            <p className="text-xl mb-12 text-white font-normal max-w-2xl mx-auto leading-relaxed drop-shadow-md" style={{textShadow: '0 0 10px rgba(0,0,0,0.6), 0 0 20px rgba(0,0,0,0.4)', fontFamily: 'Tomorrow, sans-serif'}}>
              Connect with trusted friends for secure lending and borrowing. 
              Complete KYC verification, transparent fees, and easy repayment tracking.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-[#00b66b] text-white font-semibold text-lg rounded-xl shadow-xl hover:bg-[#00a05e] transition-all duration-200 hover:shadow-2xl backdrop-blur-sm"
              >
                Get Started
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
              
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-4 border-2 border-white/50 text-white font-semibold text-lg rounded-xl hover:border-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
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
              className="inline-flex items-center px-8 py-4 bg-[#00b66b] text-white font-semibold text-lg rounded-xl shadow-lg hover:bg-[#00a05e] transition-all duration-200"
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
              <Link to="/register" className="text-gray-400 hover:text-[#00b66b] transition-colors duration-200">Get Started</Link>
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
