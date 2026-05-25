import { useState, useEffect } from 'react';
import { Plus, Search, X, Upload, Video, Loader2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { api } from '../../lib/api';
import { uploadBattleVideo } from '../../lib/uploadVideo';
import { SCENARIOS, REGIONS } from '../../lib/hsrTheme';
import CharacterPortrait from './CharacterPortrait';
import type { Character } from '../../types';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function SquadBuilderModal({ onClose, onSuccess }: Props) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [search, setSearch] = useState('');
  const [filterElement, setFilterElement] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [team, setTeam] = useState<(Character | null)[]>([null, null, null, null]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [tags, setTags] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (filterElement) params.set('element', filterElement);
    if (filterRegion) params.set('region', filterRegion);
    api.get<Character[]>(`/squads/characters?${params}`).then(setCharacters);
  }, [search, filterElement, filterRegion]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || source.droppableId !== 'characters') return;
    const slotIndex = parseInt(destination.droppableId.replace('slot-', ''), 10);
    if (Number.isNaN(slotIndex)) return;
    const list = [...characters];
    const char = list[source.index];
    if (!char || team.some((t) => t?.id === char.id)) return;
    const newTeam = [...team];
    newTeam[slotIndex] = char;
    setTeam(newTeam);
  };

  const pickChar = (char: Character, slot: number) => {
    if (team.some((t) => t?.id === char.id)) return;
    const newTeam = [...team];
    newTeam[slot] = char;
    setTeam(newTeam);
  };

  const handleSubmit = async () => {
    if (!name.trim() || team.some((t) => t === null)) {
      alert('请填写阵容名称并选满 4 名角色');
      return;
    }
    setSubmitting(true);
    try {
      let finalVideoUrl = videoUrl || null;
      if (videoFile) {
        setUploading(true);
        finalVideoUrl = await uploadBattleVideo(videoFile);
        setUploading(false);
      }
      await api.post('/squads', {
        name: name.trim(),
        description: description.trim() || null,
        scenario: scenario || null,
        tags: tags.trim() || null,
        videoUrl: finalVideoUrl,
        videoTitle: videoTitle.trim() || (finalVideoUrl ? `${name} 实战录像` : null),
        char1Id: team[0]!.id,
        char2Id: team[1]!.id,
        char3Id: team[2]!.id,
        char4Id: team[3]!.id,
      });
      onSuccess();
    } catch (err) {
      alert(err instanceof Error ? err.message : '发布失败');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const elements = ['', '物理', '火', '冰', '雷', '风', '量子', '虚数'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="panel-star w-full max-w-6xl max-h-[92vh] flex flex-col border-star-gold/20 shadow-2xl">
        <div className="p-5 border-b border-white/10 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-display text-gradient-gold tracking-wider">编队模拟器</h2>
            <p className="text-xs text-gray-500 mt-1">拖拽或点击角色上阵 · 可附战斗录像</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {team.map((char, i) => (
                <Droppable key={`slot-${i}`} droppableId={`slot-${i}`}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`rounded-xl transition-all ${
                        snapshot.isDraggingOver ? 'ring-2 ring-star-purple' : ''
                      }`}
                    >
                      {char ? (
                        <div className="relative">
                          <CharacterPortrait character={char} size="lg" showMeta />
                          <button
                            type="button"
                            onClick={() => {
                              const n = [...team];
                              n[i] = null;
                              setTeam(n);
                            }}
                            className="absolute top-2 right-2 z-10 p-1 rounded-full bg-black/60 hover:bg-red-500/80"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <span className="absolute top-2 left-2 z-10 text-[10px] bg-black/50 px-1.5 rounded text-star-cyan">
                            {i + 1}
                          </span>
                        </div>
                      ) : (
                        <div className="aspect-[3/4] min-h-[160px] rounded-xl border-2 border-dashed border-white/15 flex flex-col items-center justify-center bg-white/5 text-gray-500">
                          <Plus className="w-8 h-8 mb-2 opacity-40" />
                          <span className="text-xs">席位 {i + 1}</span>
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="阵容名称，如：黄泉双拉核爆队"
                />
                <select value={scenario} onChange={(e) => setScenario(e.target.value)} className="input">
                  {SCENARIOS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="input"
                  placeholder="标签，逗号分隔：0+1, 速刷, 平民"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input h-28 resize-none"
                  placeholder="配队思路、轴、遗器光锥建议…"
                />
                <div className="card p-4 space-y-3 border-star-purple/20">
                  <p className="text-sm font-medium text-star-cyan flex items-center gap-2">
                    <Video className="w-4 h-4" /> 战斗录像（可选）
                  </p>
                  <input
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="input py-2 text-sm"
                    placeholder="视频标题"
                  />
                  <label className="flex flex-col items-center justify-center gap-2 py-6 border border-dashed border-white/20 rounded-xl cursor-pointer hover:border-star-gold/40 transition-colors">
                    <Upload className="w-6 h-6 text-star-gold" />
                    <span className="text-xs text-gray-400">
                      {videoFile ? videoFile.name : '上传 mp4 / webm（最大 80MB）'}
                    </span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      className="hidden"
                      onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  <input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="input py-2 text-sm"
                    placeholder="或粘贴外链视频地址"
                  />
                </div>
              </div>

              <div className="lg:col-span-3 flex flex-col rounded-xl border border-white/10 overflow-hidden bg-black/20">
                <div className="p-3 border-b border-white/10 flex flex-wrap gap-2">
                  <div className="relative flex-1 min-w-[140px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="input pl-9 py-2 text-sm"
                      placeholder="搜索角色"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {elements.map((el) => (
                      <button
                        key={el || 'all-el'}
                        type="button"
                        onClick={() => setFilterElement(el)}
                        className={`px-2.5 py-1 rounded-lg text-xs ${
                          filterElement === el ? 'bg-star-purple text-white' : 'bg-white/5 text-gray-400'
                        }`}
                      >
                        {el || '全属性'}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {REGIONS.map((r) => (
                      <button
                        key={r || 'all-region'}
                        type="button"
                        onClick={() => setFilterRegion(r)}
                        className={`px-2.5 py-1 rounded-lg text-xs ${
                          filterRegion === r ? 'bg-star-gold/30 text-star-gold' : 'bg-white/5 text-gray-400'
                        }`}
                      >
                        {r || '全地区'}
                      </button>
                    ))}
                  </div>
                </div>
                <Droppable droppableId="characters" isDropDisabled>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="p-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 overflow-y-auto max-h-[340px]"
                    >
                      {characters.map((char, index) => {
                        const inTeam = team.some((t) => t?.id === char.id);
                        return (
                          <Draggable key={char.id} draggableId={`char-${char.id}`} index={index}>
                            {(dragProvided, snapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                onClick={() => {
                                  const slot = team.findIndex((t) => t === null);
                                  if (slot >= 0) pickChar(char, slot);
                                }}
                                className={`w-full min-w-0 ${inTeam ? 'opacity-35 pointer-events-none' : ''} ${
                                  snapshot.isDragging ? 'z-50' : ''
                                }`}
                              >
                                <CharacterPortrait character={char} size="sm" />
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          </DragDropContext>
        </div>

        <div className="p-5 border-t border-white/10 flex justify-end gap-3 shrink-0 bg-black/30">
          <button type="button" onClick={onClose} className="btn-ghost px-6">
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || uploading}
            className="btn-primary px-8 flex items-center gap-2"
          >
            {(submitting || uploading) && <Loader2 className="w-4 h-4 animate-spin" />}
            {uploading ? '上传视频中…' : submitting ? '发布中…' : '发布阵容'}
          </button>
        </div>
      </div>
    </div>
  );
}
