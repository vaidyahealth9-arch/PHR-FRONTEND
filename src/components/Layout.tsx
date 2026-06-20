import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  LayoutDashboard, 
  FileText, 
  CreditCard, 
  User, 
  Activity,
  Settings,
  Bell,
  BellOff
} from 'lucide-react';
import { limsApi } from '../api/client';
import { useActiveProfile } from '../context/ProfileContext';
import { useRecords } from '../hooks/useApi';
import { getNotificationsLastSeenAt, markNotificationsSeenNow } from '../utils/notifications';
import { DEFAULT_SETTINGS, SETTINGS_CHANGED_EVENT, SETTINGS_STORAGE_KEY, loadAppSettings } from '../utils/settings';

const NavItem = ({ to, icon: Icon, label, isActive }: { to: string, icon: any, label: string, isActive: boolean }) => {
  return (
    <Link 
      to={to} 
      className={`flex flex-col items-center justify-center flex-1 min-w-0 py-1 sm:py-1.5 transition-all relative rounded-xl ${
        isActive ? 'text-primary-800 bg-primary-50 shadow-sm' : 'text-slate-500 hover:text-primary-700'
      }`}
    >
      <Icon size={16} strokeWidth={isActive ? 2.8 : 2.2} className="transition-transform duration-300 sm:w-[18px] sm:h-[18px]" />
      <span className={`text-[9px] sm:text-[10px] font-semibold mt-0.5 transition-opacity duration-300 truncate max-w-full max-[360px]:hidden ${isActive ? 'opacity-100' : 'opacity-80'}`}>
        {label}
      </span>
      {isActive && (
        <motion.div 
          layoutId="nav-glow"
          className="absolute top-1 right-3 w-1 h-1 bg-primary-700 rounded-full shadow-[0_0_6px_rgba(15,103,134,0.7)]"
        />
      )}
    </Link>
  );
};

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [lastSeenAt, setLastSeenAt] = useState(0);
  const { profiles, activeProfileId } = useActiveProfile();
  const realtimePollMs = Number(import.meta.env.VITE_REALTIME_POLL_MS || '20000');

  const validActiveProfileId = activeProfileId && profiles.some((profile) => profile.id === activeProfileId)
    ? activeProfileId
    : '';

  const recordsQuery = useRecords(
    validActiveProfileId,
    {
      page: 1,
      page_size: 20,
      sort_by: 'date',
      sort_order: 'desc',
    },
    {
      refetchIntervalMs: realtimePollMs,
    }
  );

  const billsQuery = useQuery({
    queryKey: ['notifications', 'bills', validActiveProfileId],
    queryFn: async () => {
      const res = await limsApi.getLinkedBills(validActiveProfileId || undefined);
      return Array.isArray(res.data) ? res.data : [];
    },
    refetchInterval: realtimePollMs,
  });

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Home' },
    { to: '/records', icon: FileText, label: 'Records' },
    { to: '/smart-track', icon: Activity, label: 'Track' },
    { to: '/billing', icon: CreditCard, label: 'Billing' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  useEffect(() => {
    const syncSettings = () => setSettings(loadAppSettings());
    syncSettings();
    setLastSeenAt(getNotificationsLastSeenAt());

    const handleStorage = (event: StorageEvent) => {
      if (event.key === SETTINGS_STORAGE_KEY) {
        syncSettings();
      }
      if (event.key === 'phr_notifications_last_seen_at') {
        setLastSeenAt(getNotificationsLastSeenAt());
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(SETTINGS_CHANGED_EVENT, syncSettings);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(SETTINGS_CHANGED_EVENT, syncSettings);
    };
  }, []);

  useEffect(() => {
    if (location.pathname === '/notifications') {
      markNotificationsSeenNow();
      setLastSeenAt(getNotificationsLastSeenAt());
    }
  }, [location.pathname]);

  const unreadCount = (() => {
    const recordItems = (recordsQuery.data?.items || []).filter((record: any) => {
      if (!settings.pushNotifications) return false;
      const timestamp = new Date(record.date).getTime();
      return Number.isFinite(timestamp) && timestamp > lastSeenAt;
    });

    const billItems = (billsQuery.data || []).filter((bill: any) => {
      if (!settings.smsAlerts) return false;
      const timestamp = new Date(bill.invoiceDate || Date.now()).getTime();
      return Number.isFinite(timestamp) && timestamp > lastSeenAt;
    });

    return Math.min(recordItems.length + billItems.length, 99);
  })();

  return (
    <div className="flex flex-col min-h-dvh bg-gradient-to-b from-slate-100 to-slate-50 font-inter">
      {/* 🏥 Unified Top Bar */}
      <nav className="fixed top-0 left-0 right-0 h-14 sm:h-[4.25rem] glass-panel border-b border-slate-100 z-50 screen-container flex items-center justify-between pt-[env(safe-area-inset-top)] gap-2">
        <Link to="/" className="flex items-center gap-1.5 min-w-0 active:scale-95 transition-all">
          <img src="/logo.png" alt="Vaidya" className="w-8 h-8 sm:w-9 sm:h-9 object-contain" />
          <div className="flex flex-col min-w-0">
            <span className="text-sm sm:text-base font-lexend font-black text-slate-900 tracking-tighter truncate">VAIDYA</span>
            <span className="hidden min-[401px]:block text-[9px] sm:text-[10px] font-medium text-slate-500 truncate">Personal Health Record</span>
          </div>
        </Link>
        <div className="flex items-center gap-1 shrink-0">
          <button 
            onClick={() => navigate('/notifications')}
            className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
              location.pathname === '/notifications' ? 'bg-primary-100 text-primary-800 shadow-inner' : 'text-slate-500 hover:text-primary-700 hover:bg-primary-50'
            }`}
            title={settings.pushNotifications ? 'Notifications' : 'Notifications are off'}
          >
            {settings.pushNotifications ? (
              <Bell size={18} strokeWidth={2.5} />
            ) : (
              <BellOff size={18} strokeWidth={2.5} />
            )}
            {unreadCount > 0 && location.pathname !== '/notifications' && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-0.5 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => navigate('/settings')}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
              location.pathname === '/settings' ? 'bg-primary-100 text-primary-800 shadow-inner' : 'text-slate-500 hover:text-primary-700 hover:bg-primary-50'
            }`}
          >
            <Settings size={18} strokeWidth={2.5} />
          </button>
        </div>
      </nav>

      {/* Main Viewport */}
      <main className="flex-1 screen-container pt-[3.6rem] sm:pt-[4.35rem] pb-[4.5rem] sm:pb-[5.5rem] overflow-x-hidden">
        <motion.div
          key={location.pathname}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.08, ease: 'easeOut' }}
          className="w-full h-full"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* 🛳️ Pixel-Symmetric Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-[4rem] sm:h-[4.75rem] glass-panel border-t border-slate-100 z-50 screen-container shadow-[0_-8px_24px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center h-full px-0.5 gap-0.5">
          {navItems.map((item) => (
            <NavItem 
              key={item.to} 
              {...item} 
              isActive={location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))} 
            />
          ))}
        </div>
      </nav>
    </div>
  );
}