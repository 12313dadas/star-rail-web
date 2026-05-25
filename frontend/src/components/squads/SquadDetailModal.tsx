import { useEffect, useState } from 'react';
import { X, Eye, Star, Video, Tag, Swords, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { api } from '../../lib/api';
import CharacterPortrait from './CharacterPortrait';
import type { Squad } from '../../types';

interface Props {
  squadId: number;
  onClose: () => void;
}

export default function SquadDetailModal({ squadId, onClose }: Props) {
  const [squad, setSquad] = useState<Squad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Squad>(`/squads/${squadId}`)
      .then(setSquad)
      .catch(() => alert('加载失败'))
      .finally(() => setLoading(false));
  }, [squadId]);

  const chars = squad ? [squad.char1, squad.char2, squad.char3, squad.char4] : [];
  const tagList = squad?.tags?.split(/[,，]/).map((t) => t.trim()).filter(Boolean) ?? [];

  const share = () => {
    const url = `${window.location.origin}/squads?squad=${squadId}`;
    navigator.clipboard.writeText(url).then(() => alert('链接已复制'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/88 backdrop-blur-md" onClick={onClose}>
      <div
        className="panel-star w-full max-w-4xl max-h-[90vh] overflow-y-auto border-star-gold/25"
        onClick={(e) => e.stopPropagation()}
      >
        {loading || !squad ? (
          <div className="p-16 text-center text-gray-500">加载阵容数据…</div>
        ) : (
          <>
            <div className="relative p-6 pb-4 border-b border-white/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-star-purple/20 via-transparent to-star-gold/10 pointer-events-none" />
              <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 z-10">
                <X className="w-5 h-5" />
              </button>
              <div className="relative z-[1]">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {squad.scenario && (
                    <span className="text-xs px-2 py-1 rounded-full bg-star-purple/30 text-star-cyan border border-star-purple/30">
                      <Swords className="w-3 h-3 inline mr-1" />
                      {squad.scenario}
                    </span>
                  )}
                  {tagList.map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-400">
                      <Tag className="w-3 h-3 inline mr-0.5" />
                      {t}
                    </span>
                  ))}
                </div>
                <h2 className="text-2xl md:text-3xl font-display text-gradient-gold tracking-wide">{squad.name}</h2>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400">
                  <span className="flex items-center gap-2">
                    <img src={squad.author.avatar || '/favicon.svg'} className="w-6 h-6 rounded-full" alt="" />
                    {squad.author.nickname}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" /> {squad.viewCount}
                  </span>
                  <span className="flex items-center gap-1 text-star-gold">
                    <Star className="w-4 h-4 fill-star-gold" />
                    {squad.score > 0 ? squad.score.toFixed(1) : '新阵容'}
                  </span>
                  <span>{format(new Date(squad.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}</span>
                  <button type="button" onClick={share} className="text-star-cyan hover:text-star-gold flex items-center gap-1">
                    <Share2 className="w-4 h-4" /> 分享
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {chars.map((c) => (
                <CharacterPortrait key={c.id} character={c} size="lg" />
              ))}
            </div>

            {squad.description && (
              <div className="px-6 pb-4">
                <h3 className="text-sm text-star-cyan mb-2 tracking-widest">配队说明</h3>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{squad.description}</p>
              </div>
            )}

            {squad.videoUrl && (
              <div className="px-6 pb-6">
                <h3 className="text-sm text-star-cyan mb-3 flex items-center gap-2 tracking-widest">
                  <Video className="w-4 h-4" />
                  {squad.videoTitle || '实战录像'}
                </h3>
                <div className="rounded-xl overflow-hidden border border-white/10 bg-black aspect-video">
                  <video src={squad.videoUrl} controls className="w-full h-full" preload="metadata">
                    您的浏览器不支持视频播放
                  </video>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
