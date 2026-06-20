import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileText, RefreshCw, Upload, Building2, Loader2,
  ChevronRight, Download, ShieldCheck, Clock, Search, X
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { authApi, limsApi } from '../api/client';
import { useProfiles, useRecords } from '../hooks/useApi';
import { useActiveProfile } from '../context/ProfileContext';
import PageHeader from '../components/PageHeader';
import ProfileSwitcher from '../components/ProfileSwitcher';
import EmptyState from '../components/EmptyState';

const LIMS_RECORD_ID_OFFSET = 2_000_000_000;

const SOURCE_BADGE: Record<string, { label: string; className: string }> = {
  lims: { label: 'LIMS', className: 'bg-primary-50 text-primary-700 border border-primary-200' },
  upload: { label: 'Upload', className: 'bg-slate-50 text-slate-600 border border-slate-200' },
  manual: { label: 'Manual', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
};

export default function Records() {
  const { profiles, activeProfileId } = useActiveProfile();
  const { isLoading: profilesLoading } = useProfiles();

  const [userName, setUserName] = useState<string>('User');
  const [limsBillCount, setLimsBillCount] = useState<number>(0);
  const [openingReportId, setOpeningReportId] = useState<number | null>(null);
  const [openingType, setOpeningType] = useState<'regular' | 'smart' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const realtimePollMs = Number(import.meta.env.VITE_REALTIME_POLL_MS || '20000');
  const validActiveProfileId =
    activeProfileId && profiles.some((p) => p.id === activeProfileId) ? activeProfileId : '';

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
      } catch {
        setUserName('User');
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const billsRes = await limsApi.getLinkedBills(validActiveProfileId || undefined);
        setLimsBillCount(Array.isArray(billsRes.data) ? billsRes.data.length : 0);
      } catch {
        setLimsBillCount(0);
      }
    };
    fetchBills();
  }, [validActiveProfileId]);

  const allRecords: any[] = recordsQuery.data?.items || [];
  const recordsTotal = recordsQuery.data?.total ?? 0;

  // Client-side search filter
  const records = useMemo(() => {
    if (!searchQuery.trim()) return allRecords;
    const q = searchQuery.toLowerCase();
    return allRecords.filter((r: any) => {
      const names = (r.test_names || []).join(' ').toLowerCase();
      const lab = (r.lab_name || '').toLowerCase();
      const id = (r.display_id || '').toLowerCase();
      return names.includes(q) || lab.includes(q) || id.includes(q);
    });
  }, [allRecords, searchQuery]);

  const limsRecords = records.filter((r: any) => r.metadata?.source === 'lims');
  const otherRecords = records.filter((r: any) => r.metadata?.source !== 'lims');

  const thisMonthCount = useMemo(() => {
    const now = new Date();
    return allRecords.filter((r: any) => {
      const d = new Date(r.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
  }, [allRecords]);

  const openSignedReport = async (encodedOrderId: number, type: 'regular' | 'smart') => {
    const realLimsId = encodedOrderId - LIMS_RECORD_ID_OFFSET;
    try {
      setOpeningReportId(encodedOrderId);
      setOpeningType(type);
      const response = await limsApi.downloadLinkedReportPdf(
        realLimsId, type, true, validActiveProfileId || undefined
      );
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

  const headerStats = [
    { label: 'Total', value: String(recordsTotal) },
    { label: 'LIMS', value: String(allRecords.filter((r: any) => r.metadata?.source === 'lims').length) },
    { label: 'This Month', value: String(thisMonthCount) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-3 pb-20 space-y-3"
    >
      {/* Unified Header */}
      <PageHeader
        icon={<FileText size={22} strokeWidth={2} />}
        title={`${userName.split(' ')[0]}'s Records`}
        subtitle="All medical files in one place"
        stats={headerStats}
      />

      {/* Profile + Actions */}
      <div className="glass-panel rounded-2xl p-3 space-y-2.5">
        <ProfileSwitcher label="Viewing records for" />
        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/upload"
            className="flex items-center justify-center gap-1.5 btn btn-primary btn-md rounded-xl shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload
          </Link>
          <button
            onClick={() => recordsQuery.refetch()}
            className="flex items-center justify-center gap-1.5 btn btn-secondary btn-md rounded-xl shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${recordsQuery.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* LIMS Bill Banner */}
      {limsBillCount > 0 && (
        <div className="rounded-xl border border-primary-200 bg-primary-50/60 p-2.5 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-primary-100 shrink-0">
            <Building2 className="w-3.5 h-3.5 text-primary-700" />
          </div>
          <p className="text-[11px] font-medium text-slate-700 leading-tight">
            <span className="font-bold text-primary-700">{limsBillCount} bill{limsBillCount > 1 ? 's' : ''}</span> linked from your connected lab.
          </p>
        </div>
      )}

      {/* Search Bar */}
      {allRecords.length > 0 && (
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by test name, lab or ID..."
            className="w-full pl-9 pr-9 input rounded-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Records List */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <p className="section-label mb-0">{searchQuery ? 'Search Results' : 'Health Records'}</p>
          <span className="text-[10px] font-semibold text-slate-400">
            {searchQuery ? `${records.length} of ${allRecords.length}` : `${allRecords.length} total`}
          </span>
        </div>

        {recordsQuery.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-700 animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            icon={<FileText size={24} />}
            title={searchQuery ? 'No matching records' : 'No health records found'}
            subtitle={searchQuery ? 'Try a different search term.' : 'Upload a document or connect your lab.'}
            action={
              searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-semibold text-primary-700 hover:text-primary-800"
                >
                  Clear search
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-3">
            {/* LIMS Records */}
            {limsRecords.map((item: any) => {
              const isOpening = openingReportId === item.order_id;
              const badge = SOURCE_BADGE['lims'];
              return (
                <div
                  key={item.order_id}
                  className="card overflow-hidden hover:border-primary-200 hover:shadow-[0_4px_16px_rgba(15,103,134,0.12)] transition-all group"
                >
                  <div className="flex items-center justify-between p-3 gap-2 border-b border-slate-50">
                    <Link
                      to={`/records/view/${item.order_id}`}
                      className="flex items-center gap-2.5 flex-1 min-w-0 active:scale-[0.98] transition-transform"
                    >
                      <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center text-primary-700 shrink-0 group-hover:bg-primary-100 transition-colors">
                        <FileText size={16} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="font-semibold text-slate-900 text-sm truncate leading-tight">
                            {(item.test_names || []).join(', ') || 'Clinical Observation'}
                          </p>
                          <span className={`shrink-0 px-1 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                          <Clock size={9} />
                          {new Date(item.date).toLocaleDateString('en-IN')}
                          <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                          <span className={`font-semibold ${item.status?.toLowerCase() === 'active' ? 'text-emerald-600' : 'text-slate-500'}`}>
                            {(item.status || 'ACTIVE').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={13} className="text-slate-300 group-hover:text-primary-500 transition-colors shrink-0" />
                    </Link>
                  </div>
                  {/* PDF Buttons */}
                  {['completed', 'finished', 'final', 'approved'].includes(item.status?.toLowerCase()) ? (
                    <div className="flex gap-1.5 px-3 pb-2.5 pt-1">
                      <button
                        onClick={() => openSignedReport(item.order_id, 'regular')}
                        disabled={isOpening}
                        className="flex-1 flex items-center justify-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg py-1.5 text-[10px] font-semibold transition-all disabled:opacity-60 active:scale-95"
                      >
                        {isOpening && openingType === 'regular' ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <Download size={11} />
                        )}
                        Regular PDF
                      </button>
                      <button
                        onClick={() => openSignedReport(item.order_id, 'smart')}
                        disabled={isOpening}
                        className="flex-1 flex items-center justify-center gap-1 bg-primary-700 hover:bg-primary-800 text-white rounded-lg py-1.5 text-[10px] font-semibold transition-all disabled:opacity-60 active:scale-95"
                      >
                        {isOpening && openingType === 'smart' ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <ShieldCheck size={11} />
                        )}
                        Smart PDF
                      </button>
                    </div>
                  ) : (
                    <div className="px-3 pb-2.5 pt-1">
                      <div className="bg-slate-50 rounded-lg py-1.5 px-2.5 border border-slate-100">
                        <p className="text-[9px] font-medium text-slate-400 italic">
                          Report available once finalized by the lab.
                        </p>
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
                  className="card-interactive flex items-center gap-2.5 p-3"
                >
                  <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
                    <FileText size={16} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="font-semibold text-slate-900 text-sm truncate leading-tight">
                        {(item.test_names || []).join(', ') || item.display_id || 'Health Document'}
                      </p>
                      <span className={`shrink-0 px-1 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                      <Clock size={9} />
                      {new Date(item.date).toLocaleDateString('en-IN')}
                      <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                      <span>{(item.status || 'ACTIVE').toUpperCase()}</span>
                    </div>
                  </div>
                  <ChevronRight size={13} className="text-slate-300 group-hover:text-primary-500 transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Sync Footer */}
      <div className="pt-2 flex items-center justify-center gap-2">
        <div className="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse" />
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
          Syncing every {Math.round(realtimePollMs / 1000)}s
        </span>
      </div>
    </motion.div>
  );
}
