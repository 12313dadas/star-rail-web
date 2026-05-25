import { Play, Pause, Disc3 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useMusic } from '../contexts/MusicContext';

export default function MusicPage() {
  const { tracks, current, playing, playAt, toggle } = useMusic();

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="音乐库"
        subtitle="项目 music/ 文件夹中的星铁 BGM，已同步至全站播放器"
        icon={<Disc3 className="w-8 h-8" />}
      />

      {tracks.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <p>暂无音乐。请将 .mp3 / .flac 放入项目根目录 <code className="text-star-cyan">music/</code> 后运行：</p>
          <p className="mt-2 font-mono text-sm text-star-gold">npm run music:sync</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {tracks.map((t, i) => {
            const active = i === current;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => (active && playing ? toggle() : playAt(i))}
                  className={`card w-full flex items-center gap-4 text-left transition-all ${
                    active ? 'border-star-gold/40 shadow-gold-glow' : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      active ? 'bg-star-purple/40' : 'bg-white/5'
                    }`}
                  >
                    {active && playing ? (
                      <Pause className="w-4 h-4 text-star-gold" />
                    ) : (
                      <Play className="w-4 h-4 text-star-gold ml-0.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${active ? 'text-star-gold' : 'text-gray-200'}`}>
                      {t.title}
                    </p>
                    {t.artist && (
                      <p className="text-sm text-gray-500 truncate">{t.artist}</p>
                    )}
                  </div>
                  {active && (
                    <span className="text-[10px] text-star-cyan tracking-widest uppercase shrink-0">
                      {playing ? '播放中' : '已选中'}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
