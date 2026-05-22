// Centralized config for PHR frontend
// Read environment variables exposed by Vite via import.meta.env

export const API_BASE_URL: string = (import.meta.env.VITE_API_URL || 'http://localhost:8000').trim();
export const REALTIME_POLL_MS: number = Number(import.meta.env.VITE_REALTIME_POLL_MS || '20000');
export const APP_VERSION: string = import.meta.env.VITE_APP_VERSION || '1.0.0';
export const GOOGLE_CLIENT_ID: string = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const config = {
  API_BASE_URL,
  REALTIME_POLL_MS,
  APP_VERSION,
  GOOGLE_CLIENT_ID,
};

export default config;
