import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, FileText, Download, User, Plus, Filter, Calendar, Activity, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { recordsApi, authApi } from '../api/client';

interface Report {
  order_id: number;
  display_id: string;
  date: string;
  lab_name: string;
  status: string;
  test_names: string[];
}

interface UserProfile {
  full_name?: string;
  first_name?: string;
  last_name?: string;
}

export default function MyReports() {
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [userName, setUserName] = useState<string>('Loading...');

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { search?: string } = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      
      const response = await recordsApi.list(params);
      setReports(response.data);
    } catch (err: any) {
      console.error('Failed to fetch reports:', err);
      if (err.response?.status === 404) {
        setError('No patient profile linked. Please complete your profile setup.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError(err.response?.data?.detail || 'Failed to load reports. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch user profile for name
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await authApi.me();
        const profile: UserProfile = response.data;
        if (profile.full_name) {
          setUserName(profile.full_name);
        } else if (profile.first_name) {
          setUserName(`${profile.first_name}${profile.last_name ? ' ' + profile.last_name : ''}`);
        } else {
          setUserName('My Profile');
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setUserName('My Profile');
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    fetchReports();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReports();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Date filter logic
  useEffect(() => {
    if (!dateFilter) {
      setFilteredReports(reports);
      return;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const filtered = reports.filter(report => {
      const reportDate = new Date(report.date);
      
      switch (dateFilter) {
        case 'today': {
          const reportDay = new Date(reportDate.getFullYear(), reportDate.getMonth(), reportDate.getDate());
          return reportDay.getTime() === today.getTime();
        }
        case 'week': {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return reportDate >= weekAgo;
        }
        case 'month': {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return reportDate >= monthAgo;
        }
        case '3months': {
          const threeMonthsAgo = new Date(today);
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          return reportDate >= threeMonthsAgo;
        }
        case '6months': {
          const sixMonthsAgo = new Date(today);
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          return reportDate >= sixMonthsAgo;
        }
        case 'year': {
          const yearAgo = new Date(today);
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          return reportDate >= yearAgo;
        }
        default:
          return true;
      }
    });
    
    setFilteredReports(filtered);
  }, [dateFilter, reports]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'normal' || s === 'final') return 'green';
    if (s === 'pending' || s === 'in-progress' || s === 'review') return 'orange';
    if (s === 'cancelled' || s === 'abnormal') return 'red';
    return 'gray';
  };

  const getStatusLabel = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'final') return 'Completed';
    if (s === 'pending') return 'Pending';
    if (s === 'in-progress') return 'In Progress';
    return status;
  };

  const handleDownload = async (orderId: number) => {
    try {
      const response = await recordsApi.download(orderId);
      const blob = new Blob([response.data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${orderId}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download:', err);
      alert('Failed to download report');
    }
  };

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
              <FileText className="text-blue-700" size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold">My Reports</h2>
              <p className="text-blue-100 text-sm">Lab test results & analysis</p>
            </div>
          </div>
          
          {/* User Profile Display */}
          <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <User className="w-5 h-5" />
            <div className="flex-1 text-left">
              <div className="font-semibold">{userName}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-3 text-white shadow-lg">
          <Activity className="w-5 h-5 mb-1 mx-auto" strokeWidth={2} />
          <p className="text-base font-bold text-center">{loading ? '-' : filteredReports.length}</p>
          <p className="text-[10px] text-center text-white/90">Total Reports</p>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-3 text-white shadow-lg">
          <Calendar className="w-5 h-5 mb-1 mx-auto" strokeWidth={2} />
          <p className="text-base font-bold text-center">
            {loading ? '-' : filteredReports.filter(r => {
              const d = new Date(r.date);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length}
          </p>
          <p className="text-[10px] text-center text-white/90">This Month</p>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl p-3 text-white shadow-lg">
          <Eye className="w-5 h-5 mb-1 mx-auto" strokeWidth={2} />
          <p className="text-base font-bold text-center">
            {loading ? '-' : filteredReports.filter(r => r.status.toLowerCase() === 'pending' || r.status.toLowerCase() === 'in-progress').length}
          </p>
          <p className="text-[10px] text-center text-white/90">Pending</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search reports by test name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Link 
          to="/upload"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm">Add Report</span>
        </Link>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center gap-2 font-semibold py-3 px-4 rounded-xl border shadow-sm hover:shadow-md active:scale-95 transition-all ${
            showFilters || dateFilter ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span className="text-sm">Filter</span>
          {dateFilter && (
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="year">Last Year</option>
          </select>
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="w-full mt-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear Filter
            </button>
          )}
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-gray-500 text-sm">Loading reports...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-red-700 font-medium mb-2">Unable to load reports</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={fetchReports}
              className="inline-flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-700 font-medium mb-2">No reports found</p>
            <p className="text-gray-500 text-sm mb-4">
              {searchQuery 
                ? 'Try adjusting your search' 
                : 'Upload your first report to get started'}
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Upload Report
            </Link>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-700 font-medium mb-2">No reports in selected date range</p>
            <p className="text-gray-500 text-sm mb-4">
              Try adjusting your date filter to see more reports
            </p>
            <button
              onClick={() => setDateFilter('')}
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Clear Filter
            </button>
          </div>
        ) : (
          filteredReports.map((report) => {
            const statusColor = getStatusColor(report.status);
            return (
              <div key={report.order_id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">
                        {report.test_names.length > 0 ? report.test_names.join(', ') : 'Medical Report'}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(report.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{report.lab_name}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">ID: {report.display_id}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      statusColor === 'green' 
                        ? 'bg-green-100 text-green-700' 
                        : statusColor === 'orange'
                        ? 'bg-orange-100 text-orange-700'
                        : statusColor === 'red'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {getStatusLabel(report.status)}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                    <Link 
                      to={`/records/view/${report.order_id}`}
                      className="flex items-center justify-center gap-1.5 text-blue-600 hover:bg-blue-50 py-2 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-xs font-medium">View Details</span>
                    </Link>
                    <button 
                      onClick={() => handleDownload(report.order_id)}
                      className="flex items-center justify-center gap-1.5 text-gray-600 hover:bg-gray-50 py-2 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-xs font-medium">Download</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1 text-sm">Keep Your Reports Organized</h4>
            <p className="text-xs text-blue-800">
              Upload and store all your lab reports in one place for easy access and tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
