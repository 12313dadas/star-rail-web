import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, formatTime, LoadingSpinner, EmptyState, Skeleton } from '../components/ui';
import { uploadFiles } from '../lib/api';
import { ImagePlus, Send } from 'lucide-react';
import type { Moment } from '../types';
import { parseImages } from '../lib/images';

export default function MomentsPage() {
  const { user } = useAuth();
  const [moments, setMoments] = useState<Moment[]>([]);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api.get<{ items: Moment[] }>('/moments').then((d) => setMoments(d.items)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 9 - images.length);
    if (!files.length) return;
    const urls = await uploadFiles(files);
    setImages((prev) => [...prev, ...urls].slice(0, 9));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    setSubmitting(true);
    try {
      await api.post('/moments', { content, images });
      setContent('');
      setImages([]);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : '发布失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">说说</h1>

      {user && (
        <form onSubmit={submit} className="card mb-8 space-y-4">
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="分享此刻..." rows={4} className="input resize-none" />
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, i) => (
                <img key={i} src={img} alt="" className="aspect-square object-cover rounded-lg" />
              ))}
            </div>
          )}
          <div className="flex justify-between items-center">
            <label className="btn-ghost cursor-pointer flex items-center gap-2">
              <ImagePlus className="w-5 h-5" />
              图片 ({images.length}/9)
              <input type="file" accept="image/*" multiple hidden onChange={handleImages} />
            </label>
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
              <Send className="w-4 h-4" /> 发布
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="grid grid-cols-3 gap-1">
                <Skeleton className="aspect-square w-full rounded" />
                <Skeleton className="aspect-square w-full rounded" />
                <Skeleton className="aspect-square w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : moments.length === 0 ? (
        <EmptyState message="还没有说说，来发第一条吧" />
      ) : (
        <div className="space-y-4">
          {moments.map((m) => (
            <Link key={m.id} to={`/moments/${m.id}`} className="card block hover:border-star-cyan/30">
              <div className="flex items-center gap-2 mb-3">
                <Avatar src={m.author.avatar} name={m.author.nickname} size="sm" />
                <span className="text-sm text-gray-400">{m.author.nickname} · {formatTime(m.createdAt)}</span>
              </div>
              <p className="whitespace-pre-wrap">{m.content}</p>
              {parseImages(m.images).length > 0 && (
                <div className="grid grid-cols-3 gap-1 mt-3">
                  {parseImages(m.images).map((img, i) => (
                    <img key={i} src={img} alt="" className="aspect-square object-cover rounded" loading="lazy" />
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
