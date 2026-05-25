import 'dotenv/config';
import { syncLocalMusicToDb } from '../src/services/musicSync.js';

syncLocalMusicToDb()
  .then((tracks) => {
    if (tracks.length) {
      console.log(`✅ 已同步 ${tracks.length} 首歌曲到播放列表：`);
      tracks.forEach((t) => console.log(`   · ${t.artist ?? '未知'} - ${t.title}`));
    } else {
      console.log('未找到 music/ 目录下的音频，请将 .mp3 / .flac 文件放入项目根目录的 music/ 文件夹');
    }
  })
  .catch(console.error);
