import { useEffect, useState, useRef, useCallback } from 'react';
import CinematicCanvas from './intro/CinematicCanvas';
import IntroHUD from './intro/IntroHUD';
import { phaseFromProgress } from './intro/cinematicTypes';

interface Props {
  onComplete: () => void;
  nickname?: string;
}

const DURATION_MS = 8800;
const SKIP_FADE_MS = 700;

export default function ExpressIntro({ onComplete, nickname }: Props) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(() => phaseFromProgress(0));
  const [screenOut, setScreenOut] = useState(false);
  const startRef = useRef(0);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setScreenOut(true);
    setTimeout(() => onCompleteRef.current(), SKIP_FADE_MS);
  }, []);

  useEffect(() => {
    startRef.current = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - startRef.current) / DURATION_MS);
      setProgress(t);
      setPhase(phaseFromProgress(t));

      if (t >= 0.96) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [finish]);

  const showTitle =
    phase === 'cinema' && progress > 0.32 && progress < 0.62;
  const titleOpacity = Math.min(1, Math.max(0, (progress - 0.32) / 0.08) * (1 - (progress - 0.54) / 0.08));

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden bg-[#030508] transition-opacity duration-700 ${
        screenOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <CinematicCanvas progress={progress} />

      {/* Film grain + vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-[1] intro-film-grain"
        aria-hidden
      />
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* Game-style title overlay during cinema */}
      <div
        className="absolute inset-0 z-[15] flex items-center justify-center pointer-events-none transition-opacity duration-500"
        style={{ opacity: showTitle ? titleOpacity : 0 }}
      >
        <div className="text-center">
          <p className="text-white/80 text-sm tracking-[0.6em] mb-2 font-sans">崩坏</p>
          <h1
            className="font-display font-bold text-4xl sm:text-6xl md:text-7xl tracking-[0.2em] text-white"
            style={{
              textShadow:
                '0 0 60px rgba(124,92,255,0.6), 0 0 120px rgba(255,216,117,0.3), 0 4px 20px rgba(0,0,0,0.8)',
            }}
          >
            星穹铁道
          </h1>
          <div className="mx-auto mt-4 w-48 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
      </div>

      <IntroHUD phase={phase} progress={progress} nickname={nickname} />

      {/* Corner brand during early phases */}
      <div
        className={`absolute top-8 left-8 z-20 transition-all duration-700 ${
          phase === 'logo' || phase === 'warp' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="font-display text-[10px] text-star-cyan tracking-[0.5em] uppercase mb-1">
          Astral Express
        </p>
        <p className="font-display text-sm text-gradient-gold tracking-[0.35em]">WARP DRIVE</p>
      </div>

      {/* Final welcome (after lore, before flash) */}
      <div
        className={`absolute bottom-[18%] left-0 right-0 text-center z-20 px-4 transition-all duration-700 ${
          phase === 'lore' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        <h2 className="hero-title text-2xl sm:text-4xl text-gradient-gold mb-2">
          {nickname ? `${nickname}，欢迎登车` : '欢迎登上星穹列车'}
        </h2>
        <p className="text-gray-400/90 text-sm tracking-[0.2em]">个人空间接入完成</p>
      </div>

      <button
        type="button"
        onClick={finish}
        className="absolute bottom-6 right-6 z-40 px-4 py-2 rounded-lg text-xs text-gray-500 border border-white/10 hover:border-star-gold/40 hover:text-star-gold transition-all backdrop-blur-md bg-black/30"
      >
        跳过动画
      </button>
    </div>
  );
}
