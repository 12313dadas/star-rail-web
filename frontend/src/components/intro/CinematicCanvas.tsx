import { useEffect, useRef } from 'react';
import { easeInOutCubic, easeOutExpo, phaseFromProgress, trainPath } from './cinematicTypes';

/** Game-style login cinematic: logo shatter / warp tunnel / planet fly-through */
export default function CinematicCanvas({ progress }: { progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let time = 0;

    interface Shard {
      x: number;
      y: number;
      tx: number;
      ty: number;
      vx: number;
      vy: number;
      size: number;
      hue: 'gold' | 'blue' | 'white';
      rot: number;
      vr: number;
    }

    interface TunnelStar {
      x: number;
      y: number;
      z: number;
    }

    interface Asteroid {
      x: number;
      y: number;
      z: number;
      r: number;
      rot: number;
    }

    interface TrailP {
      x: number;
      y: number;
      life: number;
      hue: number;
      size: number;
    }

    const shards: Shard[] = [];
    const tunnel: TunnelStar[] = [];
    const asteroids: Asteroid[] = [];
    const trails: TrailP[] = [];
    let lastTrailSpawn = 0;

    const init = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      shards.length = 0;
      tunnel.length = 0;
      asteroids.length = 0;
      trails.length = 0;

      const cx = w / 2;
      const cy = h / 2;
      for (let i = 0; i < 220; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 80 + Math.random() * Math.max(w, h) * 0.55;
        shards.push({
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          tx: cx + (Math.random() - 0.5) * 280,
          ty: cy + (Math.random() - 0.5) * 80,
          vx: 0,
          vy: 0,
          size: 2 + Math.random() * 6,
          hue: Math.random() > 0.55 ? 'blue' : Math.random() > 0.35 ? 'gold' : 'white',
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.08,
        });
      }

      for (let i = 0; i < 400; i++) {
        tunnel.push({
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: Math.random(),
        });
      }

      for (let i = 0; i < 55; i++) {
        asteroids.push({
          x: Math.random(),
          y: Math.random(),
          z: 0.1 + Math.random() * 0.9,
          r: 4 + Math.random() * 28,
          rot: Math.random() * Math.PI,
        });
      }
    };

    const drawLogoPhase = (p: number, now: number) => {
      const t = Math.min(1, p / 0.14);
      const assemble = easeOutExpo(t);

      ctx.fillStyle = '#030508';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      for (const s of shards) {
        s.x += (s.tx - s.x) * (0.04 + assemble * 0.12);
        s.y += (s.ty - s.y) * (0.04 + assemble * 0.12);
        s.rot += s.vr * (1 + assemble * 3);

        const alpha = 0.3 + assemble * 0.7;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rot);
        if (s.hue === 'gold') ctx.fillStyle = `rgba(255, 216, 117, ${alpha})`;
        else if (s.hue === 'blue') ctx.fillStyle = `rgba(100, 160, 255, ${alpha})`;
        else ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
        ctx.fillRect(-s.size, -s.size * 0.4, s.size * 2, s.size * 0.8);
        ctx.restore();
      }

      // Logo glow orb
      const orbR = 120 + assemble * 40 + Math.sin(now * 0.003) * 10;
      const orb = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbR);
      orb.addColorStop(0, `rgba(124, 92, 255, ${0.35 * assemble})`);
      orb.addColorStop(0.5, `rgba(255, 200, 100, ${0.2 * assemble})`);
      orb.addColorStop(1, 'transparent');
      ctx.fillStyle = orb;
      ctx.fillRect(0, 0, w, h);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const titleAlpha = Math.max(0, (assemble - 0.35) / 0.65);
      ctx.globalAlpha = titleAlpha;
      ctx.font = '600 13px "Noto Sans SC", sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText('崩坏', cx - 100, cy - 42);
      ctx.font = 'bold 42px Orbitron, "Noto Sans SC", sans-serif';
      const grad = ctx.createLinearGradient(cx - 200, cy, cx + 200, cy);
      grad.addColorStop(0, '#fff');
      grad.addColorStop(0.5, '#e8e8ff');
      grad.addColorStop(1, '#ffd875');
      ctx.fillStyle = grad;
      ctx.fillText('星穹铁道', cx, cy);
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 180, cy + 8);
      ctx.lineTo(cx + 180, cy + 8);
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const drawWarpTunnel = (warp: number, now: number) => {
      const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h));
      bg.addColorStop(0, `rgba(20, 30, 70, ${0.9})`);
      bg.addColorStop(0.4, `rgba(8, 12, 28, 1)`);
      bg.addColorStop(1, '#030508');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const speed = 0.02 + warp * 0.14;
      const cx = w / 2;
      const cy = h / 2;

      for (const star of tunnel) {
        star.z -= speed;
        if (star.z <= 0.02) star.z = 1;

        const k = 1 / star.z;
        const sx = cx + star.x * k * w * 0.45;
        const sy = cy + star.y * k * h * 0.45;
        const size = (1 - star.z) * (2 + warp * 4);
        const alpha = (1 - star.z) * (0.4 + warp * 0.6);

        const hue = star.z > 0.6 ? 45 : star.z > 0.35 ? 260 : 175;
        if (hue === 45) ctx.fillStyle = `rgba(255, 216, 117, ${alpha})`;
        else if (hue === 260) ctx.fillStyle = `rgba(124, 92, 255, ${alpha})`;
        else ctx.fillStyle = `rgba(94, 234, 212, ${alpha * 0.8})`;

        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();

        if (warp > 0.3) {
          const len = size * (8 + warp * 20);
          const angle = Math.atan2(sy - cy, sx - cx);
          const x2 = sx + Math.cos(angle) * len;
          const y2 = sy + Math.sin(angle) * len;
          const lg = ctx.createLinearGradient(sx, sy, x2, y2);
          lg.addColorStop(0, `rgba(255,255,255,${alpha * 0.8})`);
          lg.addColorStop(1, 'transparent');
          ctx.strokeStyle = lg;
          ctx.lineWidth = size * 0.5;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }

      // Chromatic center burst
      if (warp > 0.5) {
        const burst = (warp - 0.5) * 2;
        for (const off of [-4, 0, 4]) {
          const g = ctx.createRadialGradient(cx + off, cy, 0, cx, cy, 180 + warp * 200);
          const c = off < 0 ? '124,92,255' : off > 0 ? '94,234,212' : '255,216,117';
          g.addColorStop(0, `rgba(${c}, ${burst * 0.25})`);
          g.addColorStop(1, 'transparent');
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
        }
      }

      // White flash at warp peak
      if (warp > 0.85) {
        ctx.fillStyle = `rgba(255,255,255,${(warp - 0.85) / 0.15 * 0.35})`;
        ctx.fillRect(0, 0, w, h);
      }
    };

    const drawPlanet = (cx: number, cy: number, r: number, alpha: number, now: number) => {
      const px = cx - w * 0.08;
      const py = cy + h * 0.02;

      const sphere = ctx.createRadialGradient(px - r * 0.25, py - r * 0.3, r * 0.1, px, py, r);
      sphere.addColorStop(0, `rgba(180, 200, 210, ${alpha})`);
      sphere.addColorStop(0.45, `rgba(90, 110, 120, ${alpha * 0.95})`);
      sphere.addColorStop(0.75, `rgba(40, 50, 65, ${alpha * 0.9})`);
      sphere.addColorStop(1, `rgba(10, 15, 25, ${alpha * 0.5})`);
      ctx.fillStyle = sphere;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();

      // Craters
      ctx.fillStyle = `rgba(0,0,0,${0.15 * alpha})`;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + now * 0.0001;
        const cr = r * (0.08 + (i % 3) * 0.04);
        ctx.beginPath();
        ctx.arc(px + Math.cos(a) * r * 0.35, py + Math.sin(a) * r * 0.3, cr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Golden energy grid (game planet veins)
      ctx.strokeStyle = `rgba(255, 200, 80, ${0.35 * alpha})`;
      ctx.lineWidth = 1;
      ctx.shadowColor = 'rgba(255, 200, 80, 0.6)';
      ctx.shadowBlur = 8;
      for (let i = 0; i < 14; i++) {
        const a1 = (i / 14) * Math.PI * 2 + now * 0.0002;
        const a2 = a1 + 0.4 + Math.sin(i + now * 0.001) * 0.2;
        ctx.beginPath();
        ctx.arc(px, py, r * 0.72, a1, a2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px + Math.cos(a1) * r * 0.3, py + Math.sin(a1) * r * 0.3);
        ctx.lineTo(px + Math.cos(a1) * r * 0.85, py + Math.sin(a1) * r * 0.85);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    };

    const drawAsteroids = (cinema: number, trainX: number, trainY: number, now: number) => {
      for (const a of asteroids) {
        const parallax = (1 - a.z) * cinema * 2.5;
        const ax = a.x * w + (trainX - w * 0.5) * parallax * 0.15 + Math.sin(now * 0.0005 + a.rot) * 4;
        const ay = a.y * h + parallax * 40 + (1 - cinema) * 50;
        const size = a.r * (0.3 + (1 - a.z) * 1.2) * cinema;
        const alpha = 0.25 + (1 - a.z) * 0.55 * cinema;

        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(a.rot + now * 0.0003 * (1 - a.z));
        ctx.fillStyle = `rgba(30, 35, 50, ${alpha})`;
        ctx.strokeStyle = `rgba(80, 90, 120, ${alpha * 0.6})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const pts = 7;
        for (let i = 0; i < pts; i++) {
          const ang = (i / pts) * Math.PI * 2;
          const rad = size * (0.7 + Math.sin(i * 2.1) * 0.3);
          const px = Math.cos(ang) * rad;
          const py = Math.sin(ang) * rad;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    };

    const spawnTrail = (x: number, y: number, intensity: number) => {
      for (let i = 0; i < 4; i++) {
        trails.push({
          x: x + (Math.random() - 0.5) * 30,
          y: y + (Math.random() - 0.5) * 20,
          life: 1,
          hue: Math.random() > 0.4 ? 45 : 280,
          size: 2 + Math.random() * 4 * intensity,
        });
      }
      if (trails.length > 350) trails.splice(0, trails.length - 350);
    };

    const drawTrails = () => {
      for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i];
        t.life -= 0.018;
        t.x -= 2.5;
        t.y += 0.3;
        if (t.life <= 0) {
          trails.splice(i, 1);
          continue;
        }
        const a = t.life * t.life;
        if (t.hue === 45) ctx.fillStyle = `rgba(255, 200, 100, ${a * 0.9})`;
        else ctx.fillStyle = `rgba(180, 100, 255, ${a * 0.85})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.size * t.life, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawTrainOnCanvas = (
      x: number,
      y: number,
      angle: number,
      scale: number,
      headGlow: number,
      now: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.scale(scale, scale);

      const len = 280;
      // Engine glow trail (gold + purple nebula)
      const trailG = ctx.createLinearGradient(-len, 0, 40, 0);
      trailG.addColorStop(0, 'transparent');
      trailG.addColorStop(0.3, `rgba(180, 80, 255, ${0.35 * headGlow})`);
      trailG.addColorStop(0.55, `rgba(255, 180, 80, ${0.55 * headGlow})`);
      trailG.addColorStop(0.85, `rgba(255, 220, 150, ${0.25 * headGlow})`);
      trailG.addColorStop(1, 'transparent');
      ctx.fillStyle = trailG;
      ctx.fillRect(-len, -25, len + 40, 50);

      // Hull
      const hull = ctx.createLinearGradient(-80, -20, 120, 20);
      hull.addColorStop(0, '#1a2848');
      hull.addColorStop(0.5, '#2a3a5c');
      hull.addColorStop(1, '#3d4a6a');
      ctx.fillStyle = hull;
      ctx.strokeStyle = 'rgba(94, 234, 212, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-70, 18);
      ctx.lineTo(90, 12);
      ctx.quadraticCurveTo(130, 8, 145, 2);
      ctx.lineTo(150, -2);
      ctx.lineTo(145, -14);
      ctx.quadraticCurveTo(120, -18, 60, -16);
      ctx.lineTo(-60, -14);
      ctx.quadraticCurveTo(-75, -14, -70, 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Windows (cyan glow)
      for (let i = 0; i < 5; i++) {
        const wx = -30 + i * 28;
        const pulse = 0.7 + Math.sin(now * 0.004 + i) * 0.3;
        ctx.fillStyle = `rgba(94, 234, 212, ${0.5 * pulse * headGlow})`;
        ctx.shadowColor = 'rgba(94, 234, 212, 0.9)';
        ctx.shadowBlur = 12;
        ctx.fillRect(wx, -4, 18, 8);
      }
      ctx.shadowBlur = 0;

      // Headlight + lens flare
      const flare = ctx.createRadialGradient(148, 0, 0, 148, 0, 80);
      flare.addColorStop(0, `rgba(255, 255, 255, ${headGlow})`);
      flare.addColorStop(0.15, `rgba(200, 230, 255, ${0.7 * headGlow})`);
      flare.addColorStop(0.4, `rgba(124, 180, 255, ${0.2 * headGlow})`);
      flare.addColorStop(1, 'transparent');
      ctx.fillStyle = flare;
      ctx.fillRect(60, -50, 120, 100);

      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(148, 0, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Horizontal flare streak
      ctx.fillStyle = `rgba(255,255,255,${0.15 * headGlow})`;
      ctx.fillRect(100, -2, 200, 4);

      ctx.restore();
    };

    const drawCinema = (p: number, now: number) => {
      const cinema = Math.min(1, Math.max(0, (p - 0.22) / 0.5));
      const fadeLore = p > 0.62 ? Math.min(1, (p - 0.62) / 0.12) : 0;

      // Space background
      const sky = ctx.createLinearGradient(0, 0, w, h);
      sky.addColorStop(0, '#0a0e1e');
      sky.addColorStop(0.5, '#12182a');
      sky.addColorStop(1, '#060810');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Nebula
      const neb = ctx.createRadialGradient(w * 0.85, h * 0.15, 0, w * 0.7, h * 0.3, w * 0.6);
      neb.addColorStop(0, `rgba(124, 92, 255, ${0.2 * cinema})`);
      neb.addColorStop(0.5, `rgba(60, 40, 120, ${0.12 * cinema})`);
      neb.addColorStop(1, 'transparent');
      ctx.fillStyle = neb;
      ctx.fillRect(0, 0, w, h);

      // Distant stars
      for (let i = 0; i < 80; i++) {
        const sx = ((i * 137.5) % w);
        const sy = ((i * 97.3) % h);
        const tw = 0.4 + Math.sin(now * 0.002 + i) * 0.3;
        ctx.fillStyle = `rgba(255,255,255,${tw * 0.5 * cinema})`;
        ctx.fillRect(sx, sy, 1 + (i % 2), 1);
      }

      const planetCx = w * 0.38;
      const planetCy = h * 0.48;
      drawPlanet(planetCx, planetCy, Math.min(w, h) * 0.32, cinema * (1 - fadeLore * 0.7), now);
      drawAsteroids(cinema, 0, 0, now);

      const trainT = Math.min(1, Math.max(0, (p - 0.26) / 0.38));
      const { x, y, angle, scale, ease } = trainPath(trainT, w, h);

      drawTrails();
      if (now - lastTrailSpawn > 16 && trainT > 0.05 && trainT < 0.95) {
        spawnTrail(x - 40, y + 10, ease);
        lastTrailSpawn = now;
      }

      drawTrainOnCanvas(x, y, angle, scale * 1.1, cinema * ease, now);

      // Rim light from top-right (game lighting)
      const rim = ctx.createLinearGradient(w, 0, 0, h);
      rim.addColorStop(0, `rgba(180, 220, 255, ${0.12 * cinema})`);
      rim.addColorStop(0.4, 'transparent');
      ctx.fillStyle = rim;
      ctx.fillRect(0, 0, w, h);

      if (fadeLore > 0) {
        ctx.fillStyle = `rgba(3, 5, 8, ${fadeLore * 0.85})`;
        ctx.fillRect(0, 0, w, h);
      }
    };

    const drawFlash = (flash: number) => {
      ctx.fillStyle = `rgba(255, 255, 255, ${flash})`;
      ctx.fillRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.5);
      g.addColorStop(0, `rgba(255, 216, 117, ${flash * 0.5})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    };

    const draw = (now: number) => {
      time = now;
      const p = progressRef.current;
      const phase = phaseFromProgress(p);

      if (phase === 'logo') {
        drawLogoPhase(p, now);
      } else if (phase === 'warp') {
        const warp = easeInOutCubic(Math.min(1, (p - 0.1) / 0.2));
        drawWarpTunnel(warp, now);
      } else if (phase === 'cinema' || phase === 'toast') {
        drawCinema(p, now);
      } else if (phase === 'lore') {
        ctx.fillStyle = '#050810';
        ctx.fillRect(0, 0, w, h);
        // subtle dust
        for (let i = 0; i < 40; i++) {
          ctx.fillStyle = `rgba(255,255,255,${0.03 + Math.sin(now * 0.001 + i) * 0.02})`;
          ctx.fillRect((i * 73) % w, (i * 41) % h, 1, 1);
        }
      } else if (phase === 'flash' || phase === 'out') {
        const flash = phase === 'flash' ? Math.min(1, (p - 0.86) / 0.08) : 0;
        if (flash > 0) drawFlash(flash * 0.95);
        else {
          ctx.fillStyle = '#050810';
          ctx.fillRect(0, 0, w, h);
        }
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

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden />;
}
