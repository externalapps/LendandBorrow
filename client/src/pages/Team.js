import React from 'react';
import { 
  UserIcon,
  TrophyIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Team = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Team
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet the co-founders of PaySafe - innovative minds dedicated to revolutionizing 
            peer-to-peer lending with cutting-edge technology and user-centric design.
          </p>
        </div>

        {/* Team Members */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* Nandagiri Aditya */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-blue-600 px-8 py-12">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <img 
                    src="/aditya.png" 
                    alt="Nandagiri Aditya"
                    className="w-20 h-20 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <UserIcon className="w-12 h-12 text-teal-600 hidden" />
                </div>
                <div className="text-white">
                  <h2 className="text-2xl font-bold mb-2">Nandagiri Aditya</h2>
                  <p className="text-teal-100 text-lg">Co-Founder & Innovator</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="space-y-6">
                {/* Certifications & Recognition */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <ShieldCheckIcon className="w-5 h-5 text-blue-600 mr-2" />
                    Certifications & Recognition
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-blue-900">Recognized Innovator</span>
                      </div>
                      <p className="text-sm text-blue-700 ml-4">(TGIC/KR/INN/2025/007)</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-green-900">Ethical Hacker</span>
                      </div>
                      <p className="text-sm text-green-700 ml-4">(ECC36596056249)</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="font-medium text-purple-900">Founder</span>
                      </div>
                      <p className="text-sm text-purple-700 ml-4">Peppty & Beyondx</p>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="font-medium text-orange-900">AI Developer</span>
                      </div>
                      <p className="text-sm text-orange-700 ml-4">Machine Learning & AI Solutions</p>
                    </div>
                  </div>
                </div>

                {/* Expertise */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <SparklesIcon className="w-5 h-5 text-purple-600 mr-2" />
                    Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['Innovation Strategy', 'Product Development', 'Tech Leadership', 'Startup Ecosystem', 'Government Relations'].map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sandeep - Placeholder */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-dashed border-gray-300">
            <div className="bg-gradient-to-r from-gray-400 to-gray-500 px-8 py-12">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <UserIcon className="w-12 h-12 text-gray-400" />
                </div>
                <div className="text-white">
                  <h2 className="text-2xl font-bold mb-2">Sandeep</h2>
                  <p className="text-gray-200 text-lg">Co-Founder</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Co-Founder</h3>
                <p className="text-gray-500">
                  Co-founder information will be added here soon.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="mt-16 bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl p-8 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-xl text-teal-100 leading-relaxed">
              To democratize access to financial services through innovative peer-to-peer lending 
              solutions that empower individuals and communities while maintaining the highest 
              standards of security, transparency, and user experience.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600">
                Continuously pushing boundaries to create cutting-edge financial solutions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">User-Centric</h3>
              <p className="text-gray-600">
                Putting users at the heart of every decision and design choice.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrophyIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Excellence</h3>
              <p className="text-gray-600">
                Striving for the highest quality in everything we build and deliver.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
