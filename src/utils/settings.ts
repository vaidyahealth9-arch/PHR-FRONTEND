export const SETTINGS_STORAGE_KEY = 'phr_settings_v1';
export const SETTINGS_CHANGED_EVENT = 'phr-settings-changed';

export type AppSettings = {
  pushNotifications: boolean;
  smsAlerts: boolean;
  darkMode: boolean;
  analyticsSharing: boolean;
};

export const DEFAULT_SETTINGS: AppSettings = {
  pushNotifications: true,
  smsAlerts: true,
  darkMode: false,
  analyticsSharing: false,
};

export const loadAppSettings = (): AppSettings => {
  const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!raw) return DEFAULT_SETTINGS;

  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveAppSettings = (next: AppSettings) => {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(SETTINGS_CHANGED_EVENT, { detail: next }));
};

export const applyThemeFromSettings = (settings: AppSettings) => {
  document.documentElement.classList.toggle('dark', settings.darkMode);
  document.body.classList.toggle('dark', settings.darkMode);
};
