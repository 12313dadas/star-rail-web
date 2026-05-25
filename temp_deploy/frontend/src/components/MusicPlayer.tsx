import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music } from 'lucide-react';
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
    if (playing && audioRef.current) audioRef.current.play().catch(() => setPlaying(false));
  }, [current, playing]);

  if (!tracks.length) return null;

  return (
    <>
      <audio ref={audioRef} src={track?.url} onEnded={next} />
      <div className="fixed bottom-4 right-4 z-50">
        <div
          className={`bg-star-navy/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl transition-all ${expanded ? 'w-72 p-4' : 'w-auto p-3'}`}
        >
          <div className="flex items-center gap-3">
            <button onClick={() => setExpanded(!expanded)} className="p-2 bg-star-purple/20 rounded-full">
              <Music className="w-5 h-5 text-star-gold" />
            </button>
            {expanded && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{track?.title}</p>
                <p className="text-xs text-gray-400 truncate">{track?.artist}</p>
              </div>
            )}
            <button onClick={prev} className="btn-ghost p-1"><SkipBack className="w-4 h-4" /></button>
            <button onClick={toggle} className="p-2 bg-star-purple rounded-full">
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button onClick={next} className="btn-ghost p-1"><SkipForward className="w-4 h-4" /></button>
            {expanded && <Volume2 className="w-4 h-4 text-gray-400" />}
          </div>
        </div>
      </div>
    </>
  );
}
