import { useEffect, useState } from 'react';
import { Train } from 'lucide-react';

interface Props {
  onComplete: () => void;
  nickname?: string;
}

export default function ExpressIntro({ onComplete, nickname }: Props) {
  const [phase, setPhase] = useState<'train' | 'text' | 'done'>('train');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('text'), 2200);
    const t2 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 4200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-star-void transition-opacity duration-1000 ${
        phase === 'done' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <StarfieldIntro />

      {/* 跃迁光轨 */}
      <div
        className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 train-trail opacity-80"
        style={{ animationDelay: '0.2s' }}
      />
      <div
        className="absolute top-[48%] left-0 w-full h-px bg-gradient-to-r from-transparent via-star-cyan/60 to-transparent"
        style={{ animation: 'train-pass 3s ease-out forwards', animationDelay: '0.1s' }}
      />

      {/* 星穹列车 */}
      <div
        className="absolute top-1/2 -translate-y-1/2 flex items-center gap-4 animate-train-pass z-10"
        style={{ filter: 'drop-shadow(0 0 40px rgba(124, 92, 255, 0.8)) drop-shadow(0 0 80px rgba(232, 184, 74, 0.4))' }}
      >
        <div className="relative">
          <div className="absolute -inset-8 bg-star-purple/30 rounded-full blur-3xl" />
          <div className="relative flex items-center gap-3 px-8 py-4 rounded-2xl border border-star-gold/40 bg-star-panel/90 backdrop-blur-md">
            <Train className="w-12 h-12 text-star-gold-bright" strokeWidth={1.5} />
            <div className="hidden sm:block">
              <p className="font-display text-xs text-star-cyan tracking-[0.3em] uppercase">Astral Express</p>
              <p className="font-display text-lg text-gradient-gold tracking-wider">星穹列车</p>
            </div>
          </div>
        </div>
      </div>

      {/* 欢迎文案 */}
      <div
        className={`absolute bottom-[20%] left-0 right-0 text-center transition-all duration-700 z-20 ${
          phase === 'text' || phase === 'done' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <p className="font-display text-star-cyan text-sm tracking-[0.4em] mb-3 uppercase">Welcome Aboard</p>
        <h1 className="hero-title text-3xl sm:text-4xl text-gradient-gold mb-2">
          {nickname ? `${nickname}，欢迎登车` : '欢迎登上星穹列车'}
        </h1>
        <p className="text-gray-400 text-sm">正在跃迁进入个人空间…</p>
        <div className="mt-6 mx-auto w-48 h-0.5 bg-gold-line rounded-full opacity-60" />
      </div>

      <button
        type="button"
        onClick={() => {
          setPhase('done');
          onComplete();
        }}
        className="absolute bottom-8 right-8 z-30 btn-ghost text-xs text-gray-500 hover:text-star-gold"
      >
        跳过动画 →
      </button>
    </div>
  );
}

function StarfieldIntro() {
  return (
    <div className="absolute inset-0">
      {Array.from({ length: 60 }).map((_, i) => (
        <span
          key={i}
          className="absolute w-px h-px bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.3 + Math.random() * 0.7,
            animation: `pulse ${1 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
}
