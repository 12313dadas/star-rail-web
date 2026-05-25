import { useEffect, useRef, useState } from 'react';

interface Props {
  /** 目标数值 */
  value: number;
  /** 持续时间 (ms) */
  duration?: number;
  /** 格式化显示 */
  format?: (n: number) => string;
  className?: string;
  /** 小数位数 */
  decimals?: number;
}

/** 进入视口时从 0 递增到目标值的数字动画 */
export default function AnimatedCounter({
  value,
  duration = 1500,
  format,
  className = '',
  decimals = 0,
}: Props) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);
  const rafRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const start = performance.now();

          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(eased * value);

            if (progress < 1) {
              rafRef.current = requestAnimationFrame(tick);
            } else {
              setDisplay(value);
            }
          };

          rafRef.current = requestAnimationFrame(tick);
          obs.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const formatted = format
    ? format(display)
    : display.toFixed(decimals);

  return (
    <span ref={ref} className={className}>
      {formatted}
    </span>
  );
}
