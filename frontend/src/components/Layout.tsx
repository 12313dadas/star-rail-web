import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, LogOut, Settings, User, Train } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import StarfieldBackground from './StarfieldBackground';

const navItems = [
  { to: '/', label: '动态' },
  { to: '/posts', label: '攻略' },
  { to: '/moments', label: '说说' },
  { to: '/albums', label: '相册' },
  { to: '/squads', label: '阵容' },
  { to: '/guestbook', label: '留言板' },
  { to: '/profile/1', label: '关于' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
  };

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <div className="relative min-h-screen flex flex-col">
      <StarfieldBackground />

      <header className="sticky top-0 z-40 border-b border-star-gold/10">
        <div className="absolute inset-0 bg-star-void/80 backdrop-blur-xl" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gold-line opacity-50" />

        <div className="relative max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="p-2 rounded-xl border border-star-gold/20 bg-star-panel/60 group-hover:border-star-purple/40 transition-all">
              <Train className="w-5 h-5 text-star-gold" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-sm text-gradient-gold tracking-widest block leading-tight">
                星穹空间
              </span>
              <span className="text-[10px] text-gray-500 tracking-[0.2em] uppercase">Personal Terminal</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link ${isActive(item.to) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xs">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-star-gold transition-colors" />
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="搜索攻略、说说..."
                className="input-star pl-10 py-2 text-sm"
              />
            </div>
          </form>

          <div className="flex items-center gap-1">
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="btn-ghost p-2.5" title="管理后台">
                    <Settings className="w-5 h-5 text-star-cyan" />
                  </Link>
                )}
                <Link to={`/profile/${user.id}`} className="btn-ghost p-2.5 flex items-center gap-2" title={user.nickname}>
                  <User className="w-5 h-5" />
                  <span className="hidden xl:inline text-sm text-gray-300">{user.nickname}</span>
                </Link>
                <button onClick={logout} className="btn-ghost p-2.5" title="退出">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2 px-4">
                登车
              </Link>
            )}
            <button type="button" className="lg:hidden btn-ghost p-2.5" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="lg:hidden relative border-t border-white/5 bg-star-panel/95 backdrop-blur-xl p-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={`nav-link ${isActive(item.to) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-4 py-8">{children}</main>

      <footer className="relative z-10 border-t border-star-gold/10 mt-auto">
        <div className="absolute top-0 left-0 right-0 h-px bg-gold-line opacity-30" />
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <p className="font-display text-xs text-star-cyan/80 tracking-[0.3em] uppercase mb-2">Honkai Star Rail</p>
          <p className="text-gray-500 text-sm">崩坏：星穹铁道 · 个人内容空间</p>
        </div>
      </footer>
    </div>
  );
}
