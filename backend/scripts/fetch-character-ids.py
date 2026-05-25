import json
import re
import urllib.request
from html import unescape

url = 'https://wiki.bittopup.com/zh-CN/starrail/characters'
html = urllib.request.urlopen(
    urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=30
).read().decode('utf-8', 'replace')

wiki: dict[str, str] = {}
for m in re.finditer(
    r'href="/zh-CN/starrail/characters/(\d{4})"[\s\S]{0,3000}?/avatar/medium/\1\.png" alt="([^"]*)"',
    html,
):
    name = unescape(m.group(2).strip()).replace('•', '·')
    wiki[name] = m.group(1)

with open('scripts/character-ids.json', 'w', encoding='utf-8') as f:
    json.dump([{'gameId': gid, 'name': name} for name, gid in sorted(wiki.items(), key=lambda x: x[1])], f, ensure_ascii=False, indent=2)

print(len(wiki))
