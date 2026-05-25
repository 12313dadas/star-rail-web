import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PenLine, Plus } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, formatTime, LoadingSpinner } from '../components/ui';
import PostEditorModal from '../components/PostEditorModal';
import MomentEditorModal from '../components/MomentEditorModal';
import type { User, Post, Moment } from '../types';

type TimelineItem =
  | (Post & { itemType: 'post' })
  | (Moment & { itemType: 'moment' });

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<User & { _count?: { posts: number; moments: number }; createdAt?: string } | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null | undefined>(undefined);
  const [editingMoment, setEditingMoment] = useState<Moment | null | undefined>(undefined);

  const profileId = Number(id);
  const isSelf = Boolean(user && profileId === user.id);

  const reload = () => {
    if (!id) return Promise.resolve();
    return Promise.all([
      api.get<typeof profile>(`/users/${id}`),
      api.get<{ items: TimelineItem[] }>(`/users/${id}/timeline`),
    ]).then(([p, t]) => {
      setProfile(p);
      setTimeline(t.items);
    });
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    reload().finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!profile) return <p className="text-center text-gray-400 py-12">用户不存在</p>;

  return (
    <div>
      <div className="card flex flex-col sm:flex-row items-center gap-6 mb-8">
        <Avatar src={profile.avatar} name={profile.nickname} size="lg" />
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold">{profile.nickname}</h1>
          <p className="text-gray-400">@{profile.username}</p>
          {profile.bio && <p className="mt-2 text-gray-300">{profile.bio}</p>}
          <p className="text-sm text-gray-500 mt-2">
            {profile._count?.posts ?? 0} 篇攻略 · {profile._count?.moments ?? 0} 条说说
          </p>
        </div>
      </div>

      {isSelf && (
        <div className="panel-star p-5 sm:p-6 mb-8 border-star-purple/25">
          <p className="text-[11px] text-star-cyan tracking-[0.35em] uppercase mb-2">Creator Studio</p>
          <h2 className="font-display text-lg text-gray-100 mb-4">创作与发布</h2>
          <p className="text-sm text-gray-500 mb-5 max-w-xl">
            登录用户可在个人空间发布说说与攻略，内容会出现在首页动态流与你的时间线中。
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setEditingMoment(null)} className="btn-primary text-sm inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              发说说
            </button>
            <button type="button" onClick={() => setEditingPost(null)} className="btn-gold-outline text-sm inline-flex items-center gap-2">
              <PenLine className="w-4 h-4" />
              写攻略
            </button>
            <Link to="/moments" className="btn-ghost text-sm border border-white/10">
              说说广场
            </Link>
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">时间线</h2>
      <div className="space-y-4">
        {timeline.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            {isSelf ? '还没有内容，试试发一条说说或写一篇攻略吧。' : '暂无公开内容'}
          </p>
        )}
        {timeline.map((item) => (
          <div key={`${item.itemType}-${item.id}`} className="card">
            {item.itemType === 'post' ? (
              <Link to={`/posts/${item.slug}`} className="block">
                <span className="text-xs text-star-gold">攻略</span>
                <h3 className="font-medium mt-1">{item.title}</h3>
                {item.excerpt && <p className="text-sm text-gray-400 mt-1">{item.excerpt}</p>}
              </Link>
            ) : (
              <Link to={`/moments/${item.id}`} className="block">
                <span className="text-xs text-star-cyan">说说</span>
                <p className="mt-1 line-clamp-4">{item.content}</p>
              </Link>
            )}
            <p className="text-xs text-gray-500 mt-2">{formatTime(item.createdAt)}</p>
          </div>
        ))}
      </div>

      {editingPost !== undefined && (
        <PostEditorModal
          post={editingPost}
          onClose={() => setEditingPost(undefined)}
          onSave={() => {
            setEditingPost(undefined);
            reload();
          }}
        />
      )}
      {editingMoment !== undefined && (
        <MomentEditorModal
          moment={editingMoment}
          onClose={() => setEditingMoment(undefined)}
          onSave={() => {
            setEditingMoment(undefined);
            reload();
          }}
        />
      )}
    </div>
  );
}
