import 'dotenv/config';
import { prisma } from '../src/lib/prisma.js';
import { uniqueCharacters } from '../src/data/hsrCharacters.js';
import { characterAssetUrls, clearAvatarCache } from '../src/services/characterAssets.js';

async function main() {
  clearAvatarCache();
  console.log('🗑️ 已清空旧立绘缓存');

  const list = uniqueCharacters();
  await prisma.character.deleteMany({});

  for (const c of list) {
    const assets = characterAssetUrls(c.gameId);
    await prisma.character.create({
      data: {
        gameId: c.gameId,
        name: c.name,
        rarity: c.rarity,
        element: c.element,
        path: c.path,
        region: c.region ?? null,
        icon: assets.icon,
        preview: assets.preview,
      },
    });
  }

  console.log(`✅ 已重新导入 ${list.length} 名角色（ID 已对齐官网）`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
