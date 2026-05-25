import 'dotenv/config';
import app from './app.js';
import { prisma } from './lib/prisma.js';
import { syncLocalMusicToDb } from './services/musicSync.js';

const PORT = Number(process.env.PORT) || 3001;

async function ensureSquadsSchema() {
  try {
    await prisma.character.findFirst({ select: { gameId: true, region: true } });
    await prisma.squad.findFirst({ select: { scenario: true, videoUrl: true } });
  } catch (err) {
    console.error(
      '\n❌ 数据库结构过旧，阵容 API 会 500。请在 backend 目录执行：\n' +
        '   npm run db:setup\n',
    );
    throw err;
  }
}

async function main() {
  await prisma.$connect();
  await ensureSquadsSchema();

  const charCount = await prisma.character.count();
  if (charCount === 0) {
    console.log('⚔️ 角色库为空，正在自动导入…');
    const { execSync } = await import('child_process');
    execSync('npm run characters:seed', { stdio: 'inherit', cwd: process.cwd() });
  }

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
