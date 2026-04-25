import { useState, useEffect } from 'react';
import { authApi } from '../api/client';

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  is_active: boolean;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
    setLoading(false);
  };

  const login = (accessToken: string, refreshToken: string) => {
    console.log('useAuth.login called with tokens');
    console.log('Access token:', accessToken?.substring(0, 20) + '...');
    
    // Save to localStorage FIRST
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    } else {
      localStorage.removeItem('refresh_token');
    }
    console.log('Tokens saved to localStorage');
    
    // Then update state - this should trigger immediately
    setIsAuthenticated(true);
    console.log('isAuthenticated set to true');
    
    // Force a re-check to ensure state is synced
    checkAuth();
  };

  const signup = async (payload: Parameters<typeof authApi.signup>[0]) => {
    await authApi.signup(payload);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token') || undefined;
    try {
      await authApi.logout(refreshToken);
    } catch {
      // best-effort logout
    }

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuth,
    signup,
  };
}
