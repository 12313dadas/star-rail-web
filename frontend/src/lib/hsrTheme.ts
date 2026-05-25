export const ELEMENT_STYLE: Record<string, { bg: string; text: string; ring: string; glow: string }> = {
  物理: { bg: 'bg-zinc-500/20', text: 'text-zinc-200', ring: 'ring-zinc-400/40', glow: 'shadow-zinc-500/20' },
  火: { bg: 'bg-red-500/20', text: 'text-red-300', ring: 'ring-red-400/50', glow: 'shadow-red-500/30' },
  冰: { bg: 'bg-cyan-500/20', text: 'text-cyan-300', ring: 'ring-cyan-400/50', glow: 'shadow-cyan-500/30' },
  雷: { bg: 'bg-violet-500/20', text: 'text-violet-300', ring: 'ring-violet-400/50', glow: 'shadow-violet-500/30' },
  风: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', ring: 'ring-emerald-400/50', glow: 'shadow-emerald-500/30' },
  量子: { bg: 'bg-indigo-500/20', text: 'text-indigo-300', ring: 'ring-indigo-400/50', glow: 'shadow-indigo-500/30' },
  虚数: { bg: 'bg-amber-500/20', text: 'text-amber-300', ring: 'ring-amber-400/50', glow: 'shadow-amber-500/30' },
  记忆: { bg: 'bg-sky-500/20', text: 'text-sky-300', ring: 'ring-sky-400/50', glow: 'shadow-sky-500/30' },
};

export const REGIONS = ['', '匹诺康尼', '翁法罗斯', '二相乐园', '仙舟', '异界', '开拓者'];

export const PATH_STYLE: Record<string, string> = {
  毁灭: 'from-red-900/40 to-orange-900/20',
  巡猎: 'from-cyan-900/40 to-blue-900/20',
  智识: 'from-violet-900/40 to-purple-900/20',
  同谐: 'from-pink-900/40 to-rose-900/20',
  虚无: 'from-purple-900/40 to-indigo-900/20',
  丰饶: 'from-green-900/40 to-emerald-900/20',
  存护: 'from-blue-900/40 to-slate-900/20',
  记忆: 'from-sky-900/40 to-cyan-900/20',
  欢愉: 'from-yellow-900/40 to-amber-900/20',
};

export const SCENARIOS = ['忘却之庭', '虚构叙事', '末日幻影', '差分宇宙', '历战余响', '日常刷本', '模拟宇宙'];
