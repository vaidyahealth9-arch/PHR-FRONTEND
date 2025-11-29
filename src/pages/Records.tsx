import { Link } from 'react-router-dom';
import { Users, ChevronDown, FileText, Pill, Image, Calendar, TrendingUp, FolderOpen } from 'lucide-react';
import { useState, useEffect } from 'react';

// Simple JWT decoder
function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function Records() {
  const [userName, setUserName] = useState<string>('User');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded?.email) {
        const name = decoded.email.split('@')[0]
          .split('.')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        setUserName(name);
      } else if (decoded?.phone) {
        setUserName(`User ${decoded.phone.slice(-4)}`);
      }
    }
  }, []);

  const recordCategories = [
    {
      title: 'My Reports',
      icon: FileText,
      route: '/records/reports',
      bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600',
      description: 'Lab test results',
      count: '12 reports',
    },
    {
      title: 'My Prescriptions',
      icon: Pill,
      route: '/records/prescriptions',
      bgColor: 'bg-gradient-to-br from-orange-400 to-orange-600',
      description: 'Medicine history',
      count: '8 prescriptions',
    },
    {
      title: 'Radiology Images',
      icon: Image,
      route: '/records/radiology',
      bgColor: 'bg-gradient-to-br from-purple-400 to-purple-600',
      description: 'X-rays, MRI, CT scans',
      count: '4 images',
    },
  ];

  const quickStats = [
    { label: 'Total Records', value: '24', icon: FolderOpen, color: 'from-cyan-600 via-cyan-700 to-cyan-800' },
    { label: 'Last Updated', value: 'Today', icon: Calendar, color: 'from-cyan-600 via-cyan-700 to-cyan-800' },
    { label: 'This Month', value: '5 new', icon: TrendingUp, color: 'from-cyan-600 via-cyan-700 to-cyan-800' },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-20">
      {/* Enhanced User Profile Header */}
      <div className="bg-gradient-to-br from-cyan-600 via-cyan-700 to-cyan-800 rounded-2xl shadow-xl p-6 mb-6 text-white relative overflow-hidden cursor-pointer">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-6 -mb-6"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Users className="text-cyan-700" size={28} />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {userName}
              </h2>
              <p className="text-cyan-100 text-sm">
                My Health Records
              </p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
            <ChevronDown size={20} />
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {quickStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className={`bg-gradient-to-br ${stat.color} rounded-xl p-3 text-white shadow-lg`}>
              <IconComponent className="w-5 h-5 mb-1 mx-auto" strokeWidth={2} />
              <p className="text-base font-bold text-center">{stat.value}</p>
              <p className="text-[10px] text-center text-white/90">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Section Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Browse Records</h3>
        <p className="text-sm text-gray-600">Access your medical documents</p>
      </div>

      {/* Enhanced Records Grid */}
      <div className="grid grid-cols-1 gap-4">
        {recordCategories.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={index}
              to={item.route}
              className="relative bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl active:scale-98 transition-all duration-200 flex"
            >
              {/* Gradient Side Panel */}
              <div className={`${item.bgColor} w-24 flex items-center justify-center flex-shrink-0`}>
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                  <IconComponent className="w-9 h-9 text-gray-700" strokeWidth={1.5} />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 flex flex-col justify-center">
                <h3 className="font-bold text-gray-900 text-base mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {item.description}
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-500 font-medium">{item.count}</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center pr-4">
                <ChevronDown className="w-5 h-5 text-gray-400 transform -rotate-90" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1 text-sm">Need to upload a record?</h4>
            <p className="text-xs text-blue-800 mb-3">
              Easily add new reports, prescriptions, or images to keep your health records up to date.
            </p>
            <Link 
              to="/upload"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Upload Record
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
