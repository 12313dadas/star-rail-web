import { useEffect, useRef } from 'react';

/** 跃迁隧道 Canvas — 星轨粒子 / 超空间拉伸 / 星云光晕 */
export default function WarpCanvas({ progress }: { progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;

    interface Streak {
      angle: number;
      dist: number;
      speed: number;
      len: number;
      hue: number;
    }

    interface Dust {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      a: number;
    }

    const streaks: Streak[] = [];
    const dusts: Dust[] = [];

    const init = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      streaks.length = 0;
      dusts.length = 0;
      for (let i = 0; i < 280; i++) {
        streaks.push({
          angle: Math.random() * Math.PI * 2,
          dist: Math.random() * Math.max(w, h) * 0.8,
          speed: 0.4 + Math.random() * 1.2,
          len: 20 + Math.random() * 80,
          hue: Math.random() > 0.7 ? 45 : Math.random() > 0.5 ? 260 : 175,
        });
      }
      for (let i = 0; i < 120; i++) {
        dusts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 2 + 0.5,
          a: Math.random() * 0.6,
        });
      }
    };

    const cx = () => w / 2;
    const cy = () => h / 2;

    const draw = (time: number) => {
      const p = progressRef.current;
      const warp = Math.min(1, Math.max(0, (p - 0.05) / 0.55));
      const ease = warp * warp * (3 - 2 * warp);

      // 深空底色 + 动态星云
      const g = ctx.createRadialGradient(cx(), cy() * 0.6, 0, cx(), cy(), Math.max(w, h) * 0.9);
      g.addColorStop(0, `rgba(124, 92, 255, ${0.15 + ease * 0.2})`);
      g.addColorStop(0.35, `rgba(20, 30, 60, ${0.9})`);
      g.addColorStop(0.7, `rgba(5, 8, 16, 1)`);
      g.addColorStop(1, '#050810');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // 中心跃迁光晕（列车经过时增强）
      const flare = ease * (0.5 + 0.5 * Math.sin(time * 0.004));
      const flareG = ctx.createRadialGradient(cx(), cy(), 0, cx(), cy(), 200 + ease * 400);
      flareG.addColorStop(0, `rgba(255, 216, 117, ${flare * 0.35})`);
      flareG.addColorStop(0.3, `rgba(124, 92, 255, ${flare * 0.25})`);
      flareG.addColorStop(0.6, `rgba(94, 234, 212, ${flare * 0.08})`);
      flareG.addColorStop(1, 'transparent');
      ctx.fillStyle = flareG;
      ctx.fillRect(0, 0, w, h);

      // 水平跃迁光带
      const bandY = cy();
      const band = ctx.createLinearGradient(0, bandY - 40, 0, bandY + 40);
      band.addColorStop(0, 'transparent');
      band.addColorStop(0.45, `rgba(124, 92, 255, ${ease * 0.15})`);
      band.addColorStop(0.5, `rgba(232, 184, 74, ${ease * 0.35})`);
      band.addColorStop(0.55, `rgba(94, 234, 212, ${ease * 0.2})`);
      band.addColorStop(1, 'transparent');
      ctx.fillStyle = band;
      ctx.fillRect(0, bandY - 60, w, 120);

      // 星轨拉伸粒子（从中心向外 / 跃迁感）
      const trainX = w * (0.15 + p * 0.75);
      for (const s of streaks) {
        const spd = s.speed * (1 + ease * 12);
        s.dist += spd;
        if (s.dist > Math.max(w, h) * 1.2) {
          s.dist = Math.random() * 30;
          s.angle = Math.atan2(
            (Math.random() - 0.5) * h,
            trainX - cx() + (Math.random() - 0.5) * w * 0.3
          );
        }

        const x1 = cx() + Math.cos(s.angle) * s.dist;
        const y1 = cy() + Math.sin(s.angle) * s.dist * 0.6;
        const stretch = s.len * (1 + ease * 8);
        const x2 = x1 + Math.cos(s.angle) * stretch;
        const y2 = y1 + Math.sin(s.angle) * stretch * 0.6;

        const alpha = Math.min(1, (1 - s.dist / (Math.max(w, h) * 0.9))) * (0.3 + ease * 0.7);
        if (alpha < 0.02) continue;

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        if (s.hue === 45) {
          grad.addColorStop(0, `rgba(255, 216, 117, 0)`);
          grad.addColorStop(0.5, `rgba(232, 184, 74, ${alpha})`);
          grad.addColorStop(1, `rgba(255, 255, 255, ${alpha * 0.8})`);
        } else if (s.hue === 260) {
          grad.addColorStop(0, `rgba(124, 92, 255, 0)`);
          grad.addColorStop(0.5, `rgba(124, 92, 255, ${alpha})`);
          grad.addColorStop(1, `rgba(200, 180, 255, ${alpha})`);
        } else {
          grad.addColorStop(0, `rgba(94, 234, 212, 0)`);
          grad.addColorStop(0.5, `rgba(94, 234, 212, ${alpha * 0.7})`);
          grad.addColorStop(1, `rgba(255, 255, 255, ${alpha * 0.5})`);
        }

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1 + ease * 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // 金色浮尘
      for (const d of dusts) {
        d.x += d.vx * (1 + ease * 4);
        d.y += d.vy * (1 + ease * 4);
        if (d.x < 0) d.x = w;
        if (d.x > w) d.x = 0;
        if (d.y < 0) d.y = h;
        if (d.y > h) d.y = 0;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r * (1 + ease), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 184, 74, ${d.a * (0.4 + ease * 0.6)})`;
        ctx.fill();
      }

      // 列车位置冲击波环
      if (ease > 0.2) {
        const ringR = ((time * 0.15) % 1) * 300 + ease * 100;
        ctx.strokeStyle = `rgba(232, 184, 74, ${(1 - (time * 0.15) % 1) * ease * 0.4})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(trainX, bandY, ringR, 0, Math.PI * 2);
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };

    init();
    window.addEventListener('resize', init);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden
    />
  );
}
