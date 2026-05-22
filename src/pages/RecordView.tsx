import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck
} from 'lucide-react';
import { recordsApi, limsApi } from '../api/client';
import { useActiveProfile } from '../context/ProfileContext';

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
    };
    metadata?: {
      source: string;
      record_type: string;
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

  const { profiles, activeProfileId } = useActiveProfile();
  const validActiveProfileId = activeProfileId && profiles.some((p) => p.id === activeProfileId)
    ? activeProfileId
    : '';

  useEffect(() => {
    const fetchRecord = async () => {
      if (!id) return;
      try {
        const response = await recordsApi.getDetails(parseInt(id));
        setRecord(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Identity Mismatch');
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  const handleDownloadOriginal = async () => {
    if (!id) return;
    setDownloading(true);
    try {
      const response = await recordsApi.download(parseInt(id));
      const rawContentType = response.headers?.['content-type'];
      const contentType = typeof rawContentType === 'string'
        ? rawContentType
        : Array.isArray(rawContentType) && rawContentType.length > 0
          ? rawContentType[0]
          : 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const contentDisposition = response.headers?.['content-disposition'];
      let filename = `report_${id}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a); 
      a.click();
      window.URL.revokeObjectURL(url); 
      document.body.removeChild(a);
    } catch {
      alert('Failed to download file');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPdf = async (type: 'smart' | 'regular') => {
    if (!id) return;
    setDownloading(true);
    try {
      // The order_id is encoded with LIMS_RECORD_ID_OFFSET (2_000_000_000)
      // We need to pass the real LIMS serviceRequestId to the download endpoint
      const LIMS_OFFSET = 2_000_000_000;
      const realLimsId = parseInt(id) - LIMS_OFFSET;
      const response = await limsApi.downloadLinkedReportPdf(realLimsId, type, true, validActiveProfileId || undefined);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${realLimsId}-${type}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert('Failed to download PDF. The report may not be generated yet.');
    } finally {
      setDownloading(false);
    }
  };

  const formatTwoDecimals = (value: string | number): string => {
    const parsed = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(parsed)) {
      return String(value);
    }
    return parsed.toFixed(2);
  };

  const formatReferenceRange = (value: string): string => {
    if (!value) return value;
    return value.replace(/-?\d*\.?\d+/g, (match) => {
      const parsed = Number(match);
      return Number.isFinite(parsed) ? parsed.toFixed(2) : match;
    });
  };

  const getStatusIcon = (color: string) => {
    switch (color.toUpperCase()) {
      case 'GREEN': return <CheckCircle size={20} className="text-success-700 fill-success-50" />;
      case 'AMBER': return <AlertTriangle size={20} className="text-warning-700 fill-warning-50" />;
      case 'RED': return <XCircle size={20} className="text-danger-700 fill-danger-50" />;
      default: return <AlertCircle size={20} className="text-slate-400" />;
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center p-4 text-primary-700 font-extrabold uppercase tracking-[0.2em] text-xs">Loading report...</div>;

  if (error || !record) return (
    <div className="w-full px-4 sm:px-6 py-24 text-center space-y-8 font-inter">
      <div className="w-20 h-20 bg-rose-50 rounded-[1.5rem] flex items-center justify-center mx-auto text-rose-500 shadow-xl shadow-rose-100">
        <AlertCircle size={44} strokeWidth={2.5} />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-lexend font-bold text-slate-900 tracking-tight">Unable to open report</h2>
        <p className="text-xs font-medium text-slate-400 leading-relaxed">Please check login and active profile<br />and try again.</p>
      </div>
      <Link to="/records" className="block bg-slate-900 text-white py-4 px-6 rounded-2xl font-semibold text-sm shadow-lg active:scale-95 transition-all">Back to reports</Link>
    </div>
  );

  const { order_details, analytes } = record;

  return (
    <div className="w-full px-4 sm:px-6 py-8 pb-32 space-y-10 font-inter">
      {/* 🚀 Unified Report Header */}
      <header className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link to="/records" className="w-full sm:w-auto h-12 px-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-center gap-2 shadow-sm hover:border-primary-200 hover:text-primary-700 transition-all active:scale-95 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <ArrowLeft size={18} strokeWidth={2.5} />
            Back
          </Link>

          {order_details.metadata?.source === 'lims' ? (
            <div className="flex gap-2 w-full sm:w-auto">
              {['completed', 'finished', 'final', 'approved'].includes(order_details.status?.toLowerCase()) ? (
                <>
                  <button 
                    onClick={() => handleDownloadPdf('regular')} 
                    disabled={downloading} 
                    className="flex-1 bg-white text-slate-700 border border-slate-200 px-4 py-3 rounded-2xl flex justify-center items-center gap-2 text-xs font-semibold shadow-sm active:scale-95 hover:bg-slate-50 transition-all disabled:opacity-50"
                  >
                    {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    Regular PDF
                  </button>
                  <button 
                    onClick={() => handleDownloadPdf('smart')} 
                    disabled={downloading} 
                    className="flex-1 bg-primary-700 text-white px-4 py-3 rounded-2xl flex justify-center items-center gap-2 text-xs font-semibold shadow-lg shadow-primary-100 active:scale-95 hover:bg-primary-800 transition-all disabled:opacity-50"
                  >
                    {downloading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                    Smart PDF
                  </button>
                </>
              ) : (
                <div className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-center">
                  <p className="text-[11px] font-medium text-slate-500 italic">Report finalizing by lab...</p>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={handleDownloadOriginal} 
              disabled={downloading} 
              className="w-full sm:w-auto bg-primary-700 text-white px-6 py-3 rounded-2xl flex justify-center items-center gap-3 text-sm font-semibold shadow-lg shadow-primary-100 active:scale-95 hover:bg-primary-800 transition-all disabled:opacity-50"
            >
              {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} strokeWidth={2} />}
              Download Report
            </button>
          )}
        </div>

        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-success-700" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Report ID: {order_details.display_id}</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${order_details.status?.toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
              {order_details.status || 'ACTIVE'}
            </span>
          </div>
          <h1 className="text-xl font-lexend font-bold text-slate-900 leading-tight">
            {order_details.test_names.join(', ') || 'Clinical Observation'}
          </h1>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Collection Date</p>
              <p className="text-[13px] font-semibold text-slate-900">{new Date(order_details.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Laboratory</p>
              <p className="text-[13px] font-semibold text-slate-900 truncate">{order_details.lab_name}</p>
            </div>
          </div>
        </div>
      </header>

      {/* 📊 Unified Analyte Data Stream */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Test Results</h3>
          <span className="text-[10px] font-black text-primary-700 uppercase tracking-widest">{analytes.length} Results</span>
        </div>

        <div className="space-y-3">
          {analytes.map((analyte, idx) => (
            <div 
              key={idx} 
              className="bg-white p-4 rounded-[1.25rem] border border-slate-100 shadow-soft hover:shadow-medium hover:border-primary-100 transition-all flex items-center justify-between gap-4 group"
            >
              {/* Left Side: Name & Context */}
              <div className="flex-1 min-w-0">
                <h4 className="text-[14px] font-bold text-slate-900 group-hover:text-primary-700 transition-colors truncate">
                  {analyte.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    {analyte.method || 'Standard'}
                  </span>
                  {analyte.reference_range && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-slate-200" />
                      <span className="text-[10px] text-slate-400 font-medium truncate">
                        Ref: {formatReferenceRange(analyte.reference_range)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Right Side: Result & Status */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-xl font-bold text-slate-900 tracking-tight tabular-nums">
                    {formatTwoDecimals(analyte.result)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 ml-1.5 uppercase tracking-wide">
                    {analyte.unit}
                  </span>
                </div>
                <div className="flex items-center justify-center p-1.5 rounded-xl bg-slate-50 group-hover:bg-white group-hover:shadow-inner transition-all">
                  {getStatusIcon(analyte.status_color)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200/50 text-center space-y-2">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mx-auto mb-2 shadow-lg shadow-emerald-200" />
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Secure PHR Report</p>
        <p className="text-[10px] text-slate-400 font-medium leading-relaxed px-4 opacity-80">This clinical record is cryptographically verified and visible only to your session.</p>
      </footer>
    </div>
  );
}
