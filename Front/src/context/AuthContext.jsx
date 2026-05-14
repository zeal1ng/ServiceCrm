import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfile, loginApi, getToken, setToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const user = await getProfile();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    if (getToken()) {
      loadProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [loadProfile]);

  const login = useCallback(async (name, password) => {
    const result = await loginApi({ name, password });
    if (result?.token) {
      setToken(result.token);
      await loadProfile();
      return true;
    }
    return false;
  }, [loadProfile]);

  const logout = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
  }, []);

  const value = {
    currentUser,
    loading,
    login,
    logout,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
