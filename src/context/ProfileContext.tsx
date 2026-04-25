import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useProfiles } from '../hooks/useApi';

export interface AppProfile {
  id: string;
  full_name: string;
  relationship: string;
  is_primary: boolean;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
}

interface ProfileContextValue {
  profiles: AppProfile[];
  activeProfileId: string | null;
  activeProfile: AppProfile | null;
  setActiveProfileId: (profileId: string) => void;
  loading: boolean;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

const STORAGE_KEY = 'active_profile_id';

export function ProfileProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isPublicAuthRoute = location.pathname === '/login' || location.pathname === '/signup';
  const hasToken = Boolean(localStorage.getItem('access_token'));
  const shouldLoadProfiles = hasToken && !isPublicAuthRoute;

  const { data, isLoading } = useProfiles(shouldLoadProfiles);
  const profiles: AppProfile[] = data || [];

  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(
    localStorage.getItem(STORAGE_KEY)
  );

  useEffect(() => {
    if (shouldLoadProfiles) {
      return;
    }

    setActiveProfileIdState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, [shouldLoadProfiles]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!profiles.length) {
      setActiveProfileIdState(null);
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const stillValid = activeProfileId && profiles.some((p) => p.id === activeProfileId);
    if (stillValid) {
      return;
    }

    const primary = profiles.find((p) => p.is_primary);
    const next = primary?.id ?? profiles[0].id;
    setActiveProfileIdState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, [profiles, activeProfileId, isLoading]);

  const setActiveProfileId = (profileId: string) => {
    setActiveProfileIdState(profileId);
    localStorage.setItem(STORAGE_KEY, profileId);
  };

  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === activeProfileId) || null,
    [profiles, activeProfileId]
  );

  const value: ProfileContextValue = {
    profiles,
    activeProfileId,
    activeProfile,
    setActiveProfileId,
    loading: isLoading,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useActiveProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useActiveProfile must be used within ProfileProvider');
  }
  return ctx;
}
