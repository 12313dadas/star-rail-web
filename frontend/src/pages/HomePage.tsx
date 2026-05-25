import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Masonry from 'react-masonry-css';
import { api } from '../lib/api';
import { Avatar, formatTime, LoadingSpinner, Skeleton } from '../components/ui';
import { Heart, MessageCircle, Megaphone } from 'lucide-react';
import type { FeedItem, Post } from '../types';
import { parseImages } from '../lib/images';

export default function HomePage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [announcements, setAnnouncements] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const load = useCallback(async (p: number, append = false) => {
    setLoading(true);
    try {
      const data = await api.get<{ items: FeedItem[]; announcements: Post[]; hasMore: boolean }>(`/feed?page=${p}`);
      setItems((prev) => append ? [...prev, ...data.items] : data.items);
      if (p === 1) setAnnouncements(data.announcements);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error('Failed to load feed:', err);
      setHasMore(false); // Stop trying if it fails
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1); }, [load]);

  const lastRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        const next = page + 1;
        setPage(next);
        load(next, true);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, page, load]);

  const breakpointCols = { default: 2, 768: 1 };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative mb-12 rounded-3xl overflow-hidden panel-star p-8 sm:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-star-purple/20 via-transparent to-star-gold/10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-star-cyan/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <p className="font-display text-xs text-star-cyan tracking-[0.4em] uppercase mb-3">Astral Express Terminal</p>
          <h1 className="hero-title text-3xl sm:text-5xl text-gradient-gold mb-4">
            开拓者动态流
          </h1>
          <p className="text-gray-400 max-w-lg text-sm sm:text-base leading-relaxed">
            攻略、说说与公告在此汇聚 —— 如同星穹列车驶过的轨迹，记录你的每一次跃迁。
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/posts" className="btn-primary text-sm">浏览攻略</Link>
            <Link to="/moments" className="btn-gold-outline text-sm">查看说说</Link>
          </div>
        </div>
      </section>

      {announcements.length > 0 && (
        <div className="mb-8 space-y-3">
          <p className="font-display text-xs text-star-gold tracking-widest uppercase mb-2">公告</p>
          {announcements.map((a) => (
            <Link
              key={a.id}
              to={`/posts/${a.slug}`}
              className="card flex items-center gap-4 hover:border-star-gold/40 transition-all group"
            >
              <div className="p-3 rounded-xl bg-star-gold/10 border border-star-gold/20 group-hover:shadow-gold-glow transition-shadow">
                <Megaphone className="w-5 h-5 text-star-gold" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-100">{a.title}</p>
                <p className="text-sm text-gray-500 truncate">{a.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-lg text-gray-300 tracking-wider">最新动态</h2>
        <div className="h-px flex-1 ml-6 bg-gradient-to-r from-star-purple/50 to-transparent max-w-xs" />
      </div>

      {loading && items.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-4 space-y-3">
              <Skeleton className="h-36 w-full rounded-lg" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : (
      <Masonry breakpointCols={breakpointCols} className="flex -ml-4 w-auto" columnClassName="pl-4 bg-clip-padding">
        {items.map((item) => (
          <div key={`${item.feedType}-${item.id}`} className="mb-4">
            {item.feedType === 'post' ? <PostCard item={item} /> : <MomentCard item={item} />}
          </div>
        ))}
      </Masonry>
      )}

      {loading && items.length > 0 && <LoadingSpinner />}
      {hasMore && !loading && <div ref={lastRef} className="h-10" />}
    </div>
  );
}

function PostCard({ item }: { item: FeedItem & { feedType: 'post' } }) {
  return (
    <Link to={`/posts/${item.slug}`} className="card block hover:border-star-purple/30 transition-colors">
      {item.coverImage && (
        <img src={item.coverImage} alt="" className="w-full h-40 object-cover rounded-lg mb-3" loading="lazy" />
      )}
      <span className="inline-flex text-xs font-medium text-star-gold bg-star-gold/10 border border-star-gold/20 px-2.5 py-0.5 rounded-full">
        攻略
      </span>
      <h3 className="font-semibold mt-2">{item.title}</h3>
      {item.excerpt && <p className="text-sm text-gray-400 mt-1 line-clamp-2">{item.excerpt}</p>}
      <FeedMeta author={item.author} createdAt={item.createdAt} counts={item._count} />
    </Link>
  );
}

function MomentCard({ item }: { item: FeedItem & { feedType: 'moment' } }) {
  const images = parseImages(item.images);
  return (
    <Link to={`/moments/${item.id}`} className="card block hover:border-star-cyan/30 transition-colors">
      <FeedMeta author={item.author} createdAt={item.createdAt} counts={item._count} />
      <p className="mt-3 text-gray-200 whitespace-pre-wrap">{item.content}</p>
      {images.length > 0 && (
        <div className={`grid gap-1 mt-3 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {images.slice(0, 9).map((img, i) => (
            <img key={i} src={img} alt="" className="w-full aspect-square object-cover rounded" loading="lazy" />
          ))}
        </div>
      )}
      {item.musicTitle && <p className="text-xs text-star-cyan mt-2">🎵 {item.musicTitle}</p>}
    </Link>
  );
}

function FeedMeta({ author, createdAt, counts }: { author: { nickname: string; avatar?: string | null }; createdAt: string; counts?: { comments: number; likes: number } }) {
  return (
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
      <div className="flex items-center gap-2">
        <Avatar src={author.avatar} name={author.nickname} size="sm" />
        <span className="text-sm text-gray-400">{author.nickname} · {formatTime(createdAt)}</span>
      </div>
      <div className="flex gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{counts?.likes ?? 0}</span>
        <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{counts?.comments ?? 0}</span>
      </div>
    </div>
  );
}
