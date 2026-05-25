import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, formatTime, LoadingSpinner } from '../components/ui';
import { Send } from 'lucide-react';
import type { GuestbookMessage } from '../types';

export default function GuestbookPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [content, setContent] = useState('');
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get<GuestbookMessage[]>('/guestbook').then(setMessages).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await api.post('/guestbook', { content, guestName: user ? undefined : guestName });
      setContent('');
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : '留言失败');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">留言板</h1>

      <form onSubmit={submit} className="card mb-8 space-y-3">
        {!user && <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="你的昵称" className="input" />}
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="留下你的足迹..." rows={3} className="input resize-none" />
        <button type="submit" className="btn-primary flex items-center gap-2">
          <Send className="w-4 h-4" /> 留言
        </button>
      </form>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="card flex gap-3">
              <Avatar src={m.author?.avatar} name={m.author?.nickname || m.guestName || '访客'} size="sm" />
              <div>
                <p className="font-medium text-sm">{m.author?.nickname || m.guestName || '访客'}</p>
                <p className="text-gray-300 mt-1">{m.content}</p>
                <p className="text-xs text-gray-500 mt-2">{formatTime(m.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
