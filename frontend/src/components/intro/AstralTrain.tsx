/** 星穹列车 SVG — 比图标库更贴近官网气质 */
export default function AstralTrain({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 80"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="hull" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2a3560" />
          <stop offset="50%" stopColor="#1a2240" />
          <stop offset="100%" stopColor="#0f1428" />
        </linearGradient>
        <linearGradient id="goldEdge" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c5cff" />
          <stop offset="50%" stopColor="#e8b84a" />
          <stop offset="100%" stopColor="#5eead4" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="goldGlow">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 尾迹光带 */}
      <path
        d="M0 42 L80 40 L120 38 L160 40"
        stroke="url(#goldEdge)"
        strokeWidth="2"
        strokeOpacity="0.5"
        strokeLinecap="round"
      />

      {/* 车身 */}
      <path
        d="M70 48 L250 44 Q280 42 300 40 L310 38 L305 52 Q280 58 200 56 L90 54 Q75 54 70 48 Z"
        fill="url(#hull)"
        stroke="url(#goldEdge)"
        strokeWidth="1.5"
        filter="url(#glow)"
      />

      {/* 车窗 */}
      {[110, 150, 190, 230].map((x, i) => (
        <rect
          key={x}
          x={x}
          y={44}
          width={28}
          height={10}
          rx={2}
          fill={`rgba(94, 234, 212, ${0.15 + i * 0.05})`}
          stroke="rgba(232, 184, 74, 0.4)"
          strokeWidth="0.8"
        />
      ))}

      {/* 车头灯 */}
      <ellipse cx="298" cy="42" rx="8" ry="5" fill="#ffd875" filter="url(#goldGlow)" opacity="0.9" />
      <ellipse cx="298" cy="42" rx="4" ry="2.5" fill="#fff" opacity="0.95" />

      {/* 顶部天线 / 信标 */}
      <line x1="180" y1="38" x2="180" y2="22" stroke="#e8b84a" strokeWidth="1.5" opacity="0.8" />
      <circle cx="180" cy="20" r="4" fill="#7c5cff" filter="url(#goldGlow)" />
      <circle cx="180" cy="20" r="2" fill="#fff" />
    </svg>
  );
}
