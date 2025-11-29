import { useState } from 'react';
import { ChevronDown, Search, Eye, FileText, Download, Users, Plus, Filter, Calendar, Pill, User } from 'lucide-react';

export default function MyPrescriptions() {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data - will be replaced with API data
  const prescriptions = [
    {
      id: '1',
      date: 'Nov 18, 2025',
      doctor: 'Dr. Sharma',
      specialty: 'General Physician',
      medicines: 3,
      duration: '7 days'
    },
    {
      id: '2',
      date: 'Nov 10, 2025',
      doctor: 'Dr. Patel',
      specialty: 'Cardiologist',
      medicines: 2,
      duration: '30 days'
    },
    {
      id: '3',
      date: 'Nov 1, 2025',
      doctor: 'Dr. Kumar',
      specialty: 'ENT Specialist',
      medicines: 4,
      duration: '5 days'
    },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-20">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 rounded-2xl shadow-xl p-6 mb-6 text-white relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-6 -mb-6"></div>
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Pill className="text-orange-700" size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold">My Prescriptions</h2>
              <p className="text-orange-100 text-sm">Medicine history & records</p>
            </div>
          </div>
          
          {/* User Profile Dropdown */}
          <div className="relative">
            <button className="w-full flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl p-3 hover:bg-white/30 transition-colors">
              <Users className="w-5 h-5" />
              <div className="flex-1 text-left">
                <div className="font-semibold">User Profile #1</div>
              </div>
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl p-3 text-white shadow-lg">
          <FileText className="w-5 h-5 mb-1 mx-auto" strokeWidth={2} />
          <p className="text-base font-bold text-center">{prescriptions.length}</p>
          <p className="text-[10px] text-center text-white/90">Total</p>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-3 text-white shadow-lg">
          <Calendar className="w-5 h-5 mb-1 mx-auto" strokeWidth={2} />
          <p className="text-base font-bold text-center">This Month</p>
          <p className="text-[10px] text-center text-white/90">2 New</p>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-3 text-white shadow-lg">
          <Pill className="w-5 h-5 mb-1 mx-auto" strokeWidth={2} />
          <p className="text-base font-bold text-center">5</p>
          <p className="text-[10px] text-center text-white/90">Active Meds</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search prescriptions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all">
          <Plus className="w-5 h-5" />
          <span className="text-sm">Add New</span>
        </button>
        <button className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md active:scale-95 transition-all">
          <Filter className="w-5 h-5" />
          <span className="text-sm">Filter</span>
        </button>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-3">
        {prescriptions.map((prescription) => (
          <div key={prescription.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{prescription.doctor}</h3>
                      <p className="text-xs text-gray-600">{prescription.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{prescription.date}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Pill className="w-3.5 h-3.5" />
                      <span>{prescription.medicines} medicines</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span>{prescription.duration}</span>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                <button className="flex items-center justify-center gap-1.5 text-orange-600 hover:bg-orange-50 py-2 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs font-medium">View</span>
                </button>
                <button className="flex items-center justify-center gap-1.5 text-gray-600 hover:bg-gray-50 py-2 rounded-lg transition-colors">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs font-medium">Summary</span>
                </button>
                <button className="flex items-center justify-center gap-1.5 text-gray-600 hover:bg-gray-50 py-2 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  <span className="text-xs font-medium">Download</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-orange-900 mb-1 text-sm">Track Your Medications</h4>
            <p className="text-xs text-orange-800">
              Keep all your prescriptions organized and never miss a dose with medication reminders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
