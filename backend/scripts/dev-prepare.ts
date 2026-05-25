import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { prisma } from '../src/lib/prisma.js';

const schema = 'prisma/schema.sqlite.prisma';
const engine = path.join(
  process.cwd(),
  'node_modules',
  '.prisma',
  'client',
  'query_engine-windows.dll.node',
);

function run(cmd: string) {
  execSync(cmd, { stdio: 'inherit', cwd: process.cwd(), env: process.env });
}

const CHARACTER_SEED_VERSION = 4;

async function needsCharacterReseed() {
  const count = await prisma.character.count();
  if (count === 0) return true;
  const ver = await prisma.siteSetting.findUnique({ where: { key: 'character_seed_version' } });
  if (!ver || Number(ver.value) < CHARACTER_SEED_VERSION) return true;
  const mydei = await prisma.character.findFirst({ where: { name: '万敌' }, select: { gameId: true } });
  if (mydei?.gameId !== '1404') return true;
  // 立绘显示策略升级后需清空旧缓存
  const cacheDir = path.join(process.cwd(), 'uploads', 'character-icons');
  if (!fs.existsSync(cacheDir)) return false;
  const hasMeta = fs.readdirSync(cacheDir).some((f) => f.endsWith('.meta.json'));
  return !hasMeta;
}

async function main() {
  // 不触发 generate，避免与正在运行的后端抢 query_engine 文件锁
  run(`npx prisma db push --schema ${schema} --skip-generate`);

  if (!fs.existsSync(engine)) {
    console.log('📦 首次生成 Prisma Client…');
    run(`npx prisma generate --schema ${schema}`);
  }

  if (await needsCharacterReseed()) {
    console.log('⚔️ 同步角色库（官网 ID + 立绘）…');
    run('npm run characters:seed');
    await prisma.siteSetting.upsert({
      where: { key: 'character_seed_version' },
      create: { key: 'character_seed_version', value: String(CHARACTER_SEED_VERSION) },
      update: { value: String(CHARACTER_SEED_VERSION) },
    });
  } else {
    const count = await prisma.character.count();
    console.log(`✅ 数据库就绪（${count} 名角色）`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
