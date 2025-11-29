import React, { useState } from 'react';
import { ChevronDown, Shield, Users, QrCode, CheckCircle, Lock, Zap, Building2, FileText } from 'lucide-react';

export default function ABHA() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const benefits = [
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your health data is encrypted and secure',
      color: 'from-green-400 to-green-600'
    },
    {
      icon: Zap,
      title: 'Quick Access',
      description: 'Access your records anywhere, anytime',
      color: 'from-blue-400 to-blue-600'
    },
    {
      icon: Building2,
      title: 'Hospital Integration',
      description: 'Connected with healthcare providers',
      color: 'from-purple-400 to-purple-600'
    },
    {
      icon: FileText,
      title: 'Digital Records',
      description: 'All your records in one place',
      color: 'from-orange-400 to-orange-600'
    }
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-20">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl shadow-xl p-6 mb-6 text-white relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-6 -mb-6"></div>
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Shield className="text-blue-700" size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold">ABHA Health ID</h2>
              <p className="text-blue-100 text-sm">Ayushman Bharat Digital Mission</p>
            </div>
          </div>
          
          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl p-3 hover:bg-white/30 transition-colors"
            >
              <Users className="w-5 h-5" />
              <div className="flex-1 text-left">
                <div className="font-semibold">User Profile #1</div>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl z-10 overflow-hidden">
                <button className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 text-gray-900">
                  User Profile #1
                </button>
                <button className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-blue-600 font-medium">
                  + Add Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ABHA Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-100">
        {/* NHA Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="bg-white/20 p-1 rounded">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div>
              <div className="text-white text-xs font-bold leading-tight">national</div>
              <div className="text-white text-xs font-bold leading-tight">health</div>
              <div className="text-white text-xs font-bold leading-tight">authority</div>
            </div>
          </div>
          <div className="bg-white/20 p-1 rounded-full">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-3">
          <div className="flex gap-3 items-center">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center overflow-hidden">
              <svg className="w-12 h-12 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 text-xs">
            <h3 className="font-bold text-gray-900 mb-1.5 text-sm">Suresh</h3>
            <div className="space-y-0.5 text-gray-700">
              <div><span className="font-medium">ABHA Number:</span> XX-XXXX-XXXX-XXXXX</div>
              <div><span className="font-medium">ABHA Address:</span> XXXXX@abdm</div>
              <div><span className="font-medium">DOB:</span> 04-05-1990 <span className="ml-2 font-medium">Gender:</span> Male</div>
              <div><span className="font-medium">Mobile:</span> +91 X||||||XXXX</div>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-white border border-blue-200 rounded shadow-sm flex items-center justify-center">
              <svg className="w-14 h-14" viewBox="0 0 100 100" fill="black">
                <rect x="0" y="0" width="10" height="10"/><rect x="10" y="0" width="10" height="10"/>
                <rect x="20" y="0" width="10" height="10"/><rect x="30" y="0" width="10" height="10"/>
                <rect x="40" y="0" width="10" height="10"/><rect x="60" y="0" width="10" height="10"/>
                <rect x="70" y="0" width="10" height="10"/><rect x="80" y="0" width="10" height="10"/>
                <rect x="90" y="0" width="10" height="10"/><rect x="0" y="10" width="10" height="10"/>
                <rect x="40" y="10" width="10" height="10"/><rect x="60" y="10" width="10" height="10"/>
                <rect x="90" y="10" width="10" height="10"/><rect x="0" y="20" width="10" height="10"/>
                <rect x="20" y="20" width="10" height="10"/><rect x="30" y="20" width="10" height="10"/>
                <rect x="40" y="20" width="10" height="10"/><rect x="60" y="20" width="10" height="10"/>
                <rect x="70" y="20" width="10" height="10"/><rect x="90" y="20" width="10" height="10"/>
                <rect x="0" y="30" width="10" height="10"/><rect x="20" y="30" width="10" height="10"/>
                <rect x="40" y="30" width="10" height="10"/><rect x="60" y="30" width="10" height="10"/>
                <rect x="80" y="30" width="10" height="10"/><rect x="90" y="30" width="10" height="10"/>
                <rect x="0" y="40" width="10" height="10"/><rect x="20" y="40" width="10" height="10"/>
                <rect x="40" y="40" width="10" height="10"/><rect x="60" y="40" width="10" height="10"/>
                <rect x="80" y="40" width="10" height="10"/><rect x="90" y="40" width="10" height="10"/>
                <rect x="10" y="50" width="10" height="10"/><rect x="20" y="50" width="10" height="10"/>
                <rect x="30" y="50" width="10" height="10"/><rect x="50" y="50" width="10" height="10"/>
                <rect x="70" y="50" width="10" height="10"/><rect x="0" y="60" width="10" height="10"/>
                <rect x="10" y="60" width="10" height="10"/><rect x="20" y="60" width="10" height="10"/>
                <rect x="30" y="60" width="10" height="10"/><rect x="40" y="60" width="10" height="10"/>
                <rect x="50" y="60" width="10" height="10"/><rect x="60" y="60" width="10" height="10"/>
                <rect x="70" y="60" width="10" height="10"/><rect x="80" y="60" width="10" height="10"/>
                <rect x="90" y="60" width="10" height="10"/><rect x="0" y="70" width="10" height="10"/>
                <rect x="40" y="70" width="10" height="10"/><rect x="50" y="70" width="10" height="10"/>
                <rect x="70" y="70" width="10" height="10"/><rect x="0" y="80" width="10" height="10"/>
                <rect x="20" y="80" width="10" height="10"/><rect x="30" y="80" width="10" height="10"/>
                <rect x="40" y="80" width="10" height="10"/><rect x="50" y="80" width="10" height="10"/>
                <rect x="60" y="80" width="10" height="10"/><rect x="80" y="80" width="10" height="10"/>
                <rect x="0" y="90" width="10" height="10"/><rect x="20" y="90" width="10" height="10"/>
                <rect x="30" y="90" width="10" height="10"/><rect x="40" y="90" width="10" height="10"/>
                <rect x="60" y="90" width="10" height="10"/><rect x="70" y="90" width="10" height="10"/>
                <rect x="90" y="90" width="10" height="10"/>
              </svg>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button className="bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200">
          <div className="flex flex-col items-center gap-2">
            <Shield className="w-6 h-6" />
            <span className="text-sm">Login to ABHA</span>
          </div>
        </button>
        <button className="bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200">
          <div className="flex flex-col items-center gap-2">
            <Users className="w-6 h-6" />
            <span className="text-sm">Create ABHA</span>
          </div>
        </button>
      </div>

      {/* Benefits Section */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Why ABHA?</h3>
        <div className="grid grid-cols-2 gap-3">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div key={index} className={`bg-gradient-to-br ${benefit.color} rounded-xl p-4 text-white shadow-lg`}>
                <IconComponent className="w-8 h-8 mb-2" strokeWidth={2} />
                <h4 className="font-semibold text-sm mb-1">{benefit.title}</h4>
                <p className="text-xs text-white/90 leading-relaxed">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 mb-2">About ABHA</h3>
            <p className="text-sm text-blue-800 mb-3">
              Ayushman Bharat Health Account (ABHA) is a unique digital health ID that enables you to access and share your health records digitally with healthcare providers and payers.
            </p>
            <ul className="text-xs text-blue-700 space-y-1.5">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Link your health records across hospitals</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>View and manage consent for data sharing</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Access your records anytime, anywhere</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
