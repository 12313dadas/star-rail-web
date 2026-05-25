import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import MarkdownEditor from './MarkdownEditor';
import { Post } from '../types';
import { X } from 'lucide-react';

interface PostEditorModalProps {
  post?: Post | null;
  onClose: () => void;
  onSave: () => void;
}

export default function PostEditorModal({ post, onClose, onSave }: PostEditorModalProps) {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [coverImage, setCoverImage] = useState(post?.coverImage || '');
  const [type, setType] = useState<'ARTICLE' | 'ANNOUNCEMENT'>(post?.type === 'ANNOUNCEMENT' ? 'ANNOUNCEMENT' : 'ARTICLE');
  const [published, setPublished] = useState(post?.published ?? false);
  const [categoryId, setCategoryId] = useState<number | ''>(post?.category?.id || '');
  
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<{id: number, name: string}[]>('/posts/meta/categories').then(setCategories);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return alert('标题和内容为必填项');
    
    setLoading(true);
    try {
      const data = {
        title, content, excerpt, coverImage, type, published,
        categoryId: categoryId || null
      };

      if (post) {
        await api.put(`/posts/${post.id}`, data);
      } else {
        await api.post('/posts', data);
      }
      onSave();
    } catch (err: any) {
      alert(err.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-star-dark border border-white/10 w-full max-w-5xl max-h-[90vh] rounded-xl flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-star-gold">{post ? '编辑文章' : '新建文章'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">标题 *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="输入文章标题..." required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">封面图 URL</label>
              <input value={coverImage} onChange={e => setCoverImage(e.target.value)} className="input" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">类型</label>
              <select value={type} onChange={e => setType(e.target.value as any)} className="input">
                <option value="ARTICLE">攻略文章</option>
                <option value="ANNOUNCEMENT">公告</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">分类</label>
              <select value={categoryId} onChange={e => setCategoryId(Number(e.target.value) || '')} className="input">
                <option value="">(无分类)</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">摘要</label>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} className="input h-20 resize-none" placeholder="文章摘要..." />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">正文 (Markdown) *</label>
            <MarkdownEditor value={content} onChange={setContent} className="min-h-[400px]" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} className="w-4 h-4 rounded bg-star-dark border-white/20 text-star-purple focus:ring-star-purple focus:ring-offset-star-dark" />
            <span>发布文章 (否则为草稿)</span>
          </label>
        </div>

        <div className="p-4 border-t border-white/10 flex justify-end gap-3">
          <button onClick={onClose} className="btn-ghost" disabled={loading}>取消</button>
          <button onClick={handleSubmit} className="btn-primary" disabled={loading}>
            {loading ? '保存中...' : '保存文章'}
          </button>
        </div>
      </div>
    </div>
  );
}
