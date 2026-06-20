import { 
  Bell, 
  BellOff,
  Loader2,
  Receipt,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { limsApi } from '../api/client';
import { useActiveProfile } from '../context/ProfileContext';
import { useRecords } from '../hooks/useApi';
import { markNotificationsSeenNow } from '../utils/notifications';
import { DEFAULT_SETTINGS, SETTINGS_CHANGED_EVENT, SETTINGS_STORAGE_KEY, loadAppSettings } from '../utils/settings';
import BackButton from '../components/BackButton';
import EmptyState from '../components/EmptyState';


type LiveNotification = {
  id: string;
  title: string;
  desc: string;
  createdAt: Date;
  channel: 'push' | 'sms';
  icon: any;
  color: string;
  bg: string;
};

export default function Notifications() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [markingRead, setMarkingRead] = useState(false);
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

  useEffect(() => {
    markNotificationsSeenNow();

    const syncSettings = () => setSettings(loadAppSettings());
    syncSettings();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === SETTINGS_STORAGE_KEY) {
        syncSettings();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(SETTINGS_CHANGED_EVENT, syncSettings);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(SETTINGS_CHANGED_EVENT, syncSettings);
    };
  }, []);

  const liveNotifications = useMemo<LiveNotification[]>(() => {
    const recordNotifications = (recordsQuery.data?.items || []).slice(0, 12).map((record: any) => {
      const testTitle = (record.test_names || []).join(', ') || 'Medical report';
      return {
        id: `record-${record.order_id}`,
        title: 'New report synced',
        desc: `${testTitle} from ${record.lab_name || 'Lab'} is now available.`,
        createdAt: new Date(record.date),
        channel: 'push' as const,
        icon: FileText,
        color: 'text-primary-700',
        bg: 'bg-primary-50',
      };
    });

    const billNotifications = (billsQuery.data || []).slice(0, 8).map((bill: any) => ({
      id: `bill-${bill.billId || bill.invoiceNumber}`,
      title: 'Billing update',
      desc: `Invoice ${bill.invoiceNumber || 'NA'} is ${String(bill.status || 'available').toLowerCase().split('_').join(' ')}.`,
      createdAt: new Date(bill.invoiceDate || Date.now()),
      channel: 'sms' as const,
      icon: Receipt,
      color: 'text-warning-700',
      bg: 'bg-warning-50',
    }));

    return [...recordNotifications, ...billNotifications]
      .filter((item) => Number.isFinite(item.createdAt.getTime()))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [billsQuery.data, recordsQuery.data?.items]);

  const visibleNotifications = useMemo(() => {
    return liveNotifications.filter((n) => {
      if (n.channel === 'push' && !settings.pushNotifications) return false;
      if (n.channel === 'sms' && !settings.smsAlerts) return false;
      return true;
    });
  }, [liveNotifications, settings.pushNotifications, settings.smsAlerts]);

  const formatRelativeTime = (value: Date) => {
    const deltaMs = Date.now() - value.getTime();
    if (deltaMs < 60_000) return 'Just now';
    const mins = Math.floor(deltaMs / 60_000);
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const isLoading = recordsQuery.isLoading || billsQuery.isLoading;
  const hasNotifications = visibleNotifications.length > 0;

  const handleMarkAllRead = () => {
    setMarkingRead(true);
    markNotificationsSeenNow();
    window.setTimeout(() => setMarkingRead(false), 500);
  };

  return (
    <div className="py-5 pb-28 space-y-5 sm:space-y-6 font-inter">
      {/* Header */}
      <header className="flex items-center gap-3">
        <BackButton />
        <div>
          <h1 className="text-xl sm:text-2xl font-lexend font-extrabold text-slate-900 leading-none">Notifications</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">Live activity stream</p>
        </div>
      </header>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleMarkAllRead}
          disabled={!hasNotifications || isLoading || markingRead}
          className="text-xs sm:text-sm font-semibold text-primary-700 disabled:text-slate-400 disabled:cursor-not-allowed hover:text-primary-800 transition-colors"
        >
          {markingRead ? 'Marked as read' : 'Mark all as read'}
        </button>
      </div>

      {/* Notification List */}
      {isLoading ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-primary-700 animate-spin" />
          <p className="text-sm font-medium text-slate-600">Loading live activity...</p>
        </div>
      ) : !hasNotifications ? (
        <EmptyState
          icon={<BellOff size={24} />}
          title={
            !settings.pushNotifications && !settings.smsAlerts
              ? "All notifications are turned off"
              : "No notifications"
          }
          subtitle={
            !settings.pushNotifications && !settings.smsAlerts
              ? "Enable notifications in Settings to receive updates."
              : "You're all caught up! There are no active notifications to show."
          }
        />
      ) : (
        <div className="space-y-4">
          {visibleNotifications.map((notif, idx) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex gap-3 sm:gap-4 hover:border-primary-100 transition-all group"
            >
              <div className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center ${notif.bg} ${notif.color}`}>
                <notif.icon size={22} strokeWidth={2.5} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-lexend font-extrabold text-slate-900 group-hover:text-primary-700 transition-colors">
                    {notif.title}
                  </h4>
                  <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">{formatRelativeTime(notif.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {notif.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Footer Info */}
      {hasNotifications && (
        <div className="p-8 border border-dashed border-slate-200 rounded-[2rem] text-center space-y-2">
          <Bell size={24} className="mx-auto text-slate-200" />
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Live notifications update automatically
          </p>
        </div>
      )}
    </div>

  );
}
