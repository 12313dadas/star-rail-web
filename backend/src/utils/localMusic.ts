import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const AUDIO_EXT = /\.(mp3|flac|wav|ogg|m4a|aac)$/i;

export interface LocalTrackMeta {
  filename: string;
  url: string;
  title: string;
  artist: string | null;
  sortOrder: number;
}

export function getMusicDir(): string {
  if (process.env.MUSIC_DIR) {
    return path.resolve(process.env.MUSIC_DIR);
  }
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, '../../../music');
}

export function parseTrackMeta(filename: string, sortOrder: number): LocalTrackMeta {
  const base = path.parse(filename).name;
  const dashIdx = base.indexOf(' - ');
  const artist = dashIdx > 0 ? base.slice(0, dashIdx).trim() : null;
  const title = dashIdx > 0 ? base.slice(dashIdx + 3).trim() : base.trim();

  return {
    filename,
    url: `/music/${encodeURIComponent(filename)}`,
    title,
    artist,
    sortOrder,
  };
}

export function scanLocalTracks(): LocalTrackMeta[] {
  const dir = getMusicDir();
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => AUDIO_EXT.test(f))
    .sort((a, b) => a.localeCompare(b, 'zh-CN'))
    .map((filename, i) => parseTrackMeta(filename, i));
}
