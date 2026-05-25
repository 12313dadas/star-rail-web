import { useState, useEffect } from 'react';
import { useMusic } from '../contexts/MusicContext';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/ui';
import PostEditorModal from '../components/PostEditorModal';
import MomentEditorModal from '../components/MomentEditorModal';
import type { Post, Moment, Comment, User, MusicTrack } from '../types';

export default function AdminPage() {
  const { user } = useAuth();
  const { refreshTracks } = useMusic();
  const [syncingMusic, setSyncingMusic] = useState(false);
  const [tab, setTab] = useState<'posts' | 'moments' | 'comments' | 'users' | 'music'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingPost, setEditingPost] = useState<Post | null | undefined>(undefined);
  const [editingMoment, setEditingMoment] = useState<Moment | null | undefined>(undefined);

  const reloadData = () => {
    if (user?.role !== 'ADMIN') return;
    setLoading(true);
    const loaders: Record<string, () => Promise<void>> = {
      posts: () => api.get<{ items: Post[] }>('/posts?limit=50').then((d) => setPosts(d.items)),
      moments: () => api.get<{ items: Moment[] }>('/moments?limit=50').then((d) => setMoments(d.items)),
      comments: () => api.get<Comment[]>('/comments/admin/pending').then(setComments),
      users: () => api.get<User[]>('/users').then(setUsers),
      music: () => api.get<MusicTrack[]>('/music/admin/all').then(setTracks),
    };
    loaders[tab]?.().finally(() => setLoading(false));
  };

  useEffect(() => {
    reloadData();
  }, [tab, user]);

  if (!user) return <p className="text-center py-12">请先 <Link to="/login" className="text-star-cyan">登录</Link></p>;
  if (user.role !== 'ADMIN') return <p className="text-center py-12 text-red-400">需要管理员权限</p>;

  const tabs = [
    { id: 'posts' as const, label: '文章' },
    { id: 'moments' as const, label: '说说' },
    { id: 'comments' as const, label: '待审评论' },
    { id: 'users' as const, label: '用户' },
    { id: 'music' as const, label: '音乐' },
  ];

  const deletePost = async (id: number) => {
    if (!confirm('确认删除？')) return;
    await api.delete(`/posts/${id}`);
    setPosts((p) => p.filter((x) => x.id !== id));
  };

  const deleteMoment = async (id: number) => {
    if (!confirm('确认删除？')) return;
    await api.delete(`/moments/${id}`);
    setMoments((m) => m.filter((x) => x.id !== id));
  };

  const approveComment = async (id: number) => {
    await api.patch(`/comments/${id}/approve`);
    setComments((c) => c.filter((x) => x.id !== id));
  };

  const toggleRole = async (id: number, role: 'USER' | 'ADMIN') => {
    await api.patch(`/users/${id}/role`, { role });
    setUsers((u) => u.map((x) => x.id === id ? { ...x, role } : x));
  };

  const syncMusic = async () => {
    setSyncingMusic(true);
    try {
      const res = await api.post<{ synced: number }>('/music/sync-local');
      await refreshTracks();
      reloadData();
      alert(`已同步 ${res.synced} 首歌曲到播放器`);
    } catch (err) {
      alert(err instanceof Error ? err.message : '同步失败');
    } finally {
      setSyncingMusic(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">管理后台</h1>
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-lg text-sm ${tab === t.id ? 'bg-star-purple text-white' : 'bg-white/5 hover:bg-white/10'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-x-auto">
          {tab === 'posts' && (
            <div>
              <div className="mb-4 flex justify-end">
                <button onClick={() => setEditingPost(null)} className="btn-primary text-sm py-1.5">+ 新建文章</button>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-400 border-b border-white/10"><th className="pb-2">标题</th><th>状态</th><th className="text-right">操作</th></tr></thead>
                <tbody>
                  {posts.map((p) => (
                    <tr key={p.id} className="border-b border-white/5">
                      <td className="py-2">{p.title}</td>
                      <td>{p.published ? '已发布' : '草稿'}</td>
                      <td className="text-right space-x-3">
                        <button onClick={() => setEditingPost(p)} className="text-star-cyan hover:underline">编辑</button>
                        <button onClick={() => deletePost(p.id)} className="text-red-400 hover:underline">删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === 'moments' && (
            <div>
              <div className="mb-4 flex justify-end">
                <button onClick={() => setEditingMoment(null)} className="btn-primary text-sm py-1.5">+ 发说说</button>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-400 border-b border-white/10"><th className="pb-2">内容</th><th className="text-right">操作</th></tr></thead>
                <tbody>
                  {moments.map((m) => (
                    <tr key={m.id} className="border-b border-white/5">
                      <td className="py-2 max-w-md truncate">{m.content}</td>
                      <td className="text-right space-x-3">
                        <button onClick={() => setEditingMoment(m)} className="text-star-cyan hover:underline">编辑</button>
                        <button onClick={() => deleteMoment(m.id)} className="text-red-400 hover:underline">删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === 'comments' && (
            comments.length === 0 ? <p className="text-gray-400">暂无待审评论</p> : comments.map((c) => (
              <div key={c.id} className="flex justify-between items-start py-3 border-b border-white/5">
                <p className="text-sm">{c.content}</p>
                <button onClick={() => approveComment(c.id)} className="btn-primary text-xs py-1">通过</button>
              </div>
            ))
          )}
          {tab === 'users' && (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-400 border-b border-white/10"><th className="pb-2">用户</th><th>角色</th><th></th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5">
                    <td className="py-2">{u.nickname} (@{u.username})</td>
                    <td>{u.role}</td>
                    <td>
                      {u.id !== user.id && (
                        <button onClick={() => toggleRole(u.id, u.role === 'ADMIN' ? 'USER' : 'ADMIN')} className="text-star-cyan text-xs hover:underline">
                          切换角色
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'music' && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <p className="text-sm text-gray-400">共 {tracks.length} 首 · 来源：项目根目录 music/</p>
                <button
                  type="button"
                  onClick={syncMusic}
                  disabled={syncingMusic}
                  className="btn-primary text-sm py-1.5"
                >
                  {syncingMusic ? '同步中…' : '从 music/ 同步到播放器'}
                </button>
              </div>
              {tracks.map((t) => (
                <div key={t.id} className="flex justify-between py-2 border-b border-white/5 gap-4">
                  <span className="truncate">{t.artist} — {t.title}</span>
                  <span className={t.active ? 'text-green-400 shrink-0' : 'text-gray-500 shrink-0'}>
                    {t.active ? '启用' : '禁用'}
                  </span>
                </div>
              ))}
              <p className="text-xs text-gray-500 mt-4">
                新增歌曲：放入 music/ 后点击上方按钮，或运行 npm run music:sync。本地开发时后端启动也会自动同步。
              </p>
            </div>
          )}
        </div>
      )}

      {editingPost !== undefined && (
        <PostEditorModal
          post={editingPost}
          onClose={() => setEditingPost(undefined)}
          onSave={() => { setEditingPost(undefined); reloadData(); }}
        />
      )}

      {editingMoment !== undefined && (
        <MomentEditorModal
          moment={editingMoment}
          onClose={() => setEditingMoment(undefined)}
          onSave={() => { setEditingMoment(undefined); reloadData(); }}
        />
      )}
    </div>
  );
}
