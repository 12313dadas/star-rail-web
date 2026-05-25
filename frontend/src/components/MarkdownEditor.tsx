import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bold, Italic, Link, Image as ImageIcon, List, Code, FileText, Heading } from 'lucide-react';
import { uploadFiles } from '../lib/api';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export default function MarkdownEditor({ value, onChange, className = '', placeholder }: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const textBefore = value.substring(0, start);
    const textAfter = value.substring(end);

    const newText = textBefore + before + selected + after + textAfter;
    onChange(newText);

    // Set cursor position after render
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    try {
      const urls = await uploadFiles(Array.from(e.target.files));
      urls.forEach(url => insertText(`![图片](${url})\n`));
    } catch (err) {
      alert('图片上传失败');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const toolbar = [
    { icon: <Heading className="w-4 h-4" />, action: () => insertText('### ', ''), title: '标题' },
    { icon: <Bold className="w-4 h-4" />, action: () => insertText('**', '**'), title: '加粗' },
    { icon: <Italic className="w-4 h-4" />, action: () => insertText('*', '*'), title: '斜体' },
    { icon: <Link className="w-4 h-4" />, action: () => insertText('[', '](url)'), title: '链接' },
    { icon: <Code className="w-4 h-4" />, action: () => insertText('```\n', '\n```'), title: '代码块' },
    { icon: <List className="w-4 h-4" />, action: () => insertText('- ', ''), title: '无序列表' },
  ];

  return (
    <div className={`flex flex-col border border-white/10 rounded-lg overflow-hidden bg-star-navy/50 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-1">
          {toolbar.map((btn, i) => (
            <button
              key={i}
              type="button"
              onClick={btn.action}
              className="p-1.5 hover:bg-white/10 rounded text-gray-300 transition-colors"
              title={btn.title}
            >
              {btn.icon}
            </button>
          ))}
          
          <label className="p-1.5 hover:bg-white/10 rounded text-gray-300 cursor-pointer transition-colors" title="插入图片">
            <ImageIcon className="w-4 h-4" />
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              className="hidden" 
              onChange={handleImageUpload} 
              disabled={isUploading} 
            />
          </label>
          {isUploading && <span className="text-xs text-star-cyan ml-2 animate-pulse">上传中...</span>}
        </div>

        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-star-purple hover:bg-star-purple/80 rounded transition-colors"
        >
          <FileText className="w-4 h-4" />
          {isPreview ? '返回编辑' : '预览效果'}
        </button>
      </div>

      {/* Editor / Preview Area */}
      <div className="flex-1 min-h-[300px] relative">
        {isPreview ? (
          <div className="absolute inset-0 overflow-y-auto p-4 article-content bg-star-dark/50">
            {value ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            ) : (
              <p className="text-gray-500 italic">暂无内容预览</p>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full min-h-[300px] p-4 bg-transparent resize-y focus:outline-none focus:ring-1 focus:ring-star-purple transition-shadow"
            placeholder={placeholder || '支持 Markdown 语法...'}
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}
