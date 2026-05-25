import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { LoadingSpinner, EmptyState } from '../components/ui';
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
    <div>
      <h1 className="text-2xl font-bold mb-6">攻略文章</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setCategoryId(undefined)} className={`px-3 py-1 rounded-full text-sm ${!categoryId ? 'bg-star-purple text-white' : 'bg-white/5 hover:bg-white/10'}`}>
          全部
        </button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setCategoryId(c.id)} className={`px-3 py-1 rounded-full text-sm ${categoryId === c.id ? 'bg-star-purple text-white' : 'bg-white/5 hover:bg-white/10'}`}>
            {c.name}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : posts.length === 0 ? (
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
