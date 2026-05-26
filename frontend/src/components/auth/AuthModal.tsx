import { useState } from 'react';
import { X, User, Mail, Lock, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthGate } from '../../contexts/AuthGateContext';

export default function AuthModal() {
  const { login, register } = useAuth();
  const { authOpen, authMessage, closeAuth } = useAuthGate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', nickname: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!authOpen) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(form);
      } else {
        await login(form.username, form.password);
      }
      closeAuth();
      setForm({ username: '', email: '', password: '', nickname: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" onClick={closeAuth}>
      <div
        className="panel-star w-full max-w-md p-6 border-star-gold/25 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 id="auth-modal-title" className="font-display text-lg text-gradient-gold tracking-wider">
              登车 · 星穹空间
            </h2>
            <p className="text-sm text-gray-500 mt-1">{authMessage}</p>
          </div>
          <button type="button" onClick={closeAuth} className="p-2 rounded-lg hover:bg-white/10 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex mb-5 rounded-xl bg-star-void/50 p-1 border border-white/5">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              !isRegister ? 'bg-star-purple text-white' : 'text-gray-500'
            }`}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              isRegister ? 'bg-star-purple text-white' : 'text-gray-500'
            }`}
          >
            注册
          </button>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">{error}</div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="sr-only">用户名</span>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="用户名"
                className="input pl-10"
                required
                autoComplete="username"
              />
            </div>
          </label>

          {isRegister && (
            <>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="邮箱"
                  type="email"
                  className="input pl-10"
                  required
                />
              </div>
              <div className="relative">
                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  value={form.nickname}
                  onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                  placeholder="昵称"
                  className="input pl-10"
                  required
                />
              </div>
            </>
          )}

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="密码"
              type="password"
              className="input pl-10"
              required
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <span>{isRegister ? '注册并登车' : '登录'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-4">演示账号 admin / admin123</p>
      </div>
    </div>
  );
}
