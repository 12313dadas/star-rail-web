import urllib.request
from io import BytesIO

try:
    from PIL import Image
except ImportError:
    Image = None

IDS = {
    '1404': '万敌',
    '1317': '乱破',
    '1225': '忘归人',
    '1505': '绯英',
    '1015': 'Archer',
    '1014': 'Saber',
}

URLS = [
    ('bittopup-medium', 'https://wikistatic.bittopup.com/hsr/assets/UI/avatar/medium/{id}.png'),
    ('bittopup-small', 'https://wikistatic.bittopup.com/hsr/assets/UI/avatar/small/{id}.png'),
    ('bittopup-icon', 'https://wikistatic.bittopup.com/hsr/assets/UI/avatar/icon/{id}.png'),
    ('scobble-icon', 'https://cdn.jsdelivr.net/gh/ScobbleQ/HoYo-Assets@main/starrail/icon/{id}.png'),
    ('scobble-wish', 'https://cdn.jsdelivr.net/gh/ScobbleQ/HoYo-Assets@main/starrail/wish/{id}.png'),
    ('dimbreath-icon', 'https://cdn.jsdelivr.net/gh/Dimbreath/StarRailData@master/Unity/Assets/AsbRes/SpriteOutput/AvatarIcon/Avatar/Avatar_{id}.png'),
    ('dimbreath-drawcut', 'https://cdn.jsdelivr.net/gh/Dimbreath/StarRailData@master/Unity/Assets/AsbRes/SpriteOutput/AvatarDrawcut/AvatarDrawcutFront/AvatarDrawcutFront_{id}.png'),
    ('hoyolab-icon', 'https://img-os-static.hoyolab.com/upload/avatar/hsr/{id}.png'),
]

for gid, name in IDS.items():
    print(f'\n=== {name} ({gid}) ===')
    for label, tpl in URLS:
        url = tpl.format(id=gid)
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            data = urllib.request.urlopen(req, timeout=15).read()
            extra = ''
            if Image:
                im = Image.open(BytesIO(data))
                extra = f' {im.size[0]}x{im.size[1]}'
            print(f'  OK {label}: {len(data)} bytes{extra}')
        except Exception as e:
            print(f'  -- {label}: {str(e)[:50]}')
