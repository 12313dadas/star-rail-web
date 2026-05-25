/** 角色库：对齐 HoYoWiki / 官网角色页，含匹诺康尼、翁法罗斯、联动等 */
import { resolveGameId } from './resolveGameId.js';

export interface HsrCharacterSeed {
  gameId: string;
  name: string;
  rarity: number;
  element: string;
  path: string;
  region?: string;
}

export const HSR_CHARACTERS: HsrCharacterSeed[] = [
  // —— 空间站 · 雅利洛 ——
  { gameId: '1001', name: '三月七', rarity: 4, element: '冰', path: '存护', region: '空间站' },
  { gameId: '1002', name: '丹恒', rarity: 4, element: '风', path: '巡猎', region: '空间站' },
  { gameId: '1003', name: '姬子', rarity: 5, element: '火', path: '智识', region: '空间站' },
  { gameId: '1004', name: '瓦尔特', rarity: 5, element: '虚数', path: '虚无', region: '雅利洛' },
  { gameId: '1005', name: '卡芙卡', rarity: 5, element: '雷', path: '虚无', region: '星核猎手' },
  { gameId: '1006', name: '银狼', rarity: 5, element: '量子', path: '虚无', region: '星核猎手' },
  { gameId: '1008', name: '阿兰', rarity: 4, element: '雷', path: '毁灭', region: '空间站' },
  { gameId: '1009', name: '艾丝妲', rarity: 4, element: '火', path: '同谐', region: '空间站' },
  { gameId: '1013', name: '黑塔', rarity: 4, element: '冰', path: '智识', region: '空间站' },
  { gameId: '1101', name: '布洛妮娅', rarity: 5, element: '风', path: '同谐', region: '雅利洛' },
  { gameId: '1102', name: '希儿', rarity: 5, element: '量子', path: '巡猎', region: '雅利洛' },
  { gameId: '1103', name: '希露瓦', rarity: 4, element: '雷', path: '智识', region: '雅利洛' },
  { gameId: '1104', name: '杰帕德', rarity: 5, element: '冰', path: '存护', region: '雅利洛' },
  { gameId: '1105', name: '娜塔莎', rarity: 4, element: '物理', path: '丰饶', region: '雅利洛' },
  { gameId: '1106', name: '佩拉', rarity: 4, element: '冰', path: '虚无', region: '雅利洛' },
  { gameId: '1107', name: '克拉拉', rarity: 5, element: '物理', path: '毁灭', region: '雅利洛' },
  { gameId: '1108', name: '桑博', rarity: 4, element: '风', path: '虚无', region: '雅利洛' },
  { gameId: '1109', name: '虎克', rarity: 4, element: '火', path: '毁灭', region: '雅利洛' },
  { gameId: '1110', name: '玲可', rarity: 4, element: '量子', path: '丰饶', region: '雅利洛' },
  { gameId: '1111', name: '卢卡', rarity: 4, element: '虚数', path: '虚无', region: '雅利洛' },
  { gameId: '1112', name: '托帕', rarity: 5, element: '火', path: '巡猎', region: '公司' },
  { gameId: '1201', name: '青雀', rarity: 4, element: '量子', path: '智识', region: '仙舟' },
  { gameId: '1202', name: '停云', rarity: 4, element: '雷', path: '同谐', region: '仙舟' },
  { gameId: '1206', name: '素裳', rarity: 4, element: '物理', path: '巡猎', region: '仙舟' },
  { gameId: '1207', name: '驭空', rarity: 4, element: '虚数', path: '同谐', region: '仙舟' },
  { gameId: '1203', name: '罗刹', rarity: 5, element: '虚数', path: '丰饶', region: '仙舟' },
  { gameId: '1204', name: '景元', rarity: 5, element: '雷', path: '智识', region: '仙舟' },
  { gameId: '1205', name: '刃', rarity: 5, element: '风', path: '毁灭', region: '仙舟' },
  { gameId: '1208', name: '符玄', rarity: 5, element: '量子', path: '存护', region: '仙舟' },
  { gameId: '1209', name: '彦卿', rarity: 5, element: '冰', path: '巡猎', region: '仙舟' },
  { gameId: '1210', name: '桂乃芬', rarity: 4, element: '火', path: '虚无', region: '仙舟' },
  { gameId: '1211', name: '白露', rarity: 5, element: '雷', path: '丰饶', region: '仙舟' },
  { gameId: '1212', name: '镜流', rarity: 5, element: '冰', path: '毁灭', region: '仙舟' },
  { gameId: '1213', name: '丹恒·饮月', rarity: 5, element: '虚数', path: '毁灭', region: '仙舟' },
  { gameId: '1214', name: '雪衣', rarity: 4, element: '量子', path: '虚无', region: '仙舟' },
  { gameId: '1215', name: '寒鸦', rarity: 4, element: '物理', path: '同谐', region: '仙舟' },
  { gameId: '1217', name: '藿藿', rarity: 5, element: '风', path: '丰饶', region: '仙舟' },
  { gameId: '1218', name: '椒丘', rarity: 5, element: '火', path: '虚无', region: '仙舟' },
  { gameId: '1220', name: '飞霄', rarity: 5, element: '风', path: '巡猎', region: '仙舟' },
  { gameId: '1221', name: '云璃', rarity: 5, element: '物理', path: '毁灭', region: '仙舟' },
  { gameId: '1222', name: '灵砂', rarity: 5, element: '火', path: '丰饶', region: '仙舟' },
  { gameId: '1223', name: '貊泽', rarity: 4, element: '雷', path: '虚无', region: '仙舟' },
  { gameId: '1225', name: '忘归人', rarity: 5, element: '火', path: '虚无', region: '仙舟' },
  // —— 匹诺康尼 ——
  { gameId: '1301', name: '加拉赫', rarity: 4, element: '火', path: '丰饶', region: '匹诺康尼' },
  { gameId: '1302', name: '银枝', rarity: 5, element: '物理', path: '智识', region: '公司' },
  { gameId: '1303', name: '阮梅', rarity: 5, element: '冰', path: '同谐', region: '仙舟' },
  { gameId: '1304', name: '砂金', rarity: 5, element: '虚数', path: '存护', region: '匹诺康尼' },
  { gameId: '1305', name: '真理医生', rarity: 5, element: '虚数', path: '巡猎', region: '公司' },
  { gameId: '1306', name: '花火', rarity: 5, element: '量子', path: '同谐', region: '匹诺康尼' },
  { gameId: '1307', name: '黑天鹅', rarity: 5, element: '风', path: '虚无', region: '匹诺康尼' },
  { gameId: '1308', name: '黄泉', rarity: 5, element: '雷', path: '虚无', region: '匹诺康尼' },
  { gameId: '1309', name: '知更鸟', rarity: 5, element: '物理', path: '同谐', region: '匹诺康尼' },
  { gameId: '1310', name: '流萤', rarity: 5, element: '火', path: '毁灭', region: '匹诺康尼' },
  { gameId: '1312', name: '米沙', rarity: 4, element: '冰', path: '毁灭', region: '匹诺康尼' },
  { gameId: '1313', name: '星期日', rarity: 5, element: '虚数', path: '同谐', region: '匹诺康尼' },
  { gameId: '1314', name: '翡翠', rarity: 5, element: '量子', path: '智识', region: '匹诺康尼' },
  { gameId: '1315', name: '波提欧', rarity: 5, element: '物理', path: '巡猎', region: '匹诺康尼' },
  { gameId: '1317', name: '乱破', rarity: 5, element: '虚数', path: '智识', region: '匹诺康尼' },
  // —— 翁法罗斯 ——
  { gameId: '1401', name: '大黑塔', rarity: 5, element: '冰', path: '智识', region: '翁法罗斯' },
  { gameId: '1402', name: '阿格莱雅', rarity: 5, element: '雷', path: '记忆', region: '翁法罗斯' },
  { gameId: '1403', name: '缇宝', rarity: 5, element: '量子', path: '同谐', region: '翁法罗斯' },
  { gameId: '1404', name: '万敌', rarity: 5, element: '虚数', path: '毁灭', region: '翁法罗斯' },
  { gameId: '1405', name: '那刻夏', rarity: 5, element: '风', path: '智识', region: '翁法罗斯' },
  { gameId: '1406', name: '赛飞儿', rarity: 4, element: '量子', path: '虚无', region: '翁法罗斯' },
  { gameId: '1407', name: '遐蝶', rarity: 5, element: '量子', path: '记忆', region: '翁法罗斯' },
  { gameId: '1408', name: '白厄', rarity: 5, element: '物理', path: '毁灭', region: '翁法罗斯' },
  { gameId: '1409', name: '风堇', rarity: 5, element: '风', path: '记忆', region: '翁法罗斯' },
  { gameId: '1410', name: '海瑟音', rarity: 5, element: '雷', path: '虚无', region: '翁法罗斯' },
  { gameId: '1412', name: '刻律德菈', rarity: 4, element: '雷', path: '同谐', region: '翁法罗斯' },
  { gameId: '1413', name: '长夜月', rarity: 5, element: '冰', path: '记忆', region: '翁法罗斯' },
  { gameId: '1414', name: '丹恒·腾荒', rarity: 5, element: '风', path: '存护', region: '翁法罗斯' },
  { gameId: '1415', name: '昔涟', rarity: 5, element: '冰', path: '记忆', region: '翁法罗斯' },
  // —— 二相乐园 4.0 ——
  { gameId: '1501', name: '火花', rarity: 5, element: '火', path: '欢愉', region: '二相乐园' },
  { gameId: '1502', name: '爻光', rarity: 5, element: '物理', path: '欢愉', region: '二相乐园' },
  { gameId: '1505', name: '绯英', rarity: 5, element: '物理', path: '欢愉', region: '二相乐园' },
  { gameId: '1321', name: '大丽花', rarity: 5, element: '风', path: '虚无', region: '二相乐园' },
  { gameId: '1504', name: '不死途', rarity: 5, element: '物理', path: '毁灭', region: '异界' },
  // —— 异界联动 ——
  { gameId: '1015', name: 'Archer', rarity: 5, element: '量子', path: '巡猎', region: '异界' },
  { gameId: '1014', name: 'Saber', rarity: 5, element: '风', path: '毁灭', region: '异界' },
  // —— 开拓者（多命途）——
  { gameId: '8001', name: '开拓者·毁灭', rarity: 5, element: '物理', path: '毁灭', region: '开拓者' },
  { gameId: '8002', name: '开拓者·存护', rarity: 5, element: '火', path: '存护', region: '开拓者' },
  { gameId: '8003', name: '开拓者·同谐', rarity: 5, element: '物理', path: '同谐', region: '开拓者' },
  { gameId: '8004', name: '开拓者·记忆', rarity: 5, element: '冰', path: '记忆', region: '开拓者' },
  { gameId: '8005', name: '开拓者·欢愉', rarity: 5, element: '物理', path: '欢愉', region: '开拓者' },
  { gameId: '8006', name: '开拓者·巡猎', rarity: 5, element: '虚数', path: '巡猎', region: '开拓者' },
];

export function uniqueCharacters(): HsrCharacterSeed[] {
  const map = new Map<string, HsrCharacterSeed>();
  for (const c of HSR_CHARACTERS) {
    if (map.has(c.name)) continue;
    const gameId = resolveGameId(c.name, c.gameId);
    if (!gameId) continue;
    map.set(c.name, { ...c, gameId });
  }
  return [...map.values()].sort(
    (a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name, 'zh-CN')
  );
}
