import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ProtectedLink from '../components/auth/ProtectedLink';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, formatTime, LoadingSpinner, Skeleton } from '../components/ui';
import HomeLanding, { type SiteStats } from '../components/home/HomeLanding';
import { Heart, MessageCircle, ArrowRight } from 'lucide-react';
import type { FeedItem, Post } from '../types';
import { parseImages } from '../lib/images';

export default function HomePage() {
  const { user } = useAuth();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [announcements, setAnnouncements] = useState<Post[]>([]);
  const [stats, setStats] = useState<SiteStats | undefined>();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const load = useCallback(async (p: number, append = false) => {
    setLoading(true);
    try {
      const data = await api.get<{
        items: FeedItem[];
        announcements: Post[];
        hasMore: boolean;
        stats?: SiteStats;
      }>(`/feed?page=${p}`);
      setItems((prev) => (append ? [...prev, ...data.items] : data.items));
      if (p === 1) {
        setAnnouncements(data.announcements);
        if (data.stats) setStats(data.stats);
      }
      setHasMore(data.hasMore);
    } catch (err) {
      console.error('Failed to load feed:', err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  const featured = useMemo(() => items.slice(0, 3), [items]);

  const lastRef = useCallback(
    (node: HTMLDivElement | null) => {
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
    },
    [loading, hasMore, page, load]
  );

  return (
    <div className="animate-fade-in home-page">
      <HomeLanding
        nickname={user?.nickname}
        profileTo={user ? `/profile/${user.id}` : undefined}
        announcements={announcements}
        featured={featured}
        stats={stats}
      />

      <section id="home-feed" className="home-block home-feed-block scroll-mt-28">
        <div className="home-block-head">
          <div>
            <p className="home-kicker">Latest</p>
            <h2 className="home-block-title">最新动态</h2>
          </div>
          <ProtectedLink to="/moments" className="home-link-more">
            全部说说
            <ArrowRight className="w-4 h-4" />
          </ProtectedLink>
        </div>

        {loading && items.length === 0 ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="home-glass p-5 space-y-3">
                <Skeleton className="h-32 w-full rounded-lg bg-white/5" />
                <Skeleton className="h-5 w-2/3 bg-white/5" />
                <Skeleton className="h-4 w-full bg-white/5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="home-feed-list">
            {items.map((item) =>
              item.feedType === 'post' ? (
                <PostCard key={'post-' + item.id} item={item} />
              ) : (
                <MomentCard key={'moment-' + item.id} item={item} />
              )
            )}
          </div>
        )}

        {loading && items.length > 0 && <LoadingSpinner />}
        {hasMore && !loading && <div ref={lastRef} className="h-12" />}
      </section>
    </div>
  );
}

function PostCard({ item }: { item: FeedItem & { feedType: 'post' } }) {
  return (
    <ProtectedLink to={'/posts/' + item.slug} className="home-glass home-feed-item group">
      <div className="flex gap-5">
        {item.coverImage && (
          <div className="w-36 sm:w-44 shrink-0 aspect-[4/3] rounded-lg overflow-hidden bg-white/5">
            <img src={item.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          </div>
        )}
        <div className="min-w-0 flex-1 py-0.5">
          <span className="home-tag">攻略</span>
          <h3 className="text-lg font-medium text-gray-100 mt-2 group-hover:text-star-gold-bright transition-colors line-clamp-2">
            {item.title}
          </h3>
          {item.excerpt && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.excerpt}</p>}
          <FeedMeta author={item.author} createdAt={item.createdAt} counts={item._count} />
        </div>
      </div>
    </ProtectedLink>
  );
}

function MomentCard({ item }: { item: FeedItem & { feedType: 'moment' } }) {
  const images = parseImages(item.images);
  return (
    <ProtectedLink to={'/moments/' + item.id} className="home-glass home-feed-item group block">
      <FeedMeta author={item.author} createdAt={item.createdAt} counts={item._count} />
      <p className="mt-3 text-gray-200 whitespace-pre-wrap leading-relaxed line-clamp-6">{item.content}</p>
      {images.length > 0 && (
        <div className={'grid gap-2 mt-4 ' + (images.length === 1 ? 'grid-cols-1 max-w-sm' : 'grid-cols-3 max-w-md')}>
          {images.slice(0, 6).map((img, i) => (
            <img key={i} src={img} alt="" className="w-full aspect-square object-cover rounded-lg" loading="lazy" />
          ))}
        </div>
      )}
    </ProtectedLink>
  );
}

function FeedMeta({
  author,
  createdAt,
  counts,
}: {
  author: { nickname: string; avatar?: string | null };
  createdAt: string;
  counts?: { comments: number; likes: number };
}) {
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
      <div className="flex items-center gap-2">
        <Avatar src={author.avatar} name={author.nickname} size="sm" />
        <span className="text-sm text-gray-500">
          {author.nickname} · {formatTime(createdAt)}
        </span>
      </div>
      <div className="flex gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <Heart className="w-3.5 h-3.5" />
          {counts?.likes ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="w-3.5 h-3.5" />
          {counts?.comments ?? 0}
        </span>
      </div>
    </div>
  );
}
