import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Train, User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { triggerIntroAfterLogin } from '../components/ExpressIntroGate';
import ParticleConstellation from '../components/effects/ParticleConstellation';

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', nickname: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

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
      setSuccess(true);
      setTimeout(() => {
        triggerIntroAfterLogin();
        navigate('/', { state: { playIntro: true } });
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty('--rx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    btn.style.setProperty('--ry', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  }, []);

  const toggleMode = () => {
    setIsRegister((p) => !p);
    setError('');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-star-void">
      {/* 动态粒子背景 */}
      <ParticleConstellation fullPage particleCount={60} linkThreshold={160} />

      {/* 环境光晕 */}
      <div className="auth-orb w-96 h-96 bg-star-purple/25 -top-32 -left-32" style={{ animationDelay: '0s' }} />
      <div className="auth-orb w-80 h-80 bg-star-gold/15 bottom-0 right-0" style={{ animationDelay: '2s' }} />
      <div className="auth-orb w-64 h-64 bg-star-cyan/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: '4s' }} />

      {/* 浮动装饰元素 */}
      <div className="auth-float-deco" aria-hidden><div className="auth-float-hex" /></div>
      <div className="auth-float-deco" aria-hidden><div className="auth-float-ring" /></div>
      <div className="auth-float-deco" aria-hidden><div className="auth-float-diamond" /></div>
      <div className="auth-float-deco" aria-hidden><div className="auth-float-ring" /></div>

      <div className={`relative z-10 w-full max-w-md transition-all duration-500 ${success ? 'scale-105 opacity-0' : 'animate-slide-up'}`}>
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
        <div ref={panelRef} className="auth-panel-wrap">
          <div className="panel-star p-8 backdrop-blur-xl auth-panel-inner transition-all duration-500">
            <div className="flex mb-8 rounded-xl bg-star-void/50 p-1 border border-white/5">
              <button
                type="button"
                onClick={() => { if (isRegister) toggleMode(); }}
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
                onClick={() => { if (!isRegister) toggleMode(); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isRegister
                    ? 'bg-gradient-to-r from-star-purple/80 to-star-purple-dim text-white shadow-star-glow'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                注册
              </button>
            </div>

            <div className="overflow-hidden" style={{ maxHeight: isRegister ? '400px' : '240px', transition: 'max-height 0.4s cubic-bezier(0.22, 1, 0.36, 1)' }}>
              <h2 className="font-display text-lg text-center text-gray-200 mb-6 tracking-wide">
                {isRegister ? '获取登车资格' : '开拓者，欢迎回来'}
              </h2>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center animate-fade-in">
                  {error}
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                <div className="relative">
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
                </div>

                <div className="space-y-4" style={{
                  maxHeight: isRegister ? '200px' : '0',
                  opacity: isRegister ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                }}>
                  <div className="relative">
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
                        required={isRegister}
                      />
                    </Field>
                  </div>
                  <div className="relative">
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
                        required={isRegister}
                      />
                    </Field>
                  </div>
                </div>

                <div className="relative">
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
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  onMouseMove={handleRipple}
                  className="btn-primary auth-btn-ripple w-full flex items-center justify-center gap-2 py-3.5 mt-6 group"
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
          </div>
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
        className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-all duration-300 ${
          focused ? 'text-star-gold scale-110' : 'text-gray-500'
        }`}
      >
        {icon}
      </span>
      {children}
    </div>
  );
}
