import 'dotenv/config';
import app from './app.js';
import { prisma } from './lib/prisma.js';
import { syncLocalMusicToDb } from './services/musicSync.js';

const PORT = Number(process.env.PORT) || 3001;

async function main() {
  await prisma.$connect();

  if (process.env.MUSIC_AUTO_SYNC !== 'false') {
    try {
      const tracks = await syncLocalMusicToDb();
      if (tracks.length) {
        console.log(`🎵 已同步 ${tracks.length} 首本地音乐到播放列表`);
      }
    } catch (err) {
      console.warn('音乐同步跳过:', err);
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 API running at http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
