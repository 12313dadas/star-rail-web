import { useRef, useCallback, type ReactNode, type MouseEvent } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  /** 最大倾斜角度 (deg) */
  maxTilt?: number;
  /** 是否启用光泽效果 */
  glare?: boolean;
  /** 缩放比例 on hover */
  scale?: number;
  /** 点击回调 */
  onClick?: () => void;
}

/** 3D 透视倾斜卡片 —— 鼠标移动时产生跟随视角 */
export default function TiltCard({
  children,
  className = '',
  maxTilt = 8,
  glare = true,
  scale = 1.02,
  onClick,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const ticking = useRef(false);

  const handleMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (ticking.current) return;
    ticking.current = true;

    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) { ticking.current = false; return; }
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const tiltX = (y - 0.5) * -maxTilt;
      const tiltY = (x - 0.5) * maxTilt;

      el.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale},${scale},${scale})`;

      if (glare && glareRef.current) {
        glareRef.current.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.12) 0%, transparent 60%)`;
        glareRef.current.style.opacity = '1';
      }
      ticking.current = false;
    });
  }, [maxTilt, scale, glare]);

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = `perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`;
    el.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
    setTimeout(() => { if (el) el.style.transition = ''; }, 500);
    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      style={{
        transformStyle: 'preserve-3d',
        cursor: onClick ? 'pointer' : undefined,
        position: 'relative',
      }}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            opacity: 0,
            transition: 'opacity 0.3s',
            zIndex: 2,
          }}
        />
      )}
    </div>
  );
}
