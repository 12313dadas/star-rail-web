import { prisma } from '../lib/prisma.js';
import { scanLocalTracks } from '../utils/localMusic.js';

/** 将 music/ 目录下的音频同步到数据库，替换旧的演示曲目 */
export async function syncLocalMusicToDb() {
  const locals = scanLocalTracks();
  if (!locals.length) {
    console.warn('⚠️  music/ 目录下未找到音频文件，跳过音乐同步');
    return [];
  }

  await prisma.musicTrack.deleteMany({});

  const created = await prisma.$transaction(
    locals.map((t) =>
      prisma.musicTrack.create({
        data: {
          title: t.title,
          artist: t.artist,
          url: t.url,
          sortOrder: t.sortOrder,
          active: true,
        },
      })
    )
  );

  return created;
}
