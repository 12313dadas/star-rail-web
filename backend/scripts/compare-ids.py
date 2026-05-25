import json
import re
import urllib.request
from html import unescape

url = 'https://wiki.bittopup.com/zh-CN/starrail/characters'
html = urllib.request.urlopen(
    urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=30
).read().decode('utf-8', 'replace')

wiki = {}
for m in re.finditer(
    r'href="/zh-CN/starrail/characters/(\d{4})"[\s\S]{0,3000}?/avatar/medium/\1\.png" alt="([^"]*)"',
    html,
):
    wiki[m.group(2).strip()] = m.group(1)

# normalize names
def norm(s: str) -> str:
    return s.replace('•', '·').replace('阮•梅', '阮·梅').replace('阮·梅', '阮梅').strip()

ours = {
    '大黑塔': '1401', '阿格莱雅': '1402', '缇宝': '1403', '遐蝶': '1404', '万敌': '1405',
    '风堇': '1406', '那刻夏': '1407', '赛飞儿': '1408', '白厄': '1409', '刻律德菈': '1410',
    '海瑟音': '1411', '丹恒·腾荒': '1412', '长夜月': '1413', '昔涟': '1414',
    '火花': '1319', '爻光': '1225', '花火': '1217', '流萤': '1207', '星期日': '1309',
}

lines = []
lines.append('=== Amphoreus / key fixes ===')
for name, old in ours.items():
    found = False
    for wname, gid in wiki.items():
        if norm(wname) == norm(name) or name in wname or wname in name:
            mark = 'OK' if gid == old else f'FIX {old}->{gid}'
            lines.append(f'{name}: wiki={gid} ours={old} {mark}')
            found = True
            break
    if not found:
        lines.append(f'{name}: NOT IN WIKI (ours={old})')

lines.append('')
lines.append('=== 14xx/13xx/15xx/80xx wiki ===')
for wname, gid in sorted(wiki.items(), key=lambda x: x[1]):
    if gid.startswith(('14', '13', '15', '80', '12')):
        lines.append(f'{gid}\t{wname}')

with open('scripts/compare-out.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
print('written', len(lines))
