import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, User, Activity, IndianRupee } from 'lucide-react';
import { useProfiles, useRecords } from '../hooks/useApi';
import { useActiveProfile } from '../context/ProfileContext';
import { Spinner } from '../components/Loading';
import { useEffect, useMemo, useState } from 'react';
import { authApi, limsApi } from '../api/client';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

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

function ChevronRight({ size, className }: { size: number; className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function Dashboard() {
  const { isLoading: profilesLoading } = useProfiles();
  const { profiles, activeProfile, activeProfileId } = useActiveProfile();
  const [userName, setUserName] = useState<string>('User');
  const [limsReportsCount, setLimsReportsCount] = useState<number>(0);
  const [limsBillsCount, setLimsBillsCount] = useState<number>(0);
  const realtimePollMs = Number(import.meta.env.VITE_REALTIME_POLL_MS || '20000');
  const validActiveProfileId =
    activeProfileId && profiles.some((profile) => profile.id === activeProfileId)
      ? activeProfileId
      : '';

  const recordsQuery = useRecords(
    validActiveProfileId,
    { page: 1, page_size: 5 },
    { refetchIntervalMs: realtimePollMs }
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authApi.me();
        const profile = response.data;
        if (profile.full_name) {
          setUserName(profile.full_name);
          return;
        }
      } catch {
        // fallback to token decode below
      }

      const token = localStorage.getItem('access_token');
      if (!token) return;

      const decoded = decodeJWT(token);
      if (decoded?.name) {
        setUserName(decoded.name);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchLimsCounts = async () => {
      try {
        const [reportsRes, billsRes] = await Promise.all([
          limsApi.getLinkedReports(validActiveProfileId || undefined),
          limsApi.getLinkedBills(validActiveProfileId || undefined),
        ]);
        setLimsReportsCount(Array.isArray(reportsRes.data) ? reportsRes.data.length : 0);
        setLimsBillsCount(Array.isArray(billsRes.data) ? billsRes.data.length : 0);
      } catch {
        setLimsReportsCount(0);
        setLimsBillsCount(0);
      }
    };

    fetchLimsCounts();
  }, [validActiveProfileId]);

  const recordsTotal = recordsQuery.data?.total ?? 0;
  const latestRecords = recordsQuery.data?.items ?? [];

  const todayLabel = useMemo(
    () => new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' }),
    []
  );

  const firstName = userName.split(' ')[0];

  if (profilesLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const menuItems = [
    {
      title: 'Records',
      icon: FileText,
      route: '/records',
      description: 'View medical reports',
      iconColor: 'text-primary-700',
    },
    {
      title: 'Billing',
      icon: IndianRupee,
      route: '/billing',
      description: 'Lab invoices & payments',
      iconColor: 'text-success-700',
    },
    {
      title: 'Profile',
      icon: User,
      route: '/profile',
      description: 'Manage your account',
      iconColor: 'text-slate-600',
    },
    {
      title: 'Upload',
      icon: Activity,
      route: '/upload',
      description: 'Add a new record',
      iconColor: 'text-success-700',
    },
    {
      title: 'Smart Track',
      icon: Activity,
      route: '/smart-track',
      description: 'Track health trends',
      iconColor: 'text-primary-700',
    },
  ];

  const headerStats = [
    { label: 'Records', value: String(recordsTotal) },
    { label: 'Reports', value: String(limsReportsCount) },
    { label: 'Bills', value: String(limsBillsCount) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-3 pb-20 space-y-3 sm:space-y-5"
    >
      {/* Unified Header */}
      <PageHeader
        icon={<User size={22} strokeWidth={2} />}
        title={`Namaste, ${firstName}`}
        subtitle={todayLabel}
        stats={headerStats}
      >
        {activeProfile && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
            <div className="w-2 h-2 bg-success-300 rounded-full animate-pulse" />
            <p className="text-[11px] font-semibold">{activeProfile.full_name}</p>
          </div>
        )}
      </PageHeader>

      {/* Quick Actions */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Quick Actions</h3>
          <span className="text-[10px] font-medium text-slate-500">Tap to open</span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.route}
              className="group relative min-h-[7.5rem] sm:min-h-[9rem] bg-white rounded-2xl sm:rounded-[1.5rem] shadow-soft border border-slate-200 overflow-hidden hover-lift hover:border-primary-200 active:scale-[0.97]"
            >
              <div className="h-full p-3 sm:p-5 flex flex-col justify-between relative gap-2">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 bg-slate-100 group-hover:bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-medium group-hover:-translate-y-1 transition-all duration-300`}
                >
                  <item.icon className={`w-5 h-5 ${item.iconColor}`} strokeWidth={2} />
                </div>

                <div className="space-y-0.5">
                  <h4 className="font-black text-slate-900 text-sm tracking-tight">{item.title}</h4>
                  <p className="text-slate-500 text-[10px] sm:text-[11px] font-medium leading-tight break-words">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Recent Activity</h3>
          <Link to="/records" className="text-[10px] sm:text-xs font-semibold text-primary-700 hover:text-primary-800">
            See all
          </Link>
        </div>

        <div className="space-y-2">
          {latestRecords.length === 0 ? (
            <EmptyState
              icon={<FileText size={20} />}
              title="No recent records"
              subtitle="Upload a document or connect your lab to get started."
            />
          ) : (
            latestRecords.slice(0, 2).map((record: any) => (
              <Link
                key={record.order_id}
                to={`/records/view/${record.order_id}`}
                className="flex items-center gap-3 p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm hover:border-primary-200 transition-all group"
              >
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-700 group-hover:bg-primary-700 group-hover:text-white transition-colors">
                  <FileText size={17} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-slate-900 text-sm truncate">
                    {(record.test_names || []).join(', ') || 'Medical Report'}
                  </p>
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5 truncate">{record.lab_name}</p>
                </div>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-primary-600 transition-colors" />
              </Link>
            ))
          )}
        </div>
      </section>
    </motion.div>
  );
}
