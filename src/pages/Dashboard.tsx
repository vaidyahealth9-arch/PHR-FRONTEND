import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, User, Activity, IndianRupee } from 'lucide-react';
import { useProfiles, useRecords } from '../hooks/useApi';
import { useActiveProfile } from '../context/ProfileContext';
import { Spinner } from '../components/Loading';
import { useEffect, useMemo, useState } from 'react';
import { authApi, limsApi } from '../api/client';

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
  const { profiles, activeProfile, activeProfileId } = useActiveProfile();
  const [userName, setUserName] = useState<string>('User');
  const [limsReportsCount, setLimsReportsCount] = useState<number>(0);
  const [limsBillsCount, setLimsBillsCount] = useState<number>(0);
  const realtimePollMs = Number(import.meta.env.VITE_REALTIME_POLL_MS || '20000');
  const validActiveProfileId = activeProfileId && profiles.some((profile) => profile.id === activeProfileId)
    ? activeProfileId
    : '';

  const recordsQuery = useRecords(
    validActiveProfileId,
    {
      page: 1,
      page_size: 5,
    },
    {
      refetchIntervalMs: realtimePollMs,
    }
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
      if (!token) {
        return;
      }

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

  const quickStats = useMemo(
    () => [
      { label: 'Records', value: String(recordsTotal), icon: Activity },
      { label: 'Reports', value: String(limsReportsCount), icon: FileText },
      { label: 'Bills', value: String(limsBillsCount), icon: IndianRupee },
    ],
    [recordsTotal, limsReportsCount, limsBillsCount]
  );

  const todayLabel = useMemo(
    () => new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' }),
    []
  );

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
      description: 'Medical reports',
      bgColor: 'from-primary-500 to-primary-700',
      iconColor: 'text-primary-700',
    },
    {
      title: 'Bills',
      icon: IndianRupee,
      route: '/billing',
      description: 'Lab invoices',
      bgColor: 'from-primary-400 to-success-600',
      iconColor: 'text-success-700',
    },
    {
      title: 'Profile',
      icon: User,
      route: '/profile',
      description: 'Account settings',
      bgColor: 'from-slate-700 to-primary-900',
      iconColor: 'text-slate-600',
    },
    {
      title: 'Upload',
      icon: Activity,
      route: '/upload',
      description: 'New record',
      bgColor: 'from-primary-500 to-success-600',
      iconColor: 'text-success-700',
    },
    {
      title: 'Smart Track',
      icon: Activity,
      route: '/smart-track',
      description: 'Health trends',
      bgColor: 'from-success-500 to-primary-700',
      iconColor: 'text-primary-700',
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-4 pb-24 space-y-4 sm:space-y-5"
    >
      {/* Universal Header Card */}
      <div className="bg-gradient-to-br from-primary-800 via-primary-700 to-success-700 rounded-[1.5rem] sm:rounded-[1.75rem] shadow-premium p-4 sm:p-5 text-white relative overflow-hidden border border-white/10">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-success-300/20 rounded-full blur-2xl -ml-16 -mb-16"></div>
        
        <div className="relative space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-soft flex-shrink-0">
              <User className="text-white" size={28} />
            </div>
            <div className="min-w-0">
              <h2 className="text-[1.35rem] sm:text-[1.65rem] font-black tracking-tight truncate">
                Namaste, {userName.split(' ')[0]}
              </h2>
              <p className="text-primary-100 text-xs font-semibold mt-0.5">
                {todayLabel}
              </p>
            </div>
          </div>

          {activeProfile && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
              <div className="w-2 h-2 bg-success-300 rounded-full animate-pulse" />
              <p className="text-[11px] font-semibold">
                {activeProfile.full_name}
              </p>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {quickStats.map((stat, index) => (
              <div key={index} className="bg-white/12 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-center group hover:bg-white/20 transition-all">
                <stat.icon className="w-4 h-4 mx-auto mb-1.5 text-primary-100" strokeWidth={2.8} />
                <p className="text-xl sm:text-2xl font-black tracking-tight leading-none">{stat.value}</p>
                <p className="text-[11px] font-medium text-primary-100 mt-1 opacity-90">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Hub */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Quick Actions
          </h3>
          <span className="text-xs font-medium text-slate-500">Tap to open</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.route}
              className="group relative min-h-[9.25rem] sm:min-h-[10rem] bg-white rounded-[1.25rem] sm:rounded-[1.5rem] shadow-soft border border-slate-200 overflow-hidden hover-lift hover:border-primary-200 active:scale-[0.98]"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.bgColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="h-full p-4 sm:p-6 flex flex-col justify-between relative gap-3">
                <div className={`w-11 h-11 bg-slate-100 group-hover:bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-medium group-hover:-translate-y-1 transition-all duration-300`}>
                  <item.icon className={`w-6 h-6 ${item.iconColor}`} strokeWidth={2} />
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-black text-slate-900 text-sm sm:text-base tracking-tight">{item.title}</h4>
                  <p className="text-slate-500 text-[11px] sm:text-xs font-medium leading-tight break-words">{item.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Activity Mini-List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Activity</h3>
          <Link to="/records" className="text-xs font-semibold text-primary-700 hover:text-primary-800">See all</Link>
        </div>
        
        <div className="space-y-3">
          {latestRecords.length === 0 ? (
            <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl p-6 text-center">
              <p className="text-xs font-bold text-slate-400">No recent records found</p>
            </div>
          ) : (
            latestRecords.slice(0, 2).map((record: any) => (
              <Link
                key={record.order_id}
                to={`/records/view/${record.order_id}`}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-primary-200 transition-all group"
              >
                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-700 group-hover:bg-primary-700 group-hover:text-white transition-colors">
                  <FileText size={20} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-slate-900 text-sm truncate">{(record.test_names || []).join(', ') || 'Medical Report'}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">{record.lab_name}</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-primary-600 transition-colors" />
              </Link>
            ))
          )}
        </div>
      </section>
    </motion.div>
  );
}

// Add simple icons for the list
function ChevronRight({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} height={size} 
      viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="3" 
      strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
