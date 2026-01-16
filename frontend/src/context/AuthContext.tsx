import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  role: string | null;
  login: (token: string, role: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeJwt(token: string) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(() => localStorage.getItem('role'));
  const expiryTimer = useRef<number | null>(null);

  const scheduleExpiry = (tokenValue: string) => {
    const decoded: any = decodeJwt(tokenValue);
    if (!decoded || !decoded.exp) return;
    const now = Date.now();
    const expMs = decoded.exp * 1000;
    const delay = expMs - now;
    if (delay <= 0) {
      // already expired
      logout();
      return;
    }
    // clear previous
    if (expiryTimer.current) window.clearTimeout(expiryTimer.current);
    expiryTimer.current = window.setTimeout(() => {
      logout();
    }, delay) as unknown as number;
  };

  useEffect(() => {
    const t = localStorage.getItem('token');
    const r = localStorage.getItem('role');
    if (t) {
      setToken(t);
      scheduleExpiry(t);
    }
    if (r) setRole(r);

    return () => {
      if (expiryTimer.current) window.clearTimeout(expiryTimer.current);
    };
  }, []);

  const login = (newToken: string, newRole: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
    setToken(newToken);
    setRole(newRole);
    scheduleExpiry(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
    if (expiryTimer.current) {
      window.clearTimeout(expiryTimer.current);
      expiryTimer.current = null;
    }
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
