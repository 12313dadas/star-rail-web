import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/prisma.js';
import { createPlaceholderAvatar } from './placeholderAvatar.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
export const ICON_CACHE_DIR = path.resolve(UPLOAD_DIR, 'character-icons');

export type AvatarKind = 'card' | 'icon';

export function avatarApiPath(gameId: string) {
  return `/api/squads/avatar/${gameId}`;
}

export function characterAssetUrls(gameId: string) {
  const api = avatarApiPath(gameId);
  return { icon: api, preview: api };
}

export function mapCharacterForClient<T extends {
  gameId?: string | null;
  icon?: string | null;
  preview?: string | null;
}>(c: T): T {
  if (!c.gameId) return c;
  const api = avatarApiPath(c.gameId);
  return { ...c, icon: api, preview: api };
}

function avatarSources(gameId: string): { url: string; kind: AvatarKind }[] {
  return [
  {
    url: `https://wikistatic.bittopup.com/hsr/assets/UI/avatar/medium/${gameId}.png`,
    kind: 'card',
  },
  {
    url: `https://cdn.jsdelivr.net/gh/Dimbreath/StarRailData@master/Unity/Assets/AsbRes/SpriteOutput/AvatarDrawcut/AvatarDrawcutFront/AvatarDrawcutFront_${gameId}.png`,
    kind: 'card',
  },
  {
    url: `https://cdn.jsdelivr.net/gh/ScobbleQ/HoYo-Assets@main/starrail/icon/${gameId}.png`,
    kind: 'icon',
  },
  {
    url: `https://cdn.jsdelivr.net/gh/Dimbreath/StarRailData@master/Unity/Assets/AsbRes/SpriteOutput/AvatarIcon/Avatar/Avatar_${gameId}.png`,
    kind: 'icon',
  },
  {
    url: `https://cdn.jsdelivr.net/gh/ScobbleQ/HoYo-Assets@main/starrail/wish/${gameId}.png`,
    kind: 'card',
  },
  {
    url: `https://raw.githubusercontent.com/ScobbleQ/HoYo-Assets/main/starrail/icon/${gameId}.png`,
    kind: 'icon',
  },
  ];
}

function metaPath(gameId: string) {
  return path.join(ICON_CACHE_DIR, `${gameId}.meta.json`);
}

export function readCachedAvatarMeta(gameId: string): AvatarKind | null {
  const file = metaPath(gameId);
  if (!fs.existsSync(file)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf-8')) as { kind?: AvatarKind };
    return data.kind === 'icon' ? 'icon' : data.kind === 'card' ? 'card' : null;
  } catch {
    return null;
  }
}

/** 多源拉取，命中后写入本地缓存（解决 GitHub 在国内无法直连） */
export async function fetchAndCacheAvatar(gameId: string): Promise<Buffer | null> {
  if (!fs.existsSync(ICON_CACHE_DIR)) fs.mkdirSync(ICON_CACHE_DIR, { recursive: true });

  for (const { url, kind } of avatarSources(gameId)) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'star-rail-personal-web/1.0' },
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 500) continue;
      fs.writeFileSync(path.join(ICON_CACHE_DIR, `${gameId}.png`), buf);
      fs.writeFileSync(metaPath(gameId), JSON.stringify({ kind, url }));
      return buf;
    } catch {
      /* try next */
    }
  }
  return null;
}

export async function resolveAvatarBuffer(gameId: string): Promise<{ buf: Buffer; kind: 'image' | 'svg' } | null> {
  let buf = readCachedAvatar(gameId);
  if (!buf) buf = await fetchAndCacheAvatar(gameId);
  if (buf) return { buf, kind: 'image' };

  const row = await prisma.character.findFirst({
    where: { gameId },
    select: { name: true, element: true },
  });
  const svg = createPlaceholderAvatar(row?.name ?? gameId, row?.element);
  return { buf: svg, kind: 'svg' };
}

export function readCachedAvatar(gameId: string): Buffer | null {
  const file = path.join(ICON_CACHE_DIR, `${gameId}.png`);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file);
}

export function clearAvatarCache() {
  if (!fs.existsSync(ICON_CACHE_DIR)) return;
  for (const file of fs.readdirSync(ICON_CACHE_DIR)) {
    fs.unlinkSync(path.join(ICON_CACHE_DIR, file));
  }
}
