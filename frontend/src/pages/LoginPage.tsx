import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Train, User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { triggerIntroAfterLogin } from '../components/ExpressIntroGate';
import StarfieldBackground from '../components/StarfieldBackground';

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', nickname: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

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
      triggerIntroAfterLogin();
      navigate('/', { state: { playIntro: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <StarfieldBackground dense />

      {/* 环境光晕 */}
      <div className="auth-orb w-96 h-96 bg-star-purple/25 -top-32 -left-32" style={{ animationDelay: '0s' }} />
      <div className="auth-orb w-80 h-80 bg-star-gold/15 bottom-0 right-0" style={{ animationDelay: '2s' }} />
      <div className="auth-orb w-64 h-64 bg-star-cyan/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: '4s' }} />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl border border-star-gold/30 bg-star-panel/80 backdrop-blur-md mb-4 animate-pulse-glow">
            <Train className="w-10 h-10 text-star-gold-bright" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-gradient-gold tracking-wider mb-2">
            星穹空间
          </h1>
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-star-cyan" />
            崩坏：星穹铁道 · 个人领地
            <Sparkles className="w-4 h-4 text-star-purple" />
          </p>
        </div>

        {/* 表单卡片 */}
        <div className="panel-star p-8 backdrop-blur-xl">
          <div className="flex mb-8 rounded-xl bg-star-void/50 p-1 border border-white/5">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                !isRegister
                  ? 'bg-gradient-to-r from-star-purple/80 to-star-purple-dim text-white shadow-star-glow'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                isRegister
                  ? 'bg-gradient-to-r from-star-purple/80 to-star-purple-dim text-white shadow-star-glow'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              注册
            </button>
          </div>

          <h2 className="font-display text-lg text-center text-gray-200 mb-6 tracking-wide">
            {isRegister ? '获取登车资格' : '开拓者，欢迎回来'}
          </h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <Field
              icon={<User className="w-5 h-5" />}
              focused={focused === 'username'}
              onFocus={() => setFocused('username')}
              onBlur={() => setFocused(null)}
            >
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="用户名"
                className="input-star pl-12"
                required
                autoComplete="username"
              />
            </Field>

            {isRegister && (
              <>
                <Field
                  icon={<Mail className="w-5 h-5" />}
                  focused={focused === 'email'}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                >
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="邮箱"
                    type="email"
                    className="input-star pl-12"
                    required
                  />
                </Field>
                <Field
                  icon={<Sparkles className="w-5 h-5" />}
                  focused={focused === 'nickname'}
                  onFocus={() => setFocused('nickname')}
                  onBlur={() => setFocused(null)}
                >
                  <input
                    value={form.nickname}
                    onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                    placeholder="昵称（列车上的称呼）"
                    className="input-star pl-12"
                    required
                  />
                </Field>
              </>
            )}

            <Field
              icon={<Lock className="w-5 h-5" />}
              focused={focused === 'password'}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
            >
              <input
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="密码"
                type="password"
                className="input-star pl-12"
                required
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 mt-6 group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? '注册并登车' : '启动跃迁引擎'}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-600 mt-6">
            演示账号 admin / admin123
          </p>
        </div>

        <Link
          to="/"
          className="block text-center mt-6 text-sm text-gray-500 hover:text-star-cyan transition-colors"
        >
          以访客身份浏览 →
        </Link>
      </div>
    </div>
  );
}

function Field({
  icon,
  children,
  focused,
  onFocus,
  onBlur,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}) {
  return (
    <div className="relative" onFocus={onFocus} onBlur={onBlur}>
      <span
        className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300 ${
          focused ? 'text-star-gold' : 'text-gray-500'
        }`}
      >
        {icon}
      </span>
      {children}
    </div>
  );
}
