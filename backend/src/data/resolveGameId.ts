import gameIds from './characterGameIds.json' with { type: 'json' };

/** 官网角色编号（BitTopup Wiki 同步），解决 1404/1405 等错位 */
const BY_NAME = new Map<string, string>();
for (const row of gameIds) {
  BY_NAME.set(normalizeName(row.name), row.gameId);
}

/** 多命途开拓者等 Wiki 未单独列出的 ID */
const OVERRIDES: Record<string, string> = {
  '开拓者·毁灭': '8001',
  '开拓者·存护': '8002',
  '开拓者·同谐': '8003',
  '开拓者·记忆': '8004',
  '开拓者·欢愉': '8005',
  '开拓者·巡猎': '8006',
};

/** 站内显示名 → Wiki 名 */
const ALIASES: Record<string, string> = {
  阮梅: '阮·梅',
  托帕: '托帕&账账',
};

export function normalizeName(name: string): string {
  return name.replace(/[•·]/g, '·').replace(/\s+/g, '').trim();
}

export function resolveGameId(name: string, fallback?: string): string {
  const key = normalizeName(name);
  if (OVERRIDES[name]) return OVERRIDES[name];
  if (ALIASES[key]) {
    const aliased = BY_NAME.get(normalizeName(ALIASES[key]));
    if (aliased) return aliased;
  }
  const direct = BY_NAME.get(key);
  if (direct) return direct;
  for (const [wikiName, id] of BY_NAME) {
    if (wikiName.includes(key) || key.includes(wikiName)) return id;
  }
  return fallback ?? '';
}
