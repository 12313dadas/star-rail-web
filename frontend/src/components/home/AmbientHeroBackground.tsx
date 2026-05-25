import { useEffect, useRef, useCallback } from 'react';

interface Dot {
  x: number;
  y: number;
  r: number;
  a: number;
  sp: number;
}

/** 柔和环境背景：鼠标光晕 + 星尘，无割裂揭示线 */
export default function AmbientHeroBackground({ fullPage = false }: { fullPage?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.35 });
  const smoothRef = useRef({ x: 0.5, y: 0.35 });
  const dotsRef = useRef<Dot[]>([]);
  const rafRef = useRef(0);
  const sizeRef = useRef({ w: 1, h: 1, dpr: 1 });

  const initDots = useCallback((w: number, h: number) => {
    const n = Math.min(90, Math.floor((w * h) / 14000));
    dotsRef.current = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.4 + Math.random() * 1.4,
      a: 0.08 + Math.random() * 0.35,
      sp: 0.08 + Math.random() * 0.2,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const host = () => (fullPage ? document.documentElement : canvas.parentElement);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const el = fullPage ? null : canvas.parentElement;
      const w = fullPage ? window.innerWidth : (el?.clientWidth ?? window.innerWidth);
      const h = fullPage ? window.innerHeight : (el?.clientHeight ?? window.innerHeight);
      sizeRef.current = { w, h, dpr };
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (dotsRef.current.length === 0) initDots(w, h);
    };

    const tick = () => {
      const { w, h } = sizeRef.current;
      smoothRef.current.x += (mouseRef.current.x - smoothRef.current.x) * 0.06;
      smoothRef.current.y += (mouseRef.current.y - smoothRef.current.y) * 0.06;
      const mx = smoothRef.current.x * w;
      const my = smoothRef.current.y * h;

      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#060810');
      bg.addColorStop(0.5, '#050810');
      bg.addColorStop(1, '#080612');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const glow = ctx.createRadialGradient(mx, my, 0, mx, my, Math.max(w, h) * 0.55);
      glow.addColorStop(0, 'rgba(124, 92, 255, 0.18)');
      glow.addColorStop(0.35, 'rgba(232, 184, 74, 0.06)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      const topGlow = ctx.createRadialGradient(w * 0.5, -h * 0.1, 0, w * 0.5, h * 0.4, h * 0.9);
      topGlow.addColorStop(0, 'rgba(124, 92, 255, 0.12)');
      topGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = topGlow;
      ctx.fillRect(0, 0, w, h);

      for (const d of dotsRef.current) {
        d.y -= d.sp;
        if (d.y < 0) {
          d.y = h;
          d.x = Math.random() * w;
        }
        const dist = Math.hypot(d.x - mx, d.y - my);
        const boost = dist < 180 ? 0.25 : 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 220, 255, ${d.a + boost})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    resize();
    rafRef.current = requestAnimationFrame(tick);
    window.addEventListener('resize', resize);
    const ro = !fullPage && canvas.parentElement ? new ResizeObserver(resize) : null;
    if (canvas.parentElement && ro) ro.observe(canvas.parentElement);

    const onMove = (e: PointerEvent) => {
      const el = host();
      const rect = fullPage
        ? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }
        : (canvas.parentElement?.getBoundingClientRect() ?? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight });
      mouseRef.current.x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
      mouseRef.current.y = clamp((e.clientY - rect.top) / rect.height, 0, 1);
    };

    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      ro?.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [fullPage, initDots]);

  return (
    <canvas
      ref={canvasRef}
      className={fullPage ? 'home-ambient-canvas home-ambient-canvas--page' : 'home-ambient-canvas'}
      aria-hidden
    />
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
