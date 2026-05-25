import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Users, Search, Sparkles, Video, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/PageHeader';
import SquadBuilderModal from '../components/squads/SquadBuilderModal';
import SquadDetailModal from '../components/squads/SquadDetailModal';
import CharacterPortrait from '../components/squads/CharacterPortrait';
import { useAuth } from '../contexts/AuthContext';
import type { Squad, Paginated } from '../types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function SquadsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [query, setQuery] = useState('');
  const [showBuilder, setShowBuilder] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const loadSquads = useCallback(async (p: number, q: string, reset: boolean) => {
    try {
      const params = new URLSearchParams({ page: String(p), limit: '12' });
      if (q.trim()) params.set('q', q.trim());
      const data = await api.get<Paginated<Squad>>(`/squads?${params}`);
      setSquads((prev) => (reset ? data.items : [...prev, ...data.items]));
      setHasMore(data.hasMore);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    loadSquads(1, query, true);
  }, [query, loadSquads]);

  useEffect(() => {
    if (page > 1) loadSquads(page, query, false);
  }, [page, query, loadSquads]);

  useEffect(() => {
    const id = searchParams.get('squad');
    if (id) setDetailId(Number(id));
  }, [searchParams]);

  const openDetail = (id: number) => {
    setDetailId(id);
    setSearchParams({ squad: String(id) });
  };

  const closeDetail = () => {
    setDetailId(null);
    setSearchParams({});
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <PageHeader
        title="阵容广场"
        subtitle="参考星穹铁道官方编队体验 · 搭配四人小队并上传实战录像"
        icon={<Users className="w-8 h-8" />}
        action={
          user ? (
            <button type="button" onClick={() => setShowBuilder(true)} className="btn-primary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              发布阵容
            </button>
          ) : undefined
        }
      />

      {/* 功能亮点 */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Sparkles, title: '全角色立绘', desc: '收录主流五星/四星，告别空卡片' },
          { icon: Users, title: '拖拽编队', desc: '像游戏内一样排兵布阵' },
          { icon: Video, title: '战斗录像', desc: '配队后可上传忘却之庭等实战视频' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card flex gap-3 items-start border-star-purple/15">
            <div className="p-2 rounded-lg bg-star-purple/20 text-star-cyan">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-sm text-white">{title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card mb-8 flex flex-col sm:flex-row gap-3 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input pl-10"
            placeholder="搜索阵容名、标签、玩法场景…"
          />
        </div>
        {!user && (
          <p className="text-xs text-gray-500 self-center">登录后可发布阵容与上传录像</p>
        )}
      </div>

      {loading && page === 1 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-72 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
          ))}
        </div>
      ) : squads.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>暂无阵容，成为第一个分享配队的开拓者吧</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {squads.map((squad) => (
            <SquadCard key={squad.id} squad={squad} onOpen={() => openDetail(squad.id)} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-10 text-center">
          <button type="button" onClick={() => setPage((p) => p + 1)} className="btn-ghost px-8">
            加载更多
          </button>
        </div>
      )}

      {showBuilder && (
        <SquadBuilderModal
          onClose={() => setShowBuilder(false)}
          onSuccess={() => {
            setShowBuilder(false);
            setPage(1);
            setLoading(true);
            loadSquads(1, query, true);
          }}
        />
      )}

      {detailId != null && !Number.isNaN(detailId) && (
        <SquadDetailModal squadId={detailId} onClose={closeDetail} />
      )}
    </div>
  );
}

function SquadCard({ squad, onOpen }: { squad: Squad; onOpen: () => void }) {
  const chars = [squad.char1, squad.char2, squad.char3, squad.char4];
  const hasVideo = Boolean(squad.videoUrl);

  return (
    <article
      className="group panel-star overflow-hidden border-white/10 hover:border-star-gold/30 hover:shadow-gold-glow transition-all cursor-pointer"
      onClick={onOpen}
    >
      <div className="p-4 border-b border-white/10 flex justify-between gap-2">
        <div className="min-w-0">
          {squad.scenario && (
            <span className="text-[10px] text-star-cyan tracking-wider uppercase">{squad.scenario}</span>
          )}
          <h3 className="text-lg font-bold text-white group-hover:text-star-gold truncate transition-colors">
            {squad.name}
          </h3>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-star-gold shrink-0 mt-1" />
      </div>

      <div className="p-3 grid grid-cols-4 gap-2">
        {chars.map((c) => (
          <CharacterPortrait key={c.id} character={c} size="sm" showMeta={false} />
        ))}
      </div>

      <div className="px-4 pb-4 flex items-center justify-between text-xs text-gray-500">
        <span className="truncate">{squad.author.nickname}</span>
        <div className="flex items-center gap-3 shrink-0">
          {hasVideo && (
            <span className="flex items-center gap-1 text-star-cyan">
              <Video className="w-3.5 h-3.5" /> 录像
            </span>
          )}
          <span>{format(new Date(squad.createdAt), 'MM-dd', { locale: zhCN })}</span>
        </div>
      </div>
    </article>
  );
}
