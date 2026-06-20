import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronRight,
  HelpCircle,
  LogOut,
  Moon,
  Shield,
  Smartphone,
  User,
  MessageSquare,
} from 'lucide-react';
import { authApi } from '../api/client';
import BackButton from '../components/BackButton';

import {
  DEFAULT_SETTINGS,
  type AppSettings,
  applyThemeFromSettings,
  loadAppSettings,
  saveAppSettings,
} from '../utils/settings';

interface UserProfile {
  full_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
}

const ActionRow = ({
  icon: Icon,
  label,
  description,
  onClick,
}: {
  icon: any;
  label: string;
  description: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="list-row w-full text-left"
  >
    <div className="list-row-icon text-primary-700">
      <Icon size={16} strokeWidth={2.4} />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-semibold text-slate-900 leading-tight">{label}</h4>
      <p className="text-[11px] text-slate-500 mt-0.5 leading-tight truncate">{description}</p>
    </div>
    <ChevronRight size={14} className="text-slate-300 shrink-0" />
  </button>
);

const ExternalActionRow = ({
  icon: Icon,
  label,
  description,
  href,
}: {
  icon: any;
  label: string;
  description: string;
  href: string;
}) => (
  <a
    href={href}
    className="list-row"
  >
    <div className="list-row-icon text-primary-700">
      <Icon size={16} strokeWidth={2.4} />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-semibold text-slate-900 leading-tight">{label}</h4>
      <p className="text-[11px] text-slate-500 mt-0.5 leading-tight truncate">{description}</p>
    </div>
    <ChevronRight size={14} className="text-slate-300 shrink-0" />
  </a>
);

const ToggleRow = ({
  icon: Icon,
  label,
  description,
  value,
  onChange,
  badge,
}: {
  icon: any;
  label: string;
  description: string;
  value: boolean;
  onChange: (nextValue: boolean) => void;
  badge?: string;
}) => (
  <div className="list-row">
    <div className="list-row-icon text-primary-700">
      <Icon size={16} strokeWidth={2.4} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        <h4 className="text-sm font-semibold text-slate-900 leading-tight">{label}</h4>
        {badge && (
          <span className="px-1.5 py-0.5 bg-primary-50 text-primary-700 text-[8px] font-black uppercase tracking-widest rounded">{badge}</span>
        )}
      </div>
      <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{description}</p>
    </div>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`w-9 h-5 rounded-full p-0.5 transition-all duration-200 flex-shrink-0 ${value ? 'bg-primary-700 shadow-[0_0_0_2px_rgba(15,103,134,0.2)]' : 'bg-slate-300'}`}
      aria-pressed={value}
      aria-label={label}
    >
      <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${value ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  </div>
);

export default function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const appVersion = useMemo(() => import.meta.env.VITE_APP_VERSION || '1.0.4', []);

  useEffect(() => {
    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const response = await authApi.me();
        setProfile(response.data);
      } catch {
        setProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    };

    const current = loadAppSettings();
    setSettings(current);
    applyThemeFromSettings(current);

    loadProfile();
  }, []);

  const updateSetting = (key: keyof AppSettings, value: boolean) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveAppSettings(next);
    if (key === 'darkMode') {
      applyThemeFromSettings(next);
    }
    setFeedback('Settings saved');
    window.setTimeout(() => setFeedback(null), 1800);
  };

  const handleLogout = async () => {
    const shouldLogout = window.confirm('Log out from this device?');
    if (!shouldLogout) return;

    setIsSaving(true);
    try {
      const refreshToken =
        localStorage.getItem('refresh_token') ??
        sessionStorage.getItem('refresh_token') ??
        undefined;
      await authApi.logout(refreshToken);
    } catch {
      // Proceed with local logout even if server logout fails.
    } finally {
      ['access_token', 'refresh_token', 'phr_token_expiry'].forEach((k) => {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      });
      setIsSaving(false);
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="py-3 pb-24 space-y-4">
      <header className="flex items-center gap-2.5 min-w-0">
        <BackButton />
        <div className="min-w-0">
          <h1 className="text-h1 truncate">Settings</h1>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">Account, privacy & preferences</p>
        </div>
      </header>

      {/* Signed-in banner */}
      <section className="rounded-2xl bg-gradient-to-r from-primary-800 to-primary-700 p-3.5 text-white shadow-[0_8px_24px_rgba(15,103,134,0.28)]">
        <p className="text-[10px] text-primary-200 font-medium uppercase tracking-wider">Signed in as</p>
        <p className="text-base font-black mt-0.5 leading-tight">{loadingProfile ? 'Loading...' : profile?.full_name || 'Vaidya User'}</p>
        <p className="text-[11px] text-primary-200 mt-0.5">{profile?.contact_phone || profile?.contact_email || 'No contact info on file'}</p>
      </section>

      {feedback && (
        <div className="rounded-xl border border-success-200 bg-success-50 px-3 py-2 text-xs font-semibold text-success-700">
          {feedback}
        </div>
      )}

      {/* Account */}
      <section className="space-y-1.5">
        <p className="section-label">Account</p>
        <ActionRow
          icon={User}
          label="Manage Profile"
          description="Update personal and family member details"
          onClick={() => navigate('/profile')}
        />
        <ActionRow
          icon={Bell}
          label="Notification History"
          description="Review recent alerts and activity"
          onClick={() => navigate('/notifications')}
        />
      </section>

      {/* Security & Privacy */}
      <section className="space-y-1.5">
        <p className="section-label">Security & Privacy</p>
        <ToggleRow
          icon={Shield}
          label="Anonymous Analytics"
          description="Share anonymous usage data to help us improve"
          value={settings.analyticsSharing}
          onChange={(v) => updateSetting('analyticsSharing', v)}
        />
      </section>

      {/* Preferences */}
      <section className="space-y-1.5">
        <p className="section-label">Preferences</p>
        <ToggleRow
          icon={Bell}
          label="In-App Notifications"
          description="New reports and billing alerts inside the app"
          value={settings.pushNotifications}
          onChange={(v) => updateSetting('pushNotifications', v)}
        />
        <ToggleRow
          icon={Smartphone}
          label="SMS Alerts"
          description="Critical updates to your registered phone number"
          value={settings.smsAlerts}
          onChange={(v) => updateSetting('smsAlerts', v)}
        />
        <ToggleRow
          icon={Moon}
          label="Dark Mode"
          description="Darker theme for low-light environments"
          value={settings.darkMode}
          onChange={(v) => updateSetting('darkMode', v)}
        />
      </section>

      {/* Support */}
      <section className="space-y-1.5">
        <p className="section-label">Support</p>
        <ExternalActionRow
          icon={HelpCircle}
          label="Help & Support"
          description="Contact our support team by email"
          href="mailto:support@vaidya.health?subject=Vaidya%20PHR%20Support"
        />
        <ExternalActionRow
          icon={MessageSquare}
          label="Send Feedback"
          description="Share suggestions or report issues"
          href="mailto:feedback@vaidya.health?subject=Vaidya%20PHR%20Feedback"
        />
      </section>

      {/* Logout */}
      <button
        onClick={handleLogout}
        disabled={isSaving}
        className="w-full bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold hover:bg-rose-100 transition-all active:scale-[0.97] disabled:opacity-70"
      >
        <LogOut size={15} />
        {isSaving ? 'Logging out...' : 'Log out'}
      </button>

      <div className="text-center pb-2">
        <p className="text-[10px] text-slate-400">Vaidya PHR Suite v{appVersion}</p>
      </div>
    </div>
  );
}
