import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useAuthGate } from '../contexts/AuthGateContext';
import { Avatar, formatTime } from './ui';
import { Heart, MessageCircle, Send } from 'lucide-react';
import type { Comment } from '../types';

interface Props {
  targetType: 'POST' | 'MOMENT';
  targetId: number;
}

export default function CommentSection({ targetType, targetId }: Props) {
  const { user } = useAuth();
  const { openAuth } = useAuthGate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const query = targetType === 'POST' ? `postId=${targetId}` : `momentId=${targetId}`;

  const loadComments = () => {
    api.get<Comment[]>(`/comments?${query}`).then(setComments).catch(() => setComments([]));
  };

  useEffect(() => {
    loadComments();
  }, [query, targetId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!user) {
      openAuth('登录后即可评论');
      return;
    }
    setLoading(true);
    try {
      const created = await api.post<Comment & { approved?: boolean }>('/comments', {
        content,
        targetType,
        ...(targetType === 'POST' ? { postId: targetId } : { momentId: targetId }),
        ...(replyTo != null ? { parentId: replyTo } : {}),
      });
      setContent('');
      setReplyTo(null);
      if (created.approved === false) {
        alert('评论已提交，等待审核通过后展示');
      }
      loadComments();
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

      {user ? (
        <form onSubmit={submit} className="card mb-6 space-y-3">
          {replyTo && (
            <p className="text-sm text-star-cyan">
              回复评论 #{replyTo}
              <button type="button" onClick={() => setReplyTo(null)} className="ml-2 text-gray-400 hover:text-white">
                取消
              </button>
            </p>
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的评论..."
            rows={3}
            className="input resize-none"
          />
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <Send className="w-4 h-4" /> 发送
          </button>
        </form>
      ) : (
        <div className="card mb-6 p-4 text-center text-gray-400 text-sm">
          <button type="button" onClick={() => openAuth('登录后即可评论')} className="text-star-cyan hover:underline">
            登录
          </button>
          {' '}后参与讨论
        </div>
      )}

      <div className="space-y-4">
        {comments.map((c) => (
          <CommentItem key={c.id} comment={c} onReply={user ? setReplyTo : () => openAuth('登录后即可回复')} />
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
          <button type="button" onClick={() => onReply(comment.id)} className="text-xs text-star-cyan mt-1 hover:underline">
            回复
          </button>
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
  const { user } = useAuth();
  const { openAuth } = useAuthGate();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const path = type === 'post' ? `/likes/post/${id}` : `/likes/moment/${id}`;
  const statusPath = `${path}/status`;

  useEffect(() => {
    api.get<{ liked: boolean; count: number }>(statusPath).then((res) => {
      setLiked(res.liked);
      setCount(res.count);
    }).catch(() => {});
  }, [statusPath, id]);

  const toggle = async () => {
    if (!user) {
      openAuth('登录后即可点赞');
      return;
    }
    try {
      const res = await api.post<{ liked: boolean; count: number }>(path);
      setLiked(res.liked);
      setCount(res.count);
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败');
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex items-center gap-1.5 text-sm ${liked ? 'text-star-pink' : 'text-gray-400 hover:text-star-pink'}`}
    >
      <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
      {liked ? '已赞' : '点赞'}
      {count > 0 && <span className="text-gray-500">({count})</span>}
    </button>
  );
}
