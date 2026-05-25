import { useState, useEffect } from 'react';
import { Plus, Users, Search, Filter, Share2, Star, Eye, X, Info } from 'lucide-react';
import { api } from '../lib/api';
import type { Squad, Character, Paginated } from '../types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useAuth } from '../contexts/AuthContext';

export default function SquadsPage() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadSquads();
  }, [page]);

  const loadSquads = async () => {
    try {
      const data = await api.get<Paginated<Squad>>(`/squads?page=${page}&limit=12`);
      if (page === 1) setSquads(data.items);
      else setSquads(prev => [...prev, ...data.items]);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error('Failed to load squads:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-wider flex items-center gap-3">
            <Users className="w-8 h-8 text-star-purple" />
            阵容广场
          </h1>
          <p className="text-gray-400">分享你的跃迁编队，交流战斗心得</p>
        </div>
        <button 
          onClick={() => setShowBuilder(true)}
          className="btn-primary flex items-center gap-2 px-6 py-3 text-lg group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          发布阵容
        </button>
      </div>

      {/* Filters (Placeholder) */}
      <div className="flex items-center gap-4 mb-8 bg-white/5 p-4 rounded-xl border border-white/10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input className="input pl-10 py-2" placeholder="搜索阵容名称..." />
        </div>
        <button className="btn-ghost flex items-center gap-2">
          <Filter className="w-4 h-4" />
          筛选
        </button>
      </div>

      {/* Squad Grid */}
      {loading && page === 1 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-2xl h-64 animate-pulse border border-white/10" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {squads.map(squad => (
            <SquadCard key={squad.id} squad={squad} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-12 text-center">
          <button onClick={() => setPage(p => p + 1)} className="btn-ghost px-8 py-3">
            加载更多
          </button>
        </div>
      )}

      {showBuilder && (
        <TeamBuilderModal 
          onClose={() => setShowBuilder(false)} 
          onSuccess={() => {
            setShowBuilder(false);
            setPage(1);
            loadSquads();
          }} 
        />
      )}
    </div>
  );
}

function TeamBuilderModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [search, setSearch] = useState('');
  const [team, setTeam] = useState<(Character | null)[]>([null, null, null, null]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<Character[]>('/squads/characters').then(setCharacters);
  }, []);

  const filteredCharacters = characters.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.element.includes(search) ||
    c.path.includes(search)
  );

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === 'characters' && destination.droppableId.startsWith('slot-')) {
      const slotIndex = parseInt(destination.droppableId.split('-')[1]);
      const char = filteredCharacters[source.index];
      
      // Check if already in team
      if (team.some(t => t?.id === char.id)) return;

      const newTeam = [...team];
      newTeam[slotIndex] = char;
      setTeam(newTeam);
    }
  };

  const handleRemove = (index: number) => {
    const newTeam = [...team];
    newTeam[index] = null;
    setTeam(newTeam);
  };

  const handleSubmit = async () => {
    if (!name || team.some(t => t === null)) {
      alert('请填写阵容名称并选满4名角色');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/squads', {
        name,
        description,
        char1Id: team[0]!.id,
        char2Id: team[1]!.id,
        char3Id: team[2]!.id,
        char4Id: team[3]!.id,
      });
      onSuccess();
    } catch (err) {
      console.error('Failed to save squad:', err);
      alert('发布失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-star-navy border border-white/10 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Plus className="w-6 h-6 text-star-purple" />
            发布新阵容
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <DragDropContext onDragEnd={onDragEnd}>
            {/* Team Slots */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {team.map((char, i) => (
                <Droppable key={`slot-${i}`} droppableId={`slot-${i}`}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center relative transition-all ${
                        snapshot.isDraggingOver ? 'border-star-purple bg-star-purple/10' : 'border-white/10 bg-white/5'
                      }`}
                    >
                      {char ? (
                        <div className="w-full h-full flex flex-col">
                          <div className="flex-1 relative overflow-hidden rounded-t-2xl">
                            {char.icon ? (
                              <img src={char.icon} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-star-purple/20">
                                <Users className="w-12 h-12 text-star-purple" />
                              </div>
                            )}
                            <button 
                              onClick={() => handleRemove(i)}
                              className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-red-500 transition-colors"
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                          </div>
                          <div className="p-3 bg-white/5 text-center">
                            <p className={`font-bold ${char.rarity === 5 ? 'text-star-gold' : 'text-star-purple'}`}>
                              {char.name}
                            </p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{char.path} · {char.element}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <Plus className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">拖拽角色到此</p>
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">阵容名称</label>
                  <input 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="input py-2" 
                    placeholder="例如：量子纯色队" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">心得体会</label>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="input py-2 h-32 resize-none" 
                    placeholder="分享你的输出手法、配速建议等..." 
                  />
                </div>
                <div className="bg-star-purple/10 border border-star-purple/20 p-4 rounded-xl flex gap-3">
                  <Info className="w-5 h-5 text-star-purple shrink-0" />
                  <p className="text-xs text-gray-400 leading-relaxed">
                    编队小技巧：尝试将具有协同能力的攻击手与辅助搭配在一起。
                  </p>
                </div>
              </div>

              {/* Character List */}
              <div className="lg:col-span-2 flex flex-col bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="input pl-10 py-1.5 text-sm" 
                      placeholder="搜索角色、属性、命途..." 
                    />
                  </div>
                </div>
                <Droppable droppableId="characters" isDropDisabled={true}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 overflow-y-auto max-h-[300px]"
                    >
                      {filteredCharacters.map((char, index) => (
                        <Draggable key={char.id} draggableId={`char-${char.id}`} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`aspect-[3/4] rounded-lg border overflow-hidden relative group cursor-grab active:cursor-grabbing transition-all ${
                                snapshot.isDragging ? 'border-star-purple ring-2 ring-star-purple/50' : 'border-white/5'
                              } ${team.some(t => t?.id === char.id) ? 'opacity-30 grayscale' : 'hover:border-white/20'}`}
                            >
                              {char.icon ? (
                                <img src={char.icon} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white/5">
                                  <span className="text-[10px] text-center px-1 font-bold">{char.name}</span>
                                </div>
                              )}
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1 text-[8px] text-center font-bold">
                                {char.name}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          </DragDropContext>
        </div>

        <div className="p-6 border-t border-white/10 flex justify-end gap-4 bg-white/5">
          <button onClick={onClose} className="btn-ghost px-6">取消</button>
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary px-10 py-2.5 flex items-center gap-2"
          >
            {submitting ? '发布中...' : '立即发布'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SquadCard({ squad }: { squad: Squad }) {
  const characters = [squad.char1, squad.char2, squad.char3, squad.char4];

  return (
    <div className="bg-star-navy/80 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-star-purple/50 transition-all hover:shadow-2xl hover:shadow-star-purple/10 group">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white group-hover:text-star-purple transition-colors truncate flex-1">
            {squad.name}
          </h3>
          <div className="flex items-center gap-1 text-star-gold text-sm font-medium bg-star-gold/10 px-2 py-0.5 rounded">
            <Star className="w-3 h-3 fill-star-gold" />
            {squad.score > 0 ? squad.score.toFixed(1) : '新'}
          </div>
        </div>

        {/* Characters display */}
        <div className="flex items-center justify-between gap-2 mb-6">
          {characters.map((char, i) => (
            <div key={i} className="flex-1 aspect-[3/4] bg-white/5 rounded-lg border border-white/5 overflow-hidden relative group/char">
              {char?.icon ? (
                <img src={char.icon} alt={char.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-star-purple/5">
                  <span className={`text-[10px] font-bold ${char?.rarity === 5 ? 'text-star-gold' : 'text-star-purple'}`}>
                    {char?.name}
                  </span>
                  <div className="text-[8px] text-gray-500 mt-1 truncate w-full">{char?.path}</div>
                </div>
              )}
              {/* Element Indicator */}
              {char && (
                <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-black/40 flex items-center justify-center text-[8px] text-white">
                  {char.element[0]}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <img src={squad.author.avatar || '/favicon.svg'} className="w-5 h-5 rounded-full" />
            <span>{squad.author.nickname}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {squad.viewCount}
            </span>
            <span>{format(new Date(squad.createdAt), 'MM-dd', { locale: zhCN })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
