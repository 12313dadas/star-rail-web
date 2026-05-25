import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Avatar, formatTime, LoadingSpinner } from '../components/ui';
import type { User, Post, Moment } from '../types';

type TimelineItem =
  | (Post & { itemType: 'post' })
  | (Moment & { itemType: 'moment' });

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<User & { _count?: { posts: number; moments: number }; createdAt?: string } | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get<typeof profile>(`/users/${id}`),
      api.get<{ items: TimelineItem[] }>(`/users/${id}/timeline`),
    ]).then(([p, t]) => {
      setProfile(p);
      setTimeline(t.items);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!profile) return <p className="text-center text-gray-400 py-12">用户不存在</p>;

  return (
    <div>
      <div className="card flex flex-col sm:flex-row items-center gap-6 mb-8">
        <Avatar src={profile.avatar} name={profile.nickname} size="lg" />
        <div>
          <h1 className="text-2xl font-bold">{profile.nickname}</h1>
          <p className="text-gray-400">@{profile.username}</p>
          {profile.bio && <p className="mt-2 text-gray-300">{profile.bio}</p>}
          <p className="text-sm text-gray-500 mt-2">
            {profile._count?.posts ?? 0} 篇攻略 · {profile._count?.moments ?? 0} 条说说
          </p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">时间线</h2>
      <div className="space-y-4">
        {timeline.map((item) => (
          <div key={`${item.itemType}-${item.id}`} className="card">
            {item.itemType === 'post' ? (
              <Link to={`/posts/${item.slug}`} className="block">
                <span className="text-xs text-star-gold">攻略</span>
                <h3 className="font-medium mt-1">{item.title}</h3>
                {item.excerpt && <p className="text-sm text-gray-400 mt-1">{item.excerpt}</p>}
              </Link>
            ) : (
              <div>
                <span className="text-xs text-star-cyan">说说</span>
                <p className="mt-1">{item.content}</p>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">{formatTime(item.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
