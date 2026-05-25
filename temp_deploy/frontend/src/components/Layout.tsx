import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/', label: '\u52a8\u6001' },
  { to: '/posts', label: '\u653b\u7565' },
  { to: '/moments', label: '\u8bf4\u8bf4' },
  { to: '/albums', label: '\u76f8\u518c' },
  { to: '/guestbook', label: '\u7559\u8a00\u677f' },
  { to: '/profile/1', label: '\u5173\u4e8e' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-star-navy/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4 relative">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold bg-gradient-to-r from-star-gold to-star-cyan bg-clip-text text-transparent">
              ????
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} className="btn-ghost text-sm text-gray-300 hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>

          <form onSubmit={handleSearch} className="hidden sm:flex items-center flex-1 max-w-xs">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="\u641c\u7d22\u653b\u7565\u3001\u8bf4\u8bf4..."
                className="input pl-9 py-1.5 text-sm"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="btn-ghost p-2" title="\u7ba1\u7406\u540e\u53f0">
                    <Settings className="w-5 h-5" />
                  </Link>
                )}
                <Link to={`/profile/${user.id}`} className="btn-ghost p-2" title={user.nickname}>
                  <User className="w-5 h-5" />
                </Link>
                <button onClick={logout} className="btn-ghost p-2" title="\u9000\u51fa">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-1.5">??</Link>
            )}
            <button className="md:hidden btn-ghost p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {menuOpen && (
            <nav className="absolute top-16 left-0 right-0 bg-star-navy border-b border-white/10 p-4 md:hidden flex flex-col gap-2">
              {navItems.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className="btn-ghost text-left">
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">{children}</main>

      <footer className="border-t border-white/10 py-6 text-center text-gray-500 text-sm">
        <p>??????? · ??????</p>
      </footer>
    </div>
  );
}
