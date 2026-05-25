import urllib.request
from io import BytesIO

try:
    from PIL import Image
except ImportError:
    Image = None

IDS = ['1404', '1317', '1225', '1505', '1015', '1014']
URLS = [
    'https://wikistatic.bittopup.com/hsr/assets/UI/avatar/medium/{id}.png',
    'https://wikistatic.bittopup.com/hsr/assets/UI/avatar/small/{id}.png',
    'https://wikistatic.bittopup.com/hsr/assets/UI/avatar/icon/{id}.png',
    'https://wikistatic.bittopup.com/hsr/assets/UI/avatar/big/{id}.png',
]

for gid in IDS:
    print(gid)
    for tpl in URLS:
        url = tpl.format(id=gid)
        try:
            data = urllib.request.urlopen(
                urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=8
            ).read()
            tag = tpl.split('/')[-2]
            extra = ''
            if Image:
                im = Image.open(BytesIO(data))
                extra = f' {im.size[0]}x{im.size[1]}'
            print(f'  OK {tag} {len(data)}{extra}')
        except Exception as e:
            print(f'  -- {tpl.split("/")[-2]} {str(e)[:40]}')
