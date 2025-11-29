import { Link } from 'react-router-dom';
import { Users, Calendar, Activity, TrendingUp, Bell, ChevronRight, Heart, Zap, FileText, Pill, Clock, Lightbulb, Microscope } from 'lucide-react';
import { useProfiles } from '../hooks/useApi';
import { Spinner } from '../components/Loading';
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

export default function Dashboard() {
  const { isLoading: profilesLoading } = useProfiles();
  const [userName, setUserName] = useState<string>('User');

  useEffect(() => {
    // Decode JWT to get user info
    const token = localStorage.getItem('access_token');
    if (token) {
      const decoded = decodeJWT(token);
      console.log('Decoded JWT:', decoded);
      
      if (decoded?.name) {
        // Use the name from JWT token
        setUserName(decoded.name);
      } else if (decoded?.email) {
        // Extract name from email (before @)
        const name = decoded.email.split('@')[0]
          .split('.')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        setUserName(name);
      } else if (decoded?.sub) {
        // Use phone number as fallback
        const name = `User ${decoded.sub.slice(-4)}`;
        setUserName(name);
      }
    }
  }, []);

  if (profilesLoading) {
    return <Spinner size="lg" />;
  }

  const menuItems = [
    {
      title: 'My Reports',
      icon: FileText,
      route: '/records/reports',
      bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600',
      description: 'Lab test results',
    },
    {
      title: 'My Prescriptions',
      icon: Pill,
      route: '/records/prescriptions',
      bgColor: 'bg-gradient-to-br from-orange-400 to-orange-600',
      description: 'Medicine history',
    },
    {
      title: 'Medication Reminder',
      icon: Clock,
      route: '/medication-reminder',
      bgColor: 'bg-gradient-to-br from-cyan-400 to-cyan-600',
      description: 'Never miss a dose',
      badge: '2',
    },
    {
      title: 'Trackers',
      icon: Heart,
      route: '/trackers',
      bgColor: 'bg-gradient-to-br from-red-400 to-red-600',
      description: 'Monitor vitals',
    },
    {
      title: 'Recommended Tests',
      icon: Lightbulb,
      route: '/tests',
      bgColor: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      description: 'Health checkups',
    },
    {
      title: 'My Health Insights',
      icon: Microscope,
      route: '/insights',
      bgColor: 'bg-gradient-to-br from-purple-400 to-purple-600',
      description: 'AI-powered analysis',
    },
  ];

  const quickStats = [
    { label: 'Health Score', value: '85', icon: Heart, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Upcoming', value: '3', icon: Calendar, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Records', value: '24', icon: Activity, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ];

  const upcomingReminders = [
    { title: 'Blood Pressure Check', time: 'Today, 2:00 PM', type: 'tracker' },
    { title: 'Pan-D 40mg', time: 'Today, 7:30 PM', type: 'medication' },
    { title: 'Annual Health Checkup', time: 'Dec 15, 2025', type: 'appointment' },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-20">
      {/* Enhanced User Profile Header */}
      <div className="bg-gradient-to-br from-cyan-600 via-cyan-700 to-cyan-800 rounded-2xl shadow-xl p-6 mb-6 text-white relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-6 -mb-6"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Users className="text-cyan-700" size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  Hello, {userName}! 👋
                </h2>
                <p className="text-cyan-100 text-sm">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
            <button className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {quickStats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <stat.icon className="w-5 h-5 mx-auto mb-1 text-white" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-cyan-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Reminders */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Coming Up
          </h3>
          <Link to="/medication-reminder" className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1">
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-2">
          {upcomingReminders.map((reminder, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                reminder.type === 'medication' ? 'bg-orange-100' :
                reminder.type === 'tracker' ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                <span className="text-xl">
                  {reminder.type === 'medication' ? '💊' :
                   reminder.type === 'tracker' ? '❤️' : '📅'}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{reminder.title}</p>
                <p className="text-xs text-gray-500">{reminder.time}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          ))}
        </div>
      </div>

      {/* Health Tip of the Day */}
      <div className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-green-900 mb-1">Health Tip of the Day</h4>
            <p className="text-sm text-green-800">
              Drinking 8 glasses of water daily helps maintain blood pressure and improves overall health. Stay hydrated! 💧
            </p>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Your Health Hub</h3>
        <p className="text-sm text-gray-600">Quick access to all your health features</p>
      </div>

      {/* Enhanced Menu Grid */}
      <div className="grid grid-cols-2 gap-4">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={index}
              to={item.route}
              className="relative bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl active:scale-95 transition-all duration-200"
            >
              {/* Badge */}
              {item.badge && (
                <div className="absolute top-3 right-3 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg z-10">
                  {item.badge}
                </div>
              )}

              {/* Gradient Background with Icon */}
              <div className={`${item.bgColor} p-6 pb-4 flex items-center justify-center`}>
                <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                  <IconComponent className="w-12 h-12 text-gray-700" strokeWidth={1.5} />
                </div>
              </div>

              {/* Content */}
              <div className="p-4 pt-3 bg-white">
                <h3 className="text-center font-bold text-gray-900 text-sm mb-1">
                  {item.title}
                </h3>
                <p className="text-center text-xs text-gray-500">
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
