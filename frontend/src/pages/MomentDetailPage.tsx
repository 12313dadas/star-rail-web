import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Avatar, formatTime, LoadingSpinner } from '../components/ui';
import CommentSection, { LikeButton } from '../components/CommentSection';
import type { Moment } from '../types';
import { parseImages } from '../lib/images';

export default function MomentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [moment, setMoment] = useState<Moment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get<Moment>(`/moments/${id}`).then(setMoment).catch(() => setMoment(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!moment) return <p className="text-center text-gray-400 py-12">说说不存在</p>;

  const images = parseImages(moment.images);

  return (
    <article className="max-w-2xl mx-auto card">
      <div className="flex items-center gap-3 mb-4">
        <Avatar src={moment.author.avatar} name={moment.author.nickname} />
        <div>
          <p className="font-medium">{moment.author.nickname}</p>
          <p className="text-sm text-gray-400">{formatTime(moment.createdAt)}</p>
        </div>
      </div>
      <p className="text-lg whitespace-pre-wrap mb-4">{moment.content}</p>
      {images.length > 0 && (
        <div className={`grid gap-2 mb-4 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {images.map((img, i) => (
            <img key={i} src={img} alt="" className="w-full rounded-lg" loading="lazy" />
          ))}
        </div>
      )}
      {moment.musicUrl && (
        <audio controls src={moment.musicUrl} className="w-full mb-4" />
      )}
      <LikeButton type="moment" id={moment.id} />
      <CommentSection targetType="MOMENT" targetId={moment.id} />
    </article>
  );
}
