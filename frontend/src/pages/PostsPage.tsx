import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { api } from '../lib/api';
import { LoadingSpinner, EmptyState, Skeleton } from '../components/ui';
import PageHeader from '../components/PageHeader';
import type { Post } from '../types';

interface Category { id: number; name: string; slug: string; }

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Category[]>('/posts/meta/categories').then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const q = categoryId ? `?categoryId=${categoryId}` : '';
    api.get<{ items: Post[] }>(`/posts${q}`).then((d) => setPosts(d.items)).finally(() => setLoading(false));
  }, [categoryId]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="攻略智库"
        subtitle="深度解析忘却之庭、角色培养与跃迁攻略"
        icon={<BookOpen className="w-8 h-8" />}
      />

      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setCategoryId(undefined)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!categoryId ? 'btn-primary py-1.5' : 'btn-ghost border border-white/10'}`}>
          全部
        </button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setCategoryId(c.id)} className={`px-4 py-1.5 rounded-full text-sm transition-all ${categoryId === c.id ? 'btn-primary py-1.5' : 'btn-ghost border border-white/10'}`}>
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-4 space-y-3">
              <Skeleton className="h-44 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState message="暂无攻略文章" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <Link key={post.id} to={`/posts/${post.slug}`} className="card hover:border-star-purple/30 transition-colors block">
              {post.coverImage && <img src={post.coverImage} alt="" className="w-full h-44 object-cover rounded-lg mb-3" loading="lazy" />}
              <h2 className="font-semibold text-lg">{post.title}</h2>
              {post.excerpt && <p className="text-gray-400 text-sm mt-2 line-clamp-2">{post.excerpt}</p>}
              <p className="text-sm text-gray-500 mt-4">{post.author.nickname}</p>
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {post.tags.map(({ tag }) => (
                    <span key={tag.id} className="text-xs bg-star-cyan/10 text-star-cyan px-2 py-0.5 rounded">{tag.name}</span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
