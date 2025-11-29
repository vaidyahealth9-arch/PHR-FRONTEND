import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/client';
import { ChevronRight, User, Users, FileText, Settings, Bell, Lock, HelpCircle, LogOut, X, Edit2, Camera, Share2, Download, Star, Award, Activity, Heart } from 'lucide-react';

interface UserProfile {
  id: number;
  first_name: string | null;
  last_name: string | null;
  middle_name: string | null;
  gender: string | null;
  date_of_birth: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  abha_address: string | null;
  abha_id: string | null;
  full_name: string;
  age: number | null;
}

interface FamilyProfile {
  id: string;
  name: string;
  relation: string;
  avatar: string;
  age: number;
  bloodGroup: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<FamilyProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'medical' | 'vitals'>('overview');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await authApi.me();
        setUserProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  // Format date of birth for display
  const formatDateOfBirth = (dateStr: string | null) => {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Get gender display text
  const getGenderDisplay = (gender: string | null) => {
    if (!gender) return '';
    const genderMap: { [key: string]: string } = {
      'M': 'Male',
      'F': 'Female',
      'male': 'Male',
      'female': 'Female',
      'Male': 'Male',
      'Female': 'Female',
    };
    return genderMap[gender] || gender;
  };

  // Build profile summary string (e.g., "32 years • Male")
  const getProfileSummary = () => {
    const parts = [];
    if (userProfile?.age) parts.push(`${userProfile.age} years`);
    if (userProfile?.gender) parts.push(getGenderDisplay(userProfile.gender));
    return parts.join(' • ') || 'Complete your profile';
  };

  const familyProfiles: FamilyProfile[] = [
    { id: '2', name: 'Anjali Sharma', relation: 'Mother', avatar: '👩', age: 58, bloodGroup: 'A+' },
    { id: '3', name: 'Priya Sharma', relation: 'Daughter', avatar: '👧', age: 8, bloodGroup: 'O+' },
    { id: '4', name: 'Rajesh Sharma', relation: 'Father', avatar: '👨', age: 62, bloodGroup: 'B+' },
  ];

  const healthStats = [
    { icon: Activity, label: 'Health Score', value: '85/100', color: 'text-green-600', bgColor: 'bg-green-50' },
    { icon: Heart, label: 'Last Checkup', value: '2 weeks ago', color: 'text-red-600', bgColor: 'bg-red-50' },
    { icon: Award, label: 'Records', value: '24 items', color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { icon: Star, label: 'Streak', value: '15 days', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  ];

  const MenuItem = ({ icon: Icon, label, onClick, color = 'text-gray-700', badge }: any) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="font-medium text-gray-800">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">{badge}</span>}
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </button>
  );

  const handleFamilyClick = (profile: FamilyProfile) => {
    setSelectedFamily(profile);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-20">
      {/* Current User Profile with Enhanced Design */}
      <div className="mb-6 relative">
        <div className="bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-700 rounded-2xl p-6 text-white shadow-xl">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-6 -mb-6"></div>
          
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-12 h-12 text-cyan-600" />
                  </div>
                  <button className="absolute bottom-0 right-0 w-7 h-7 bg-cyan-900 rounded-full flex items-center justify-center shadow-lg hover:bg-cyan-800 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div>
                  <h2 className="text-xl font-bold">{userProfile?.full_name || 'Loading...'}</h2>
                  <p className="text-cyan-100 text-sm">{getProfileSummary()}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                      Primary Account
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowProfileModal(true)}
                className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            {/* Health Stats Grid */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {healthStats.map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className="w-4 h-4 text-white" />
                    <span className="text-xs text-cyan-100">{stat.label}</span>
                  </div>
                  <p className="text-lg font-bold">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button 
                onClick={() => setShowProfileModal(true)}
                className="flex-1 bg-white text-cyan-600 hover:bg-cyan-50 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                View Full Profile
              </button>
              <button className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Family Profiles */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-600" />
            Family Profiles
          </h2>
          <span className="text-sm text-gray-500">{familyProfiles.length} members</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {familyProfiles.map((profile, index) => (
            <button
              key={profile.id}
              onClick={() => handleFamilyClick(profile)}
              className={`w-full flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-transparent transition-all ${
                index !== familyProfiles.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-3xl shadow-sm">
                  {profile.avatar}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{profile.name}</div>
                  <div className="text-sm text-gray-500">{profile.relation} • {profile.age} years • {profile.bloodGroup}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
          
          {/* Add Profile Button */}
          <button 
            onClick={() => setShowAddFamilyModal(true)}
            className="w-full flex items-center justify-center gap-2 p-4 text-cyan-600 hover:bg-cyan-50 transition-colors font-semibold border-t-2 border-dashed border-gray-200"
          >
            <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-cyan-600">+</span>
            </div>
            <span>Add Family Member</span>
          </button>
        </div>
      </div>

      {/* Shared Records Section */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-600" />
          Quick Access
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => navigate('/records/radiology')}
            className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <div className="mb-2">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Radiology</h3>
            <p className="text-xs text-purple-100">View images</p>
          </button>
          <button 
            onClick={() => navigate('/records/reports')}
            className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <div className="mb-2">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Reports</h3>
            <p className="text-xs text-blue-100">Lab results</p>
          </button>
          <button 
            onClick={() => navigate('/records/prescriptions')}
            className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <div className="mb-2">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Prescriptions</h3>
            <p className="text-xs text-green-100">Medicine list</p>
          </button>
          <button 
            onClick={() => navigate('/trackers')}
            className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <div className="mb-2">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Trackers</h3>
            <p className="text-xs text-orange-100">Health data</p>
          </button>
        </div>
      </div>

      {/* Settings & Options */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-600" />
          Settings & Preferences
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <MenuItem icon={Bell} label="Notifications" badge="3" onClick={() => alert('Notifications settings')} />
          <MenuItem icon={Lock} label="Privacy & Security" onClick={() => alert('Privacy settings')} />
          <MenuItem icon={User} label="Account Settings" onClick={() => alert('Account settings')} />
          <MenuItem icon={Download} label="Download My Data" color="text-blue-600" onClick={() => alert('Preparing download...')} />
          <MenuItem icon={HelpCircle} label="Help & Support" onClick={() => alert('Help center')} />
        </div>
      </div>

      {/* Data & Privacy Info */}
      <div className="mb-6 bg-cyan-50 rounded-lg p-4 border border-cyan-100">
        <h3 className="font-semibold text-sm mb-2 text-cyan-900 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Data & Privacy
        </h3>
        <ul className="text-xs text-cyan-800 space-y-1">
          <li>✓ Avatar, name/age/dob/etc, BMI, blood group</li>
          <li>✓ Medical history (conditions, allergies, surgeries)</li>
          <li>✓ Recently updated vitals</li>
          <li>✓ All data encrypted at rest and in transit</li>
          <li>✓ You control who has access to your records</li>
        </ul>
      </div>

      {/* Logout Button */}
      <button
        onClick={() => {
          if (window.confirm('Are you sure you want to logout?')) {
            logout();
          }
        }}
        className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>

      {/* Profile Details Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white p-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold">Complete Profile</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Profile Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <div className="w-28 h-28 bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-full flex items-center justify-center shadow-xl">
                    <User className="w-16 h-16 text-white" />
                  </div>
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-cyan-900 rounded-full flex items-center justify-center shadow-lg hover:bg-cyan-800 transition-colors">
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{userProfile?.full_name || 'User'}</h3>
                <p className="text-sm text-gray-500 mb-3">{userProfile?.contact_email || userProfile?.contact_phone || ''}</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-medium">Primary Account</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Verified</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 pb-3 font-medium transition-colors ${
                    activeTab === 'overview'
                      ? 'text-cyan-600 border-b-2 border-cyan-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('medical')}
                  className={`flex-1 pb-3 font-medium transition-colors ${
                    activeTab === 'medical'
                      ? 'text-cyan-600 border-b-2 border-cyan-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Medical
                </button>
                <button
                  onClick={() => setActiveTab('vitals')}
                  className={`flex-1 pb-3 font-medium transition-colors ${
                    activeTab === 'vitals'
                      ? 'text-cyan-600 border-b-2 border-cyan-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Vitals
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <label className="text-xs text-gray-600 font-medium">Age</label>
                      <p className="text-lg font-bold text-gray-900">{userProfile?.age ? `${userProfile.age} years` : 'Not set'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <label className="text-xs text-gray-600 font-medium">Date of Birth</label>
                      <p className="text-lg font-bold text-gray-900">{formatDateOfBirth(userProfile?.date_of_birth || null)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <label className="text-xs text-gray-600 font-medium">Gender</label>
                      <p className="text-lg font-bold text-gray-900">{getGenderDisplay(userProfile?.gender || null) || 'Not set'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <label className="text-xs text-gray-600 font-medium">Blood Group</label>
                      <p className="text-lg font-bold text-red-600">Not set</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <label className="text-xs text-gray-600 font-medium">Phone</label>
                    <p className="text-sm font-semibold text-gray-900">{userProfile?.contact_phone ? `+91 ${userProfile.contact_phone}` : 'Not set'}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <label className="text-xs text-gray-600 font-medium">Email</label>
                    <p className="text-sm font-semibold text-gray-900">{userProfile?.contact_email || 'Not set'}</p>
                  </div>

                  {(userProfile?.address_line1 || userProfile?.city || userProfile?.state) && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <label className="text-xs text-gray-600 font-medium">Address</label>
                      <p className="text-sm font-semibold text-gray-900">
                        {[userProfile?.address_line1, userProfile?.address_line2, userProfile?.city, userProfile?.state, userProfile?.postal_code, userProfile?.country].filter(Boolean).join(', ') || 'Not set'}
                      </p>
                    </div>
                  )}

                  {userProfile?.abha_id && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <label className="text-xs text-blue-600 font-medium">ABHA ID</label>
                      <p className="text-sm font-semibold text-blue-900">{userProfile.abha_id}</p>
                      {userProfile.abha_address && (
                        <p className="text-xs text-blue-700 mt-1">Address: {userProfile.abha_address}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'medical' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-600 font-medium mb-2 block">Chronic Conditions</label>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium">Hypertension</span>
                      <button className="px-3 py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg text-sm hover:border-cyan-500 hover:text-cyan-600">+ Add</button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-600 font-medium mb-2 block">Allergies</label>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium">Penicillin</span>
                      <span className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium">Pollen</span>
                      <button className="px-3 py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg text-sm hover:border-cyan-500 hover:text-cyan-600">+ Add</button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-600 font-medium mb-2 block">Medications</label>
                    <div className="space-y-2">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="font-medium text-sm">Amlodipine 5mg</p>
                        <p className="text-xs text-gray-600">Once daily • For hypertension</p>
                      </div>
                      <button className="w-full px-3 py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg text-sm hover:border-cyan-500 hover:text-cyan-600">+ Add Medication</button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-600 font-medium mb-2 block">Past Surgeries</label>
                    <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">None recorded</p>
                  </div>
                </div>
              )}

              {activeTab === 'vitals' && (
                <div className="space-y-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-blue-900">Blood Pressure</p>
                      <span className="text-xs text-blue-600">Today, 9:30 AM</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-700">120/80</p>
                    <p className="text-xs text-blue-600 mt-1">mmHg • Normal</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-green-900">Blood Sugar (Fasting)</p>
                      <span className="text-xs text-green-600">Yesterday</span>
                    </div>
                    <p className="text-3xl font-bold text-green-700">95</p>
                    <p className="text-xs text-green-600 mt-1">mg/dL • Normal</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-purple-900">Heart Rate</p>
                      <span className="text-xs text-purple-600">2 hours ago</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-700">72</p>
                    <p className="text-xs text-purple-600 mt-1">bpm • Normal</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-orange-900">Temperature</p>
                      <span className="text-xs text-orange-600">Today, 7:00 AM</span>
                    </div>
                    <p className="text-3xl font-bold text-orange-700">98.6°F</p>
                    <p className="text-xs text-orange-600 mt-1">Normal</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 rounded-b-2xl">
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold rounded-lg transition-all shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Family Member Modal */}
      {showAddFamilyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddFamilyModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white p-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold">Add Family Member</h2>
              <button
                onClick={() => setShowAddFamilyModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" placeholder="Enter full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                    <option>Select relationship</option>
                    <option>Father</option>
                    <option>Mother</option>
                    <option>Spouse</option>
                    <option>Son</option>
                    <option>Daughter</option>
                    <option>Brother</option>
                    <option>Sister</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" placeholder="Age" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                      <option>Select</option>
                      <option>A+</option>
                      <option>A-</option>
                      <option>B+</option>
                      <option>B-</option>
                      <option>O+</option>
                      <option>O-</option>
                      <option>AB+</option>
                      <option>AB-</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddFamilyModal(false)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Family member added successfully!');
                    setShowAddFamilyModal(false);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-semibold rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-all"
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Family Member Modal */}
      {selectedFamily && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedFamily(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold">Family Member Profile</h2>
              <button
                onClick={() => setSelectedFamily(null)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center text-5xl mb-3 shadow-lg">
                  {selectedFamily.avatar}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedFamily.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{selectedFamily.relation}</p>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Family Member</span>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <label className="text-xs text-gray-600 font-medium">Age</label>
                    <p className="text-lg font-bold text-gray-900">{selectedFamily.age} years</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <label className="text-xs text-gray-600 font-medium">Blood Group</label>
                    <p className="text-lg font-bold text-red-600">{selectedFamily.bloodGroup}</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">Quick Actions</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate('/records/reports')}
                      className="flex-1 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                    >
                      View Records
                    </button>
                    <button 
                      onClick={() => navigate('/trackers')}
                      className="flex-1 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                    >
                      Track Health
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedFamily(null)}
                className="w-full py-3 mt-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
