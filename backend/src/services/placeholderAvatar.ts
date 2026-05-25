/** 外链立绘不可用时的 SVG 占位（如绯英 1505 CDN 未上线） */
export function createPlaceholderAvatar(name: string, element?: string): Buffer {
  const initial = (name || '?').replace(/[^\u4e00-\u9fa5a-zA-Z0-9·]/g, '').slice(0, 1) || '?';
  const accent =
    element === '物理' ? '#f472b6' :
    element === '火' ? '#f87171' :
    element === '冰' ? '#67e8f9' :
    element === '雷' ? '#a78bfa' :
    element === '风' ? '#4ade80' :
    element === '量子' ? '#818cf8' :
    element === '虚数' ? '#fbbf24' :
    '#e8b84a';

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="376" height="512" viewBox="0 0 376 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#141c32"/>
      <stop offset="55%" stop-color="#0a0e1a"/>
      <stop offset="100%" stop-color="#1a1030"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="38%" r="45%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="376" height="512" fill="url(#bg)"/>
  <rect width="376" height="512" fill="url(#glow)"/>
  <circle cx="188" cy="200" r="72" fill="${accent}" fill-opacity="0.12" stroke="${accent}" stroke-opacity="0.45" stroke-width="2"/>
  <text x="188" y="220" text-anchor="middle" font-size="64" font-family="system-ui,sans-serif" fill="${accent}" fill-opacity="0.9">${initial}</text>
  <text x="188" y="420" text-anchor="middle" font-size="22" font-family="system-ui,sans-serif" fill="#e5e7eb" fill-opacity="0.85">${escapeXml(name)}</text>
  <text x="188" y="452" text-anchor="middle" font-size="12" font-family="system-ui,sans-serif" fill="#9ca3af">立绘同步中</text>
</svg>`;

  return Buffer.from(svg, 'utf-8');
}

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
