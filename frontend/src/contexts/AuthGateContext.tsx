import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface AuthGateContextType {
  authOpen: boolean;
  authMessage: string;
  openAuth: (message?: string) => void;
  closeAuth: () => void;
}

const AuthGateContext = createContext<AuthGateContextType | null>(null);

export function AuthGateProvider({ children }: { children: ReactNode }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState('登录后即可使用完整功能');

  const openAuth = useCallback((message?: string) => {
    if (message) setAuthMessage(message);
    else setAuthMessage('登录后即可使用完整功能');
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => setAuthOpen(false), []);

  return (
    <AuthGateContext.Provider value={{ authOpen, authMessage, openAuth, closeAuth }}>
      {children}
    </AuthGateContext.Provider>
  );
}

export function useAuthGate() {
  const ctx = useContext(AuthGateContext);
  if (!ctx) throw new Error('useAuthGate must be used within AuthGateProvider');
  return ctx;
}

/** 需登录才能访问的路径前缀 */
export const PROTECTED_PATH_PREFIXES = ['/posts', '/moments', '/albums', '/squads'];

export function isProtectedPath(path: string): boolean {
  return PROTECTED_PATH_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}
