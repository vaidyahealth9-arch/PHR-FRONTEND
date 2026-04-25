import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileText, RefreshCw, Upload, Building2, Loader2,
  ChevronRight, Download, ShieldCheck, Clock
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { authApi, limsApi } from '../api/client';
import { useProfiles, useRecords } from '../hooks/useApi';
import { useActiveProfile } from '../context/ProfileContext';

const LIMS_RECORD_ID_OFFSET = 2_000_000_000;

const SOURCE_BADGE: Record<string, { label: string; className: string }> = {
  lims: { label: 'LIMS', className: 'bg-primary-50 text-primary-700 border border-primary-200' },
  upload: { label: 'Upload', className: 'bg-slate-50 text-slate-600 border border-slate-200' },
  manual: { label: 'Manual', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
};

export default function Records() {
  const { profiles, activeProfileId, setActiveProfileId } = useActiveProfile();
  const { isLoading: profilesLoading } = useProfiles();

  const [userName, setUserName] = useState<string>('User');
  const [limsBillCount, setLimsBillCount] = useState<number>(0);
  const [openingReportId, setOpeningReportId] = useState<number | null>(null);
  const [openingType, setOpeningType] = useState<'regular' | 'smart' | null>(null);

  const realtimePollMs = Number(import.meta.env.VITE_REALTIME_POLL_MS || '20000');
  const validActiveProfileId = activeProfileId && profiles.some((p) => p.id === activeProfileId)
    ? activeProfileId
    : '';

  const recordsQuery = useRecords(
    validActiveProfileId,
    { page: 1, page_size: 50, sort_by: 'date', sort_order: 'desc' },
    { refetchIntervalMs: realtimePollMs }
  );

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await authApi.me();
        const profile = response.data;
        if (profile.full_name) setUserName(profile.full_name);
        else if (profile.first_name)
          setUserName(`${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ''}`);
      } catch { setUserName('User'); }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const billsRes = await limsApi.getLinkedBills(validActiveProfileId || undefined);
        setLimsBillCount(Array.isArray(billsRes.data) ? billsRes.data.length : 0);
      } catch { setLimsBillCount(0); }
    };
    fetchBills();
  }, [validActiveProfileId]);

  const records: any[] = recordsQuery.data?.items || [];
  const recordsTotal = recordsQuery.data?.total ?? 0;
  const limsRecords = records.filter((r: any) => r.metadata?.source === 'lims');
  const otherRecords = records.filter((r: any) => r.metadata?.source !== 'lims');

  const thisMonthCount = useMemo(() => {
    const now = new Date();
    return records.filter((r: any) => {
      const d = new Date(r.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
  }, [records]);

  const openSignedReport = async (encodedOrderId: number, type: 'regular' | 'smart') => {
    const realLimsId = encodedOrderId - LIMS_RECORD_ID_OFFSET;
    try {
      setOpeningReportId(encodedOrderId);
      setOpeningType(type);
      const response = await limsApi.downloadLinkedReportPdf(realLimsId, type, true, validActiveProfileId || undefined);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${realLimsId}-${type}.pdf`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert('PDF not available yet. Please try again shortly.');
    } finally {
      setOpeningReportId(null);
      setOpeningType(null);
    }
  };

  if (profilesLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-primary-700 animate-spin" />
      </div>
    );
  }

  const quickStats = [
    { label: 'Total', value: String(recordsTotal) },
    { label: 'LIMS', value: String(limsRecords.length) },
    { label: 'This Month', value: String(thisMonthCount) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-4 pb-24 space-y-4 sm:space-y-5"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-800 via-primary-700 to-success-700 rounded-[1.5rem] sm:rounded-[1.75rem] shadow-premium p-4 sm:p-5 text-white relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="relative space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-white/30 flex-shrink-0">
              <FileText className="text-white w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[1.3rem] sm:text-[1.55rem] font-bold tracking-tight truncate leading-tight">
                {userName.split(' ')[0]}'s Health Records
              </h1>
              <p className="text-primary-100 text-xs font-medium mt-0.5">All medical files in one place</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {quickStats.map((stat, i) => (
              <div key={i} className="bg-white/12 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-center">
                <p className="text-xl font-bold tracking-tight leading-none">{stat.value}</p>
                <p className="text-[11px] font-medium text-primary-100 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profile + Actions */}
      <div className="glass-panel rounded-2xl p-4 space-y-3">
        <label className="text-xs font-semibold text-slate-600 block">Active Profile</label>
        <select
          value={activeProfileId || ''}
          onChange={(e) => setActiveProfileId(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-semibold text-slate-900 transition-all"
        >
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.full_name} {!profile.is_primary ? `(${profile.relationship})` : '(Primary)'}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/upload" className="flex items-center justify-center gap-2 btn btn-primary btn-md rounded-xl shadow-sm active:scale-95 transition-all">
            <Upload className="w-4 h-4" />
            Upload Record
          </Link>
          <button
            onClick={() => recordsQuery.refetch()}
            className="flex items-center justify-center gap-2 btn btn-secondary btn-md rounded-xl shadow-sm active:scale-95 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${recordsQuery.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* LIMS Info Banner */}
      {limsBillCount > 0 && (
        <div className="rounded-2xl border border-primary-200 bg-primary-50/60 p-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm border border-primary-100 shrink-0">
            <Building2 className="w-4 h-4 text-primary-700" />
          </div>
          <p className="text-xs font-medium text-slate-700">
            <span className="font-bold text-primary-700">{limsBillCount} bills</span> linked from your connected lab.
          </p>
        </div>
      )}

      {/* Records List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Health Records</h3>
          <span className="text-xs font-semibold text-slate-400">{records.length} total</span>
        </div>

        {records.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/30 p-12 text-center">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-sm font-semibold text-slate-400">No health records found</p>
            <p className="text-xs text-slate-400 mt-1">Upload a document or connect your lab.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* LIMS Records with PDF actions */}
            {limsRecords.map((item: any) => {
              const isOpening = openingReportId === item.order_id;
              const badge = SOURCE_BADGE['lims'];
              return (
                <div
                  key={item.order_id}
                  className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden hover:border-primary-200 hover:shadow-medium transition-all group"
                >
                  <Link
                    to={`/records/view/${item.order_id}`}
                    className="flex items-center gap-3 p-4 active:scale-[0.98] transition-transform"
                  >
                    <div className="w-11 h-11 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-700 shrink-0 group-hover:bg-primary-100 transition-colors">
                      <FileText size={19} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-slate-900 text-sm truncate">
                          {(item.test_names || []).join(', ') || item.display_id || 'Lab Report'}
                        </p>
                        <span className={`shrink-0 px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                        <Clock size={10} />
                        {new Date(item.date).toLocaleDateString('en-IN')}
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className={`font-semibold ${item.status?.toLowerCase() === 'active' ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {(item.status || 'ACTIVE').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={15} className="text-slate-300 group-hover:text-primary-500 transition-colors shrink-0" />
                  </Link>
                  {/* PDF Download Buttons - Only show if report is completed/final */}
                  {['completed', 'finished', 'final', 'approved'].includes(item.status?.toLowerCase()) ? (
                    <div className="flex gap-2 px-4 pb-3">
                      <button
                        onClick={() => openSignedReport(item.order_id, 'regular')}
                        disabled={isOpening}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl py-2 text-[11px] font-semibold transition-all disabled:opacity-60 active:scale-95"
                      >
                        {isOpening && openingType === 'regular' ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Download size={13} />
                        )}
                        Regular PDF
                      </button>
                      <button
                        onClick={() => openSignedReport(item.order_id, 'smart')}
                        disabled={isOpening}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl py-2 text-[11px] font-semibold transition-all disabled:opacity-60 active:scale-95"
                      >
                        {isOpening && openingType === 'smart' ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <ShieldCheck size={13} />
                        )}
                        Smart PDF
                      </button>
                    </div>
                  ) : (
                    <div className="px-4 pb-3">
                      <div className="bg-slate-50 rounded-xl py-2 px-3 border border-slate-100">
                        <p className="text-[10px] font-medium text-slate-400 italic">Report will be available once finalized by the lab.</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Uploaded / Legacy Records */}
            {otherRecords.map((item: any) => {
              const src = (item.metadata?.source as string) || 'upload';
              const badge = SOURCE_BADGE[src] || SOURCE_BADGE['upload'];
              return (
                <Link
                  key={item.order_id}
                  to={`/records/view/${item.order_id}`}
                  className="bg-white rounded-2xl shadow-soft border border-slate-100 p-4 flex items-center gap-3 hover:border-primary-200 hover:shadow-medium active:scale-[0.98] transition-all group"
                >
                  <div className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
                    <FileText size={19} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-slate-900 text-sm truncate">
                        {(item.test_names || []).join(', ') || item.display_id || 'Health Document'}
                      </p>
                      <span className={`shrink-0 px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                      <Clock size={10} />
                      {new Date(item.date).toLocaleDateString('en-IN')}
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>{(item.status || 'ACTIVE').toUpperCase()}</span>
                    </div>
                  </div>
                  <ChevronRight size={15} className="text-slate-300 group-hover:text-primary-500 transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <div className="pt-2 flex items-center justify-center gap-2">
        <div className="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse" />
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
          Syncing every {Math.round(realtimePollMs / 1000)}s
        </span>
      </div>
    </motion.div>
  );
}
