export type IntroPhase =
  | 'logo'
  | 'warp'
  | 'cinema'
  | 'toast'
  | 'lore'
  | 'flash'
  | 'out';

export function phaseFromProgress(p: number): IntroPhase {
  if (p < 0.14) return 'logo';
  if (p < 0.3) return 'warp';
  if (p < 0.58) return 'cinema';
  if (p < 0.72) return 'toast';
  if (p < 0.86) return 'lore';
  if (p < 0.94) return 'flash';
  return 'out';
}

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutExpo(t: number) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/** Train position along diagonal cinematic path */
export function trainPath(t: number, w: number, h: number) {
  const ease = easeInOutCubic(Math.min(1, Math.max(0, t)));
  const x = w * (-0.12 + ease * 1.18);
  const y = h * (0.78 - ease * 0.52);
  const angle = -0.32 + ease * 0.04;
  const scale = 0.55 + ease * 0.55;
  return { x, y, angle, scale, ease };
}
