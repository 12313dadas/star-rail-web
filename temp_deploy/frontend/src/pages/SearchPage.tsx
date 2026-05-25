import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { LoadingSpinner, EmptyState } from '../components/ui';
import type { Post, Moment } from '../types';

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [posts, setPosts] = useState<Post[]>([]);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    api.get<{ posts: Post[]; moments: Moment[] }>(`/search?q=${encodeURIComponent(q)}`)
      .then((d) => { setPosts(d.posts); setMoments(d.moments); })
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">搜索：{q || '...'}</h1>
      {loading ? <LoadingSpinner /> : !q ? (
        <EmptyState message="请输入搜索关键词" />
      ) : posts.length === 0 && moments.length === 0 ? (
        <EmptyState message="未找到相关内容" />
      ) : (
        <div className="space-y-8">
          {posts.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4 text-star-gold">攻略 ({posts.length})</h2>
              <div className="space-y-3">
                {posts.map((p) => (
                  <Link key={p.id} to={`/posts/${p.slug}`} className="card block hover:border-star-purple/30">
                    <h3 className="font-medium">{p.title}</h3>
                    {p.excerpt && <p className="text-sm text-gray-400 mt-1">{p.excerpt}</p>}
                  </Link>
                ))}
              </div>
            </section>
          )}
          {moments.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4 text-star-cyan">说说 ({moments.length})</h2>
              <div className="space-y-3">
                {moments.map((m) => (
                  <Link key={m.id} to={`/moments/${m.id}`} className="card block hover:border-star-cyan/30">
                    <p className="line-clamp-3">{m.content}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
