import { useEffect, useRef, useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  /** 动画方向: up / down / left / right / fade / zoom */
  animation?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'zoom';
  /** 延迟 (ms) */
  delay?: number;
  /** 一次触发后是否保持可见 */
  once?: boolean;
  /** IntersectionObserver 阈值 */
  threshold?: number;
  /** 根边距 (提前触发) */
  rootMargin?: string;
  /** 子元素是否需要 stagger 延迟 */
  stagger?: boolean;
  staggerDelay?: number;
}

const variants: Record<string, string> = {
  up: 'translateY(40px)',
  down: 'translateY(-40px)',
  left: 'translateX(-40px)',
  right: 'translateX(40px)',
  fade: 'translateY(0)',
  zoom: 'scale(0.92)',
};

export default function ScrollReveal({
  children,
  className = '',
  animation = 'up',
  delay = 0,
  once = true,
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  stagger = false,
  staggerDelay = 80,
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Small delay to ensure mount transition works
          requestAnimationFrame(() => setRevealed(true));
          if (once) obs.unobserve(el);
        } else if (!once) {
          setRevealed(false);
        }
      },
      { threshold, rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [once, threshold, rootMargin]);

  const base: React.CSSProperties = {
    transition: `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)`,
    opacity: 0,
    transform: variants[animation],
    transitionDelay: `${delay}ms`,
  };

  if (revealed) {
    base.opacity = 1;
    base.transform = 'translateY(0) scale(1)';
  }

  // If stagger, apply to direct children
  if (stagger) {
    return (
      <div ref={ref} className={className} style={{ opacity: revealed ? 1 : 0, transition: `opacity 0.3s ${delay}ms` }}>
        <div className="sr-stagger-wrap" style={{ position: 'relative' }}>
          {Array.isArray(children)
            ? children.map((child, i) => (
                <div
                  key={i}
                  style={{
                    ...base,
                    transitionDelay: `${delay + i * staggerDelay}ms`,
                  }}
                >
                  {child}
                </div>
              ))
            : children}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={className} style={base}>
      {children}
    </div>
  );
}
