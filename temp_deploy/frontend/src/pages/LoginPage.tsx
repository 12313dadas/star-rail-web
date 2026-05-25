import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', nickname: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-2xl font-bold mb-6 text-center">{isRegister ? '注册' : '登录'}</h1>
      {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
      <form onSubmit={submit} className="space-y-4">
        <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="用户名" className="input" required />
        {isRegister && (
          <>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="邮箱" type="email" className="input" required />
            <input value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} placeholder="昵称" className="input" required />
          </>
        )}
        <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="密码" type="password" className="input" required />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? '处理中...' : isRegister ? '注册' : '登录'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-400 mt-4">
        {isRegister ? '已有账号？' : '没有账号？'}
        <button onClick={() => setIsRegister(!isRegister)} className="text-star-cyan ml-1 hover:underline">
          {isRegister ? '去登录' : '去注册'}
        </button>
      </p>
      <p className="text-center text-xs text-gray-500 mt-4">
        演示账号：admin / admin123
      </p>
      <Link to="/" className="block text-center text-sm text-gray-400 mt-2 hover:text-white">返回首页</Link>
    </div>
  );
}
