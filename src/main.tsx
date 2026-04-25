import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { ProfileProvider } from './context/ProfileContext';
import { applyThemeFromSettings, loadAppSettings, SETTINGS_CHANGED_EVENT, SETTINGS_STORAGE_KEY } from './utils/settings';
import './index.css';

if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    });
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('SW registered:', registration);
        },
        (error) => {
          console.log('SW registration failed:', error);
        }
      );
    });
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const syncTheme = () => {
  applyThemeFromSettings(loadAppSettings());
};

syncTheme();

window.addEventListener('storage', (event) => {
  if (event.key === SETTINGS_STORAGE_KEY) {
    syncTheme();
  }
});

window.addEventListener(SETTINGS_CHANGED_EVENT, syncTheme);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <QueryClientProvider client={queryClient}>
        <ProfileProvider>
          <App />
        </ProfileProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
