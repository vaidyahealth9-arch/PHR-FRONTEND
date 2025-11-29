import { useState, useEffect } from 'react';
import { ChevronDown, Search, Eye, Download } from 'lucide-react';
import { Users } from 'lucide-react';

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

export default function RadiologyImages() {
  const [userName, setUserName] = useState<string>('User');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Sample data with example radiology images
  const radiologyImages = [
    {
      id: 1,
      test: 'Chest X-ray',
      date: '',
      lab: '',
    },
    {
      id: 2,
      test: 'MRI Head & Spine',
      date: '',
      lab: '',
    },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-4">
      {/* User Profile Header with Dropdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 flex items-center justify-between cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-700 rounded-full flex items-center justify-center text-white">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              User Profile #1
            </h2>
          </div>
        </div>
        <ChevronDown size={20} className="text-cyan-600" />
      </div>

      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🩻</span>
          </div>
          <h1 className="text-base font-semibold text-gray-900">Radiology Images</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search Images"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Sort and Filter Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-300 transition-colors">
          Sort
        </button>
        <button className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-300 transition-colors">
          Filter
        </button>
      </div>

      {/* Table Header */}
      <div className="bg-gray-600 text-white rounded-t-lg overflow-hidden">
        <div className="grid grid-cols-4 text-xs font-medium">
          <div className="px-3 py-2.5 border-r border-gray-500">Date</div>
          <div className="px-3 py-2.5 border-r border-gray-500">Test</div>
          <div className="px-3 py-2.5 border-r border-gray-500">Lab??</div>
          <div className="px-3 py-2.5">Action</div>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-b-lg border border-t-0 border-gray-200">
        {radiologyImages.map((image, index) => (
          <div 
            key={image.id} 
            className={`grid grid-cols-4 text-xs ${index !== radiologyImages.length - 1 ? 'border-b border-gray-200' : ''}`}
          >
            <div className="px-3 py-4 flex items-center border-r border-gray-200">
              <span className="text-gray-600">{image.date || '-'}</span>
            </div>
            <div className="px-3 py-4 flex items-center border-r border-gray-200">
              <span className="text-gray-900 font-medium">{image.test}</span>
            </div>
            <div className="px-3 py-4 flex items-center border-r border-gray-200">
              <span className="text-gray-600">{image.lab || '-'}</span>
            </div>
            <div className="px-3 py-4 space-y-2">
              <button className="flex items-center gap-2 text-gray-700 hover:text-cyan-600 transition-colors w-full">
                <Eye size={16} />
                <span className="text-xs">View</span>
              </button>
              <button className="flex items-center gap-2 text-gray-700 hover:text-cyan-600 transition-colors w-full">
                <Download size={16} />
                <span className="text-xs">Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
