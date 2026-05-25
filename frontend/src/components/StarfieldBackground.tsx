import { useMemo } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

export default function StarfieldBackground({ dense = false }: { dense?: boolean }) {
  const stars = useMemo<Star[]>(() => {
    const count = dense ? 120 : 80;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 4,
      opacity: 0.2 + Math.random() * 0.8,
    }));
  }, [dense]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      <div className="absolute inset-0 bg-star-void" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(ellipse 100% 60% at 50% 0%, rgba(124, 92, 255, 0.2) 0%, transparent 55%),
            radial-gradient(ellipse 80% 50% at 80% 50%, rgba(94, 234, 212, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 10% 90%, rgba(232, 184, 74, 0.05) 0%, transparent 45%)
          `,
        }}
      />
      {stars.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            boxShadow: s.size > 1.5 ? '0 0 6px rgba(232, 184, 74, 0.6)' : undefined,
          }}
        />
      ))}
      <div className="absolute inset-0 intro-stars opacity-30" />
    </div>
  );
}
