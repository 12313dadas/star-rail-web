import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { api } from '../lib/api';
import { LoadingSpinner, EmptyState } from '../components/ui';
import type { Album } from '../types';

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Album[]>('/albums').then(setAlbums).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">相册</h1>
      {albums.length === 0 ? (
        <EmptyState message="暂无相册" />
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
    </div>
  );
}

export function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [lightbox, setLightbox] = useState(-1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get<Album>(`/albums/${id}`).then(setAlbum).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!album) return <EmptyState message="相册不存在" />;

  const slides = (album.photos || []).map((p) => ({ src: p.url, title: p.caption || undefined }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{album.title}</h1>
      {album.description && <p className="text-gray-400 mb-6">{album.description}</p>}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {(album.photos || []).map((photo, i) => (
          <button key={photo.id} onClick={() => setLightbox(i)} className="aspect-square overflow-hidden rounded-lg">
            <img src={photo.url} alt={photo.caption || ''} className="w-full h-full object-cover hover:scale-105 transition-transform" loading="lazy" />
          </button>
        ))}
      </div>
      <Lightbox open={lightbox >= 0} close={() => setLightbox(-1)} index={lightbox} slides={slides} />
    </div>
  );
}
