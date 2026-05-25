import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, formatTime } from './ui';
import { Heart, MessageCircle, Send } from 'lucide-react';
import type { Comment } from '../types';

interface Props {
  targetType: 'POST' | 'MOMENT';
  targetId: number;
}

export default function CommentSection({ targetType, targetId }: Props) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [guestName, setGuestName] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const query = targetType === 'POST' ? `postId=${targetId}` : `momentId=${targetId}`;

  useEffect(() => {
    api.get<Comment[]>(`/comments?${query}`).then(setComments).catch(() => {});
  }, [query, targetId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      await api.post('/comments', {
        content,
        targetType,
        ...(targetType === 'POST' ? { postId: targetId } : { momentId: targetId }),
        ...(replyTo != null ? { parentId: replyTo } : {}),
        ...(!user && guestName.trim() ? { guestName: guestName.trim() } : {}),
      });
      setContent('');
      setReplyTo(null);
      const updated = await api.get<Comment[]>(`/comments?${query}`);
      setComments(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : '评论失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-8">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-star-cyan" /> 评论 ({comments.length})
      </h3>

      <form onSubmit={submit} className="card mb-6 space-y-3">
        {replyTo && (
          <p className="text-sm text-star-cyan">
            回复评论 #{replyTo}
            <button type="button" onClick={() => setReplyTo(null)} className="ml-2 text-gray-400 hover:text-white">取消</button>
          </p>
        )}
        {!user && (
          <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="昵称（访客）" className="input" />
        )}
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="写下你的评论..." rows={3} className="input resize-none" />
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          <Send className="w-4 h-4" /> 发送
        </button>
      </form>

      <div className="space-y-4">
        {comments.map((c) => (
          <CommentItem key={c.id} comment={c} onReply={setReplyTo} />
        ))}
      </div>
    </section>
  );
}

function CommentItem({ comment, onReply }: { comment: Comment; onReply: (id: number) => void }) {
  const name = comment.author?.nickname || comment.guestName || '访客';
  return (
    <div className="card">
      <div className="flex gap-3">
        <Avatar src={comment.author?.avatar} name={name} size="sm" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{name}</span>
            <span className="text-xs text-gray-500">{formatTime(comment.createdAt)}</span>
          </div>
          <p className="text-gray-300 text-sm">{comment.content}</p>
          <button onClick={() => onReply(comment.id)} className="text-xs text-star-cyan mt-1 hover:underline">回复</button>
          {comment.replies?.map((r) => (
            <div key={r.id} className="mt-3 pl-4 border-l border-white/10">
              <span className="text-sm font-medium">{r.author?.nickname || r.guestName || '访客'}</span>
              <span className="text-xs text-gray-500 ml-2">{formatTime(r.createdAt)}</span>
              <p className="text-gray-300 text-sm mt-1">{r.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LikeButton({ type, id }: { type: 'post' | 'moment'; id: number }) {
  const [liked, setLiked] = useState(false);
  const path = type === 'post' ? `/likes/post/${id}` : `/likes/moment/${id}`;

  const toggle = async () => {
    try {
      const res = await api.post<{ liked: boolean }>(path);
      setLiked(res.liked);
    } catch { /* ignore */ }
  };

  return (
    <button onClick={toggle} className={`flex items-center gap-1 text-sm ${liked ? 'text-star-pink' : 'text-gray-400 hover:text-star-pink'}`}>
      <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} /> 点赞
    </button>
  );
}
