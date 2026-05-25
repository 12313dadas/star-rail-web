import { useEffect, useState } from 'react';
import type { Character } from '../../types';
import { ELEMENT_STYLE } from '../../lib/hsrTheme';

interface Props {
  character: Character;
  size?: 'sm' | 'md' | 'lg';
  showMeta?: boolean;
  onClick?: () => void;
  className?: string;
}

const SIZE = {
  sm: 'aspect-[3/4] w-full min-h-[88px]',
  md: 'aspect-[3/4] w-full min-h-[120px]',
  lg: 'aspect-[3/4] w-full min-h-[160px]',
};

function resolveSrc(character: Character) {
  if (character.gameId) return `/api/squads/avatar/${character.gameId}?v=2`;
  const legacy = character.icon || character.preview || '';
  if (legacy.startsWith('/api/')) return legacy;
  if (/^https?:\/\//i.test(legacy)) return '';
  return legacy;
}

function fitClass(ratio: number) {
  if (ratio >= 0.92 && ratio <= 1.08) {
    return 'object-contain object-center p-2 scale-[1.08]';
  }
  return 'object-contain object-center';
}

export default function CharacterPortrait({
  character,
  size = 'md',
  showMeta = true,
  onClick,
  className = '',
}: Props) {
  const el = ELEMENT_STYLE[character.element] ?? ELEMENT_STYLE.物理;
  const [src, setSrc] = useState(resolveSrc(character));
  const [broken, setBroken] = useState(false);
  const [imgFit, setImgFit] = useState('object-contain object-center');

  useEffect(() => {
    setSrc(resolveSrc(character));
    setBroken(false);
    setImgFit('object-contain object-center');
  }, [character.id, character.gameId, character.icon]);

  return (
    <div
      className={`relative w-full min-w-0 rounded-xl overflow-hidden border border-white/10 bg-gradient-to-b from-indigo-950/50 via-star-panel/60 to-star-void group ${SIZE[size]} ${onClick ? 'cursor-pointer hover:border-star-gold/40 transition-all' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {character.rarity === 5 && (
        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/15 via-transparent to-purple-500/10 pointer-events-none z-[1]" />
      )}

      {!broken && src ? (
        <img
          src={src}
          alt={character.name}
          className={`absolute inset-0 w-full h-full transition-transform duration-300 group-hover:scale-[1.02] ${imgFit}`}
          loading="lazy"
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
              setImgFit(fitClass(img.naturalWidth / img.naturalHeight));
            }
          }}
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 z-[1] bg-gradient-to-br from-star-purple/30 to-star-navy">
          <span className="text-2xl font-display text-star-gold/80 mb-1">
            {character.name.slice(0, 1)}
          </span>
          <span className="text-[10px] text-gray-400 text-center leading-tight">{character.name}</span>
          <span className="text-[9px] text-gray-600 mt-1">立绘加载中</span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent z-[2] pointer-events-none" />
      <div className="absolute top-1.5 left-1.5 z-[3] flex flex-wrap gap-1">
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ring-1 ${el.bg} ${el.text} ${el.ring}`}>
          {character.element}
        </span>
        {character.rarity === 5 && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-star-gold/20 text-star-gold ring-1 ring-star-gold/40">
            ★5
          </span>
        )}
      </div>
      {showMeta && (
        <div className="absolute bottom-0 left-0 right-0 p-2 z-[3]">
          <p className={`text-xs font-bold truncate ${character.rarity === 5 ? 'text-star-gold' : 'text-white'}`}>
            {character.name}
          </p>
          <p className="text-[10px] text-gray-400 truncate">
            {character.region ? `${character.region} · ` : ''}
            {character.path}
          </p>
        </div>
      )}
    </div>
  );
}
