import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthGate } from '../../contexts/AuthGateContext';
import { LoadingSpinner } from '../ui';

const MESSAGES: Record<string, string> = {
  '/posts': '登录后即可浏览攻略',
  '/moments': '登录后即可浏览说说',
  '/albums': '登录后即可浏览相册',
  '/squads': '登录后即可浏览阵容',
};

function messageForPath(pathname: string): string {
  for (const [prefix, msg] of Object.entries(MESSAGES)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return msg;
  }
  return '请先登录以继续';
}

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { openAuth } = useAuthGate();

  useEffect(() => {
    if (!loading && !user) {
      openAuth(messageForPath(window.location.pathname));
    }
  }, [loading, user, openAuth]);

  if (loading) return <LoadingSpinner />;
  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 mb-4">此内容需要登车后才能查看</p>
        <button type="button" onClick={() => openAuth(messageForPath(window.location.pathname))} className="btn-primary px-8">
          登录 / 注册
        </button>
      </div>
    );
  }
  return <>{children}</>;
}
