import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../lib/api';
import { Avatar, formatTime, LoadingSpinner } from '../components/ui';
import CommentSection, { LikeButton } from '../components/CommentSection';
import type { Post } from '../types';

export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    api.get<Post>(`/posts/${slug}`).then(setPost).catch(() => setPost(null)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingSpinner />;
  if (!post) return <p className="text-center text-gray-400 py-12">文章不存在</p>;

  const isHtml = post.content?.trim().startsWith('<');

  return (
    <article className="max-w-3xl mx-auto">
      {post.coverImage && <img src={post.coverImage} alt="" className="w-full h-64 object-cover rounded-xl mb-6" />}
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <div className="flex items-center gap-3 text-gray-400 text-sm mb-8">
        <Avatar src={post.author.avatar} name={post.author.nickname} />
        <span>{post.author.nickname}</span>
        <span>{formatTime(post.createdAt)}</span>
        {post.category && <span className="text-star-gold">{post.category.name}</span>}
      </div>

      <div className="article-content">
        {isHtml ? (
          <div dangerouslySetInnerHTML={{ __html: post.content || '' }} />
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content || ''}</ReactMarkdown>
        )}
      </div>

      <div className="mt-6 flex gap-4">
        <LikeButton type="post" id={post.id} />
      </div>

      <CommentSection targetType="POST" targetId={post.id} />
    </article>
  );
}
