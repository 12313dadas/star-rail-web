import React, { useState } from 'react';
import { api, uploadFiles } from '../lib/api';
import { Moment } from '../types';
import { X, Image as ImageIcon, Music } from 'lucide-react';

interface MomentEditorModalProps {
  moment?: Moment | null;
  onClose: () => void;
  onSave: () => void;
}

export default function MomentEditorModal({ moment, onClose, onSave }: MomentEditorModalProps) {
  const [content, setContent] = useState(moment?.content || '');
  const [images, setImages] = useState<string[]>(moment?.images ? JSON.parse(moment.images) : []);
  const [musicTitle, setMusicTitle] = useState(moment?.musicTitle || '');
  const [musicUrl, setMusicUrl] = useState(moment?.musicUrl || '');
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    try {
      const urls = await uploadFiles(Array.from(e.target.files));
      setImages(prev => [...prev, ...urls].slice(0, 9)); // Max 9 images
    } catch (err) {
      alert('图片上传失败');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return alert('内容不能为空');
    
    setLoading(true);
    try {
      const data = {
        content,
        images: images.length > 0 ? JSON.stringify(images) : null,
        musicTitle: musicTitle || null,
        musicUrl: musicUrl || null,
      };

      if (moment) {
        await api.put(`/moments/${moment.id}`, data);
      } else {
        await api.post('/moments', data);
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
      <div className="bg-star-dark border border-white/10 w-full max-w-2xl rounded-xl flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-star-cyan">{moment ? '编辑说说' : '发布说说'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <textarea 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 min-h-[120px] focus:outline-none focus:border-star-cyan transition-colors resize-y" 
              placeholder="分享此刻的想法..." 
              required 
            />
          </div>

          {/* Image Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square group">
                  <img src={img} className="w-full h-full object-cover rounded-lg border border-white/10" />
                  <button 
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 bg-black/60 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tools */}
          <div className="flex items-center gap-4 text-sm">
            <label className={`flex items-center gap-1 cursor-pointer transition-colors ${images.length >= 9 ? 'opacity-50 pointer-events-none' : 'hover:text-star-cyan text-gray-400'}`}>
              <ImageIcon className="w-4 h-4" />
              <span>{uploading ? '上传中...' : `添加图片 (${images.length}/9)`}</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading || images.length >= 9} />
            </label>
          </div>

          {/* Music */}
          <div className="bg-white/5 p-3 rounded-lg border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-star-purple text-sm mb-2">
              <Music className="w-4 h-4" /> <span>附加音乐 (可选)</span>
            </div>
            <input value={musicTitle} onChange={e => setMusicTitle(e.target.value)} className="input py-1.5 text-sm" placeholder="歌曲名" />
            <input value={musicUrl} onChange={e => setMusicUrl(e.target.value)} className="input py-1.5 text-sm" placeholder="音乐链接 (如 https://...mp3)" />
          </div>
        </div>

        <div className="p-4 border-t border-white/10 flex justify-end gap-3">
          <button onClick={onClose} className="btn-ghost" disabled={loading}>取消</button>
          <button onClick={handleSubmit} className="btn-primary" disabled={loading}>
            {loading ? '发送中...' : '发送说说'}
          </button>
        </div>
      </div>
    </div>
  );
}
