import { useState, useEffect } from 'react';
import { authApi } from '../api/client';

const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';
const EXPIRY_KEY = 'phr_token_expiry';

/** Read a token from localStorage or sessionStorage (localStorage takes priority). */
function readToken(key: string): string | null {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}

/** Clear all auth tokens from both storages. */
function clearTokens() {
  [localStorage, sessionStorage].forEach((store) => {
    store.removeItem(TOKEN_KEY);
    store.removeItem(REFRESH_KEY);
    store.removeItem(EXPIRY_KEY);
  });
}

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
    const token = readToken(TOKEN_KEY);
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    // Validate expiry if set (only present for "Remember me" sessions)
    const expiry = localStorage.getItem(EXPIRY_KEY);
    if (expiry) {
      const expiryMs = Number(expiry);
      if (Number.isFinite(expiryMs) && Date.now() > expiryMs) {
        // Session expired — auto logout
        clearTokens();
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
    }

    setIsAuthenticated(true);
    setLoading(false);
  };

  /**
   * Persist tokens after a successful login.
   * @param accessToken  JWT access token
   * @param refreshToken JWT refresh token
   * @param rememberDays 30 | 90 for "Remember me", undefined for session-only
   */
  const login = (accessToken: string, refreshToken: string, rememberDays?: number) => {
    const storage = rememberDays ? localStorage : sessionStorage;

    clearTokens(); // clean the other storage first

    storage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) {
      storage.setItem(REFRESH_KEY, refreshToken);
    }

    if (rememberDays) {
      const expiryMs = Date.now() + rememberDays * 24 * 60 * 60 * 1000;
      localStorage.setItem(EXPIRY_KEY, String(expiryMs));
    }

    setIsAuthenticated(true);
    checkAuth();
  };

  const signup = async (payload: Parameters<typeof authApi.signup>[0]) => {
    await authApi.signup(payload);
  };

  const logout = async () => {
    const refreshToken = readToken(REFRESH_KEY) || undefined;
    try {
      await authApi.logout(refreshToken);
    } catch {
      // best-effort logout
    }

    clearTokens();
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
