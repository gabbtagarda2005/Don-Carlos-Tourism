import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!tokenStore.get());

  const logout = useCallback(() => {
    if (tokenStore.get()) api('/auth/logout', { method: 'POST' }).catch(() => {});
    tokenStore.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    if (!tokenStore.get()) return;
    api('/auth/me')
      .then((d) => setUser(d.user))
      .catch((e) => {
        if (e.status === 401) tokenStore.clear();
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      tokenStore.clear();
      setUser(null);
    };
    window.addEventListener('dct:unauthorized', onUnauthorized);
    return () => window.removeEventListener('dct:unauthorized', onUnauthorized);
  }, []);

  const authenticate = useCallback(async (path, body) => {
    const d = await api(path, { method: 'POST', body });
    tokenStore.set(d.token);
    setUser(d.user);
    return d.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      setUser,
      login: (email, password) => authenticate('/auth/login', { email, password }),
      register: (data) => authenticate('/auth/register', data),
      logout,
      isStaff: !!user && ['admin', 'developer'].includes(user.role),
    }),
    [user, ready, authenticate, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
