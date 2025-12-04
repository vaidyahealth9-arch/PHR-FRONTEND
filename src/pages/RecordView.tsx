import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Building2, 
  User, 
  Download, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { recordsApi } from '../api/client';

interface Analyte {
  name: string;
  result: string;
  unit: string;
  reference_range: string;
  status_color: string;
  method: string;
}

interface RecordDetails {
  order_details: {
    order_id: number;
    display_id: string;
    date: string;
    lab_name: string;
    status: string;
    test_names: string[];
    patient?: {
      first_name: string;
      last_name: string;
      date_of_birth: string;
      gender: string;
    };
    requester?: {
      first_name: string;
      last_name: string;
    };
  };
  analytes: Analyte[];
}

export default function RecordView() {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<RecordDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchRecord = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await recordsApi.getDetails(parseInt(id));
        setRecord(response.data);
      } catch (err: any) {
        console.error('Failed to fetch record:', err);
        setError(err.response?.data?.detail || 'Failed to load record details');
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id]);

  const handleDownload = async () => {
    if (!id) return;
    
    setDownloading(true);
    try {
      const response = await recordsApi.download(parseInt(id));
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${id}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Failed to download:', err);
      alert('Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusIcon = (color: string) => {
    switch (color.toUpperCase()) {
      case 'GREEN':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'AMBER':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'RED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBg = (color: string) => {
    switch (color.toUpperCase()) {
      case 'GREEN':
        return 'bg-green-50 border-green-200';
      case 'AMBER':
        return 'bg-amber-50 border-amber-200';
      case 'RED':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500">Loading report details...</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 font-medium mb-2">Failed to load report</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <Link
            to="/records/reports"
            className="inline-flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  const { order_details, analytes } = record;

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link 
          to="/records/reports"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-lg font-bold text-gray-900 flex-1">Report Details</h1>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {downloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Download
        </button>
      </div>

      {/* Report Info Card */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl shadow-xl p-5 mb-4 text-white">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <FileText className="text-blue-700 w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg leading-tight mb-1">
              {order_details.test_names.join(', ') || 'Medical Report'}
            </h2>
            <p className="text-blue-100 text-sm">ID: {order_details.display_id}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-100 text-xs mb-1">
              <Calendar className="w-3.5 h-3.5" />
              Date
            </div>
            <p className="font-semibold text-sm">{formatDate(order_details.date)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-100 text-xs mb-1">
              <Building2 className="w-3.5 h-3.5" />
              Lab
            </div>
            <p className="font-semibold text-sm truncate">{order_details.lab_name}</p>
          </div>
        </div>

        {order_details.requester && (
          <div className="mt-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-100 text-xs mb-1">
              <User className="w-3.5 h-3.5" />
              Requested By
            </div>
            <p className="font-semibold text-sm">
              Dr. {order_details.requester.first_name} {order_details.requester.last_name}
            </p>
          </div>
        )}
      </div>

      {/* Test Results */}
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900 mb-3">
          Test Results ({analytes.length})
        </h3>
        
        {analytes.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No test results available yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analytes.map((analyte, index) => (
              <div 
                key={index}
                className={`rounded-xl border p-4 ${getStatusBg(analyte.status_color)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{analyte.name}</h4>
                    {analyte.method && (
                      <p className="text-xs text-gray-500">Method: {analyte.method}</p>
                    )}
                  </div>
                  {getStatusIcon(analyte.status_color)}
                </div>
                
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-gray-900">{analyte.result}</span>
                  <span className="text-sm text-gray-600">{analyte.unit}</span>
                </div>
                
                {analyte.reference_range && (
                  <div className="text-xs text-gray-500">
                    Reference: {analyte.reference_range}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h4 className="text-xs font-semibold text-gray-700 mb-3">Result Indicators</h4>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-gray-600">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-gray-600">Borderline</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-gray-600">Abnormal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
