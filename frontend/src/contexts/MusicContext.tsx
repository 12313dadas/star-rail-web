import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { api } from '../lib/api';
import type { MusicTrack } from '../types';

interface MusicContextValue {
  tracks: MusicTrack[];
  current: number;
  playing: boolean;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  playAt: (index: number) => void;
  playById: (id: number) => void;
  refreshTracks: () => Promise<void>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const MusicContext = createContext<MusicContextValue | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const refreshTracks = useCallback(async () => {
    const list = await api.get<MusicTrack[]>('/music');
    setTracks(list);
    setCurrent((i) => (list.length ? Math.min(i, list.length - 1) : 0));
  }, []);

  useEffect(() => {
    refreshTracks().catch(() => {});
  }, [refreshTracks]);

  const playAt = useCallback(
    (index: number) => {
      if (!tracks.length) return;
      setCurrent(((index % tracks.length) + tracks.length) % tracks.length);
      setPlaying(true);
      setExpanded(true);
    },
    [tracks.length]
  );

  const playById = useCallback(
    (id: number) => {
      const idx = tracks.findIndex((t) => t.id === id);
      if (idx >= 0) playAt(idx);
    },
    [tracks, playAt]
  );

  const next = useCallback(() => {
    if (!tracks.length) return;
    setCurrent((i) => (i + 1) % tracks.length);
    setPlaying(true);
  }, [tracks.length]);

  const prev = useCallback(() => {
    if (!tracks.length) return;
    setCurrent((i) => (i - 1 + tracks.length) % tracks.length);
    setPlaying(true);
  }, [tracks.length]);

  const toggle = useCallback(() => {
    if (!audioRef.current || !tracks.length) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  }, [playing, tracks.length]);

  useEffect(() => {
    if (playing && audioRef.current) {
      audioRef.current.play().catch(() => setPlaying(false));
    }
  }, [current, playing, tracks]);

  const value: MusicContextValue = {
    tracks,
    current,
    playing,
    expanded,
    setExpanded,
    toggle,
    next,
    prev,
    playAt,
    playById,
    refreshTracks,
    audioRef,
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used within MusicProvider');
  return ctx;
}
