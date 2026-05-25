import type { IntroPhase } from './cinematicTypes';

interface Props {
  phase: IntroPhase;
  progress: number;
  nickname?: string;
}

export function WelcomeToast({ visible, nickname }: { visible: boolean; nickname?: string }) {
  const masked = nickname ? `${nickname.slice(0, 2)}****` : '开拓者';
  return (
    <div
      className={`absolute top-8 left-1/2 -translate-x-1/2 z-30 transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6 pointer-events-none'
      }`}
    >
      <div className="flex items-center gap-3 px-5 py-3 rounded-md bg-white/95 shadow-[0_8px_32px_rgba(0,0,0,0.45)] min-w-[280px]">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor" aria-hidden>
            <path d="M7 4h10v14H7V4zm2 2v10h6V6H9zm-1 14h8v2H8v-2z" />
          </svg>
        </div>
        <p className="text-[15px] text-gray-800 font-medium tracking-wide">
          {masked}，欢迎进入游戏
        </p>
      </div>
    </div>
  );
}

export function LoreLoader({ visible, progress }: { visible: boolean; progress: number }) {
  const fill = Math.min(100, Math.max(0, ((progress - 0.62) / 0.24) * 100));

  return (
    <div
      className={`absolute inset-0 z-[25] flex flex-col items-center justify-center px-6 transition-opacity duration-1000 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex gap-3 sm:gap-5 mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="intro-window relative w-[100px] h-[68px] sm:w-[140px] sm:h-[88px] overflow-hidden"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <WindowScene variant={i} />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-5 w-full max-w-md">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-star-gold/60 to-star-gold/30" />
        <div className="w-2 h-2 rotate-45 border border-star-gold/70 bg-star-gold/10" />
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-star-gold/60 to-star-gold/30" />
      </div>

      <h2 className="font-display text-lg sm:text-xl text-white/95 tracking-[0.35em] mb-4">
        星穹列车 · 跃迁通道
      </h2>
      <p className="text-center text-gray-400/90 text-xs sm:text-sm max-w-lg leading-relaxed tracking-wide">
        个人空间正在同步星轨数据，请稍候片刻……
      </p>

      <div className="absolute bottom-[14%] left-1/2 -translate-x-1/2 w-[min(90vw,420px)]">
        <div className="relative h-px bg-white/15">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-star-gold/80 via-star-gold-bright to-star-cyan/70 transition-all duration-150"
            style={{ width: `${fill}%`, boxShadow: '0 0 12px rgba(232,184,74,0.8)' }}
          />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-star-gold intro-star-icon">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden>
              <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L6 21l2.3-7-6-4.6h7.6L12 2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function WindowScene({ variant }: { variant: number }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#1a2848] via-[#0d1528] to-[#060a14]">
      <div className="absolute inset-0 intro-window-stars opacity-80" />
      {variant === 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-12 rounded-t-full bg-gradient-to-t from-indigo-900/80 to-transparent opacity-70" />
      )}
      {variant !== 1 && (
        <>
          <div className="absolute w-1 h-1 rounded-full bg-white/60 top-[30%] left-[20%] animate-pulse" />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-star-cyan/50 top-[50%] right-[25%]" />
          <div className="absolute w-2 h-2 rounded-sm bg-gray-700/80 top-[60%] left-[40%] rotate-12" />
        </>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
    </div>
  );
}

export default function IntroHUD({ phase, progress, nickname }: Props) {
  const toastVisible = phase === 'toast' || phase === 'lore' || (phase === 'cinema' && progress > 0.48);
  const loreVisible = phase === 'lore' || phase === 'flash';

  return (
    <>
      <WelcomeToast visible={toastVisible && phase !== 'lore'} nickname={nickname} />
      <LoreLoader visible={loreVisible} progress={progress} />
      <p
        className={`absolute bottom-3 left-4 z-30 text-[9px] text-white/25 font-mono tracking-wider transition-opacity duration-500 ${
          phase === 'lore' || phase === 'flash' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        WEB · STAR-RAIL · UID:{Math.floor(progress * 999999)}
      </p>
    </>
  );
}
