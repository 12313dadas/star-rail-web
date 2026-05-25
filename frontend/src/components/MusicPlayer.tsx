import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music, Repeat, ListMusic } from 'lucide-react';
import { useMusic } from '../contexts/MusicContext';

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MusicPlayer() {
  const {
    tracks,
    current,
    playing,
    expanded,
    setExpanded,
    toggle,
    next,
    prev,
    playAt,
    audioRef,
  } = useMusic();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const seekingRef = useRef(false);

  const track = tracks[current];
  const singleTrack = tracks.length === 1;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
  }, [track?.url]);

  const commitSeek = useCallback(
    (time: number) => {
      const el = audioRef.current;
      if (!el || !Number.isFinite(time)) return;
      const clamped = Math.max(0, Math.min(time, duration || el.duration || time));
      el.currentTime = clamped;
      setCurrentTime(clamped);
    },
    [audioRef, duration]
  );

  const onTimeUpdate = () => {
    if (seekingRef.current || isSeeking || !audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const onLoadedMetadata = () => {
    if (!audioRef.current) return;
    const d = audioRef.current.duration;
    if (Number.isFinite(d)) setDuration(d);
  };

  if (!tracks.length) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={track?.url}
        onEnded={singleTrack ? () => audioRef.current?.play() : next}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onDurationChange={onLoadedMetadata}
        preload="metadata"
      />
      <div className="fixed bottom-4 right-4 z-50">
        <div
          className={`panel-star backdrop-blur-xl transition-all duration-300 ${
            expanded ? 'w-[min(92vw,380px)] p-4' : 'w-[min(92vw,320px)] p-3'
          } border-star-gold/20 ${playing ? 'shadow-gold-glow' : 'shadow-star-glow'}`}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="p-2 bg-star-purple/20 rounded-full shrink-0 hover:bg-star-purple/30 transition-colors"
              title="网站 BGM"
            >
              <Music className="w-5 h-5 text-star-gold" />
            </button>

            <div className={`min-w-0 ${expanded ? 'flex-1' : 'flex-1 max-w-[120px] sm:max-w-[160px]'}`}>
              <p className="text-sm font-medium truncate text-star-gold">{track?.title}</p>
              {track?.artist && (
                <p className="text-xs text-gray-400 truncate">{track.artist}</p>
              )}
            </div>

            {!singleTrack && (
              <button type="button" onClick={prev} className="btn-ghost p-1 shrink-0" aria-label="上一首">
                <SkipBack className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={toggle}
              className="p-2.5 rounded-full shrink-0 bg-gradient-to-br from-star-purple to-star-purple-dim hover:scale-105 transition-transform shadow-star-glow"
              aria-label={playing ? '暂停' : '播放'}
            >
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            {!singleTrack && (
              <button type="button" onClick={next} className="btn-ghost p-1 shrink-0" aria-label="下一首">
                <SkipForward className="w-4 h-4" />
              </button>
            )}
            {singleTrack && (
              <Repeat className="w-4 h-4 text-gray-500 shrink-0" title="单曲循环" />
            )}
          </div>

          {/* 进度条 */}
          <div className={`mt-3 ${expanded ? '' : 'mt-2'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] text-gray-500 tabular-nums w-9 text-right shrink-0">
                {formatTime(currentTime)}
              </span>
              <div className="relative flex-1 h-8 flex items-center">
                <div className="absolute left-0 right-0 h-1 rounded-full bg-white/10 pointer-events-none">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r from-star-purple via-star-gold to-star-cyan ${
                      isSeeking ? '' : 'transition-[width] duration-75'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <img
                  src="/gif/doro.gif"
                  alt=""
                  draggable={false}
                  className={`music-doro-thumb absolute top-1/2 z-10 w-7 h-7 object-contain -translate-y-1/2 -translate-x-1/2 pointer-events-none ${
                    isSeeking ? 'scale-110' : ''
                  } transition-transform`}
                  style={{ left: `${progress}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={duration ? currentTime : 0}
                  aria-label="播放进度"
                  className="music-progress-doro absolute inset-0 w-full h-full cursor-pointer"
                  disabled={!duration}
                  onPointerDown={() => {
                    seekingRef.current = true;
                    setIsSeeking(true);
                  }}
                  onInput={(e) => {
                    setCurrentTime(Number(e.currentTarget.value));
                  }}
                  onChange={(e) => {
                    commitSeek(Number(e.currentTarget.value));
                    seekingRef.current = false;
                    setIsSeeking(false);
                  }}
                  onPointerUp={(e) => {
                    commitSeek(Number(e.currentTarget.value));
                    seekingRef.current = false;
                    setIsSeeking(false);
                  }}
                />
              </div>
              <span className="text-[10px] text-gray-500 tabular-nums w-9 shrink-0">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {expanded && tracks.length > 1 && (
            <div className="mt-3 pt-3 border-t border-white/10 max-h-48 overflow-y-auto space-y-1">
              <span className="text-[10px] text-gray-500 tracking-widest uppercase flex items-center gap-1 mb-2">
                <ListMusic className="w-3 h-3" /> 播放列表 ({tracks.length})
              </span>
              {tracks.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => playAt(i)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors ${
                    i === current
                      ? 'bg-star-purple/25 text-star-gold border border-star-gold/20'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  <span className="block truncate font-medium">{t.title}</span>
                  {t.artist && <span className="block truncate text-[10px] opacity-70">{t.artist}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
