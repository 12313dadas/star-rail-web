import { useEffect, useRef, useCallback } from 'react';

interface Point {
  x: number; y: number;
  vx: number; vy: number;
  r: number; a: number;
}

/** 鼠标响应式粒子星座 —— 粒子间动态连线，营造星穹列车航行时的星空感 */
export default function ParticleConstellation({
  fullPage = false,
  color = '#7c5cff',
  linkColor = '#7c5cff',
  linkThreshold = 140,
  particleCount = 80,
  className = '',
}: {
  fullPage?: boolean;
  color?: string;
  linkColor?: string;
  linkThreshold?: number;
  particleCount?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.35, ox: -999, oy: -999 });
  const smoothRef = useRef({ x: 0.5, y: 0.35 });
  const ptsRef = useRef<Point[]>([]);
  const rafRef = useRef(0);
  const sizeRef = useRef({ w: 1, h: 1, dpr: 1 });

  const initPts = useCallback((w: number, h: number) => {
    const n = Math.min(particleCount, Math.floor((w * h) / 12000));
    ptsRef.current = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4 - 0.15,
      r: 0.6 + Math.random() * 1.8,
      a: 0.15 + Math.random() * 0.4,
    }));
  }, [particleCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const el = canvas.parentElement;
      const w = fullPage ? window.innerWidth : (el?.clientWidth ?? window.innerWidth);
      const h = fullPage ? window.innerHeight : (el?.clientHeight ?? window.innerHeight);
      sizeRef.current = { w, h, dpr };
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (ptsRef.current.length === 0) initPts(w, h);
    };

    const tick = () => {
      const { w, h } = sizeRef.current;
      const mx = mouseRef.current.ox;
      const my = mouseRef.current.oy;
      smoothRef.current.x += (mouseRef.current.x - smoothRef.current.x) * 0.05;
      smoothRef.current.y += (mouseRef.current.y - smoothRef.current.y) * 0.05;

      ctx.clearRect(0, 0, w, h);

      // Draw particles & connections
      const pts = ptsRef.current;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        // Mouse interaction - gentle push away
        if (mx > 0 && my > 0) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            const force = (120 - dist) / 120 * 0.5;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 220, 255, ${p.a})`;
        ctx.fill();

        // Glow for larger particles
        if (p.r > 1.5) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(124, 92, 255, ${p.a * 0.15})`;
          ctx.fill();
        }

        // Draw connections to nearby particles
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);
          if (dist < linkThreshold) {
            const alpha = (1 - dist / linkThreshold) * 0.35;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(124, 92, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    resize();
    rafRef.current = requestAnimationFrame(tick);
    window.addEventListener('resize', resize);
    const ro = canvas.parentElement ? new ResizeObserver(resize) : null;
    if (canvas.parentElement && ro) ro.observe(canvas.parentElement);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mouseRef.current = {
        x: clamp(x, 0, 1),
        y: clamp(y, 0, 1),
        ox: e.clientX - rect.left,
        oy: e.clientY - rect.top,
      };
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      ro?.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [fullPage, initPts, linkThreshold, linkColor, color]);

  return (
    <canvas
      ref={canvasRef}
      className={className || (fullPage ? 'fixed inset-0 pointer-events-none z-0' : 'absolute inset-0 pointer-events-none')}
      aria-hidden
    />
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
