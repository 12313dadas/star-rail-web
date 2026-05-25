"""Remove near-white background from GIF/doro.gif -> frontend/public/gif/doro.gif"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "GIF" / "doro.gif"
OUT = ROOT / "frontend" / "public" / "gif" / "doro.gif"
THRESHOLD = 235
SOFT = 220


def process_frame(frame: Image.Image) -> Image.Image:
    frame = frame.convert("RGBA")
    px = frame.load()
    w, h = frame.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r >= THRESHOLD and g >= THRESHOLD and b >= THRESHOLD:
                px[x, y] = (r, g, b, 0)
            elif r >= SOFT and g >= SOFT and b >= SOFT:
                t = max(r, g, b)
                alpha = int(255 * (255 - t) / (255 - SOFT))
                px[x, y] = (r, g, b, min(alpha, a))
    return frame


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Source not found: {SRC}")

    im = Image.open(SRC)
    frames: list[Image.Image] = []
    durations: list[int] = []
    n = 0
    while True:
        frames.append(process_frame(im.copy()))
        durations.append(int(im.info.get("duration", 80) or 80))
        n += 1
        try:
            im.seek(n)
        except EOFError:
            break

    OUT.parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(
        OUT,
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        disposal=2,
        optimize=False,
    )
    print(f"OK: {len(frames)} frames -> {OUT}")


if __name__ == "__main__":
    main()
