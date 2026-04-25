export const NOTIFICATIONS_LAST_SEEN_KEY = 'phr_notifications_last_seen_at';

export const getNotificationsLastSeenAt = (): number => {
  const raw = localStorage.getItem(NOTIFICATIONS_LAST_SEEN_KEY);
  if (!raw) return 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const markNotificationsSeenNow = () => {
  localStorage.setItem(NOTIFICATIONS_LAST_SEEN_KEY, String(Date.now()));
};
