import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music, Repeat } from 'lucide-react';
import { api } from '../lib/api';
import type { MusicTrack } from '../types';

export default function MusicPlayer() {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    api.get<MusicTrack[]>('/music').then(setTracks).catch(() => {});
  }, []);

  const track = tracks[current];

  const toggle = () => {
    if (!audioRef.current || !track) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  const next = useCallback(() => {
    if (!tracks.length) return;
    setCurrent((i) => (i + 1) % tracks.length);
    setPlaying(true);
  }, [tracks.length]);

  const prev = () => {
    if (!tracks.length) return;
    setCurrent((i) => (i - 1 + tracks.length) % tracks.length);
    setPlaying(true);
  };

  useEffect(() => {
    if (playing && audioRef.current) {
      audioRef.current.play().catch(() => setPlaying(false));
    }
  }, [current, playing]);

  if (!tracks.length) return null;

  const singleTrack = tracks.length === 1;

  return (
    <>
      <audio ref={audioRef} src={track?.url} onEnded={singleTrack ? () => audioRef.current?.play() : next} preload="metadata" />
      <div className="fixed bottom-4 right-4 z-50">
        <div
          className={`panel-star backdrop-blur-xl transition-all duration-300 ${
            expanded ? 'w-80 p-4' : 'w-auto p-3'
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

            <div className={`min-w-0 ${expanded ? 'flex-1' : 'max-w-[140px]'}`}>
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
        </div>
      </div>
    </>
  );
}
