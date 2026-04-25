import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  HelpCircle,
  LogOut,
  Moon,
  Shield,
  Smartphone,
  User,
} from 'lucide-react';
import { authApi } from '../api/client';
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
    className="w-full bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-primary-200 transition-all"
  >
    <div className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center bg-slate-100 text-slate-600">
      <Icon size={18} strokeWidth={2.4} />
    </div>
    <div className="flex-1 text-left">
      <h4 className="text-sm font-bold text-slate-900">{label}</h4>
      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
    </div>
    <ChevronRight size={16} className="text-slate-300" />
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
    className="w-full bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-primary-200 transition-all"
  >
    <div className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center bg-slate-100 text-slate-600">
      <Icon size={18} strokeWidth={2.4} />
    </div>
    <div className="flex-1 text-left">
      <h4 className="text-sm font-bold text-slate-900">{label}</h4>
      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
    </div>
    <ChevronRight size={16} className="text-slate-300" />
  </a>
);

const ToggleRow = ({
  icon: Icon,
  label,
  description,
  value,
  onChange,
}: {
  icon: any;
  label: string;
  description: string;
  value: boolean;
  onChange: (nextValue: boolean) => void;
}) => (
  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
    <div className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center bg-slate-100 text-slate-600">
      <Icon size={18} strokeWidth={2.4} />
    </div>
    <div className="flex-1">
      <h4 className="text-sm font-bold text-slate-900">{label}</h4>
      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
    </div>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full p-1 transition-colors ${value ? 'bg-primary-700' : 'bg-slate-300'}`}
      aria-pressed={value}
      aria-label={label}
    >
      <div className={`h-4 w-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
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
    setFeedback('Settings updated');
    window.setTimeout(() => setFeedback(null), 1800);
  };

  const handleLogout = async () => {
    const shouldLogout = window.confirm('Log out from this device?');
    if (!shouldLogout) return;

    setIsSaving(true);
    try {
      const refreshToken = localStorage.getItem('refresh_token') || undefined;
      await authApi.logout(refreshToken);
    } catch {
      // Proceed with local logout even if server logout fails.
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setIsSaving(false);
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="py-5 pb-28 space-y-5 sm:space-y-6">
      <header className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center shadow-sm active:scale-95 transition-all text-slate-600 hover:text-primary-700"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-none truncate">Settings</h1>
          <p className="text-xs font-medium text-slate-500 mt-1 truncate">Account, privacy and app preferences</p>
        </div>
      </header>

      <section className="rounded-2xl bg-gradient-to-r from-primary-800 to-primary-700 p-4 text-white shadow-[0_12px_30px_rgba(15,103,134,0.28)]">
        <p className="text-xs text-primary-100">Signed in as</p>
        <p className="text-lg font-black mt-1">{loadingProfile ? 'Loading...' : profile?.full_name || 'Vaidya User'}</p>
        <p className="text-xs text-primary-100 mt-1">{profile?.contact_phone || profile?.contact_email || 'No contact info available'}</p>
      </section>

      {feedback && (
        <div className="rounded-xl border border-success-200 bg-success-50 px-3 py-2 text-xs font-semibold text-success-700">
          {feedback}
        </div>
      )}

      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-600">Account</h3>
        <div className="space-y-3">
          <ActionRow
            icon={User}
            label="Manage profile"
            description="Update personal and family member details"
            onClick={() => navigate('/profile')}
          />
          <ActionRow
            icon={Bell}
            label="Notification history"
            description="Review recent alerts and updates"
            onClick={() => navigate('/notifications')}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-600">Security and Privacy</h3>
        <div className="space-y-3">
          <ToggleRow
            icon={Shield}
            label="Anonymous usage analytics"
            description="Share app performance data to improve reliability"
            value={settings.analyticsSharing}
            onChange={(v) => updateSetting('analyticsSharing', v)}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-600">Preferences</h3>
        <div className="space-y-3">
          <ToggleRow
            icon={Bell}
            label="Push notifications"
            description="Lab updates, report availability and reminders"
            value={settings.pushNotifications}
            onChange={(v) => updateSetting('pushNotifications', v)}
          />
          <ToggleRow
            icon={Smartphone}
            label="SMS alerts"
            description="Critical updates over SMS to your registered number"
            value={settings.smsAlerts}
            onChange={(v) => updateSetting('smsAlerts', v)}
          />
          <ToggleRow
            icon={Moon}
            label="Dark mode"
            description="Use a darker color theme (coming in next release)"
            value={settings.darkMode}
            onChange={(v) => updateSetting('darkMode', v)}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-600">Support</h3>
        <ExternalActionRow
          icon={HelpCircle}
          label="Help and Support"
          description="Contact support team directly over email"
          href="mailto:support@vaidya.health?subject=Vaidya%20PHR%20Support"
        />
      </section>

      <button
        onClick={handleLogout}
        disabled={isSaving}
        className="w-full bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center justify-center gap-2 font-semibold hover:bg-rose-100 transition-all active:scale-[0.99] disabled:opacity-70"
      >
        <LogOut size={17} />
        {isSaving ? 'Logging out...' : 'Log out'}
      </button>

      <div className="text-center">
        <p className="text-xs text-slate-400">Vaidya PHR Suite v{appVersion}</p>
      </div>
    </div>
  );
}
