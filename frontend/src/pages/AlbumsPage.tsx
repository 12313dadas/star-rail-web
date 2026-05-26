import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { Plus, Upload, X } from 'lucide-react';
import { api, uploadFiles } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner, EmptyState } from '../components/ui';
import type { Album } from '../types';

export default function AlbumsPage() {
  const { user } = useAuth();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  const load = () => {
    api.get<Album[]>('/albums').then(setAlbums).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const createAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      let coverImage: string | null = null;
      if (coverFile) {
        const [url] = await uploadFiles([coverFile]);
        coverImage = url;
      }
      await api.post('/albums', { title: title.trim(), description: description.trim() || undefined, coverImage });
      setShowCreate(false);
      setTitle('');
      setDescription('');
      setCoverFile(null);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : '创建失败');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">相册</h1>
        {user && (
          <button type="button" onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> 新建相册
          </button>
        )}
      </div>

      {albums.length === 0 ? (
        <EmptyState message={user ? '暂无相册，点击上方新建' : '暂无相册'} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <Link key={album.id} to={`/albums/${album.id}`} className="card hover:border-star-purple/30 transition-colors block">
              {album.coverImage ? (
                <img src={album.coverImage} alt="" className="w-full h-48 object-cover rounded-lg mb-3" loading="lazy" />
              ) : (
                <div className="w-full h-48 bg-white/5 rounded-lg mb-3 flex items-center justify-center text-gray-500">
                  {album._count?.photos ?? 0} 张
                </div>
              )}
              <h2 className="font-semibold">{album.title}</h2>
              {album.description && <p className="text-sm text-gray-400 mt-1 line-clamp-2">{album.description}</p>}
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setShowCreate(false)}>
          <form
            className="panel-star w-full max-w-md p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
            onSubmit={createAlbum}
          >
            <div className="flex justify-between items-center">
              <h2 className="font-display text-lg text-gradient-gold">新建相册</h2>
              <button type="button" onClick={() => setShowCreate(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="相册标题" required />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input h-24 resize-none"
              placeholder="描述（可选）"
            />
            <label className="flex flex-col items-center gap-2 py-4 border border-dashed border-white/20 rounded-xl cursor-pointer hover:border-star-gold/40">
              <Upload className="w-6 h-6 text-star-gold" />
              <span className="text-xs text-gray-400">{coverFile ? coverFile.name : '封面图（可选）'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} />
            </label>
            <button type="submit" disabled={creating} className="btn-primary w-full">
              {creating ? '创建中…' : '创建相册'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [album, setAlbum] = useState<Album | null>(null);
  const [lightbox, setLightbox] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    if (!id) return;
    api.get<Album>(`/albums/${id}`).then(setAlbum).finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [id]);

  const canEdit = user && album && (album.author.id === user.id || user.role === 'ADMIN');

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length || !id) return;
    setUploading(true);
    try {
      const urls = await uploadFiles(Array.from(files));
      await api.post(`/albums/${id}/photos`, {
        photos: urls.map((url, i) => ({ url, sortOrder: i })),
      });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!album) return <EmptyState message="相册不存在" />;

  const slides = (album.photos || []).map((p) => ({ src: p.url, title: p.caption || undefined }));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">{album.title}</h1>
          {album.description && <p className="text-gray-400">{album.description}</p>}
        </div>
        {canEdit && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => addPhotos(e.target.files)}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="btn-primary flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {uploading ? '上传中…' : '添加照片'}
            </button>
          </>
        )}
      </div>

      {(album.photos || []).length === 0 ? (
        <EmptyState message={canEdit ? '相册为空，点击添加照片' : '相册暂无照片'} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {(album.photos || []).map((photo, i) => (
            <button key={photo.id} type="button" onClick={() => setLightbox(i)} className="aspect-square overflow-hidden rounded-lg">
              <img src={photo.url} alt={photo.caption || ''} className="w-full h-full object-cover hover:scale-105 transition-transform" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      <Lightbox open={lightbox >= 0} close={() => setLightbox(-1)} index={lightbox} slides={slides} />
    </div>
  );
}
