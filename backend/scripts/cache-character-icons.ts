import 'dotenv/config';
import { uniqueCharacters } from '../src/data/hsrCharacters.js';
import { fetchAndCacheAvatar } from '../src/services/characterAssets.js';

async function main() {
  const list = uniqueCharacters();
  let ok = 0;
  let fail = 0;

  console.log(`开始缓存 ${list.length} 名角色立绘…`);

  for (const c of list) {
    const buf = await fetchAndCacheAvatar(c.gameId);
    if (buf) {
      ok++;
      console.log(`  ✓ ${c.name} (${c.gameId})`);
    } else {
      fail++;
      console.log(`  ✗ ${c.name} (${c.gameId})`);
    }
  }

  console.log(`\n完成：成功 ${ok}，失败 ${fail}`);
  if (fail > 0) {
    console.log('失败项可能 gameId 与资源库不一致，可在 hsrCharacters.ts 中校正。');
  }
}

main().catch(console.error);
