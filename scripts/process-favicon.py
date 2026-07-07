from PIL import Image, ImageDraw
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src", "assets", "logo-mark.png")
FALLBACK = os.path.join(ROOT, "src", "assets", "logo-transparent.png")
OUT_ASSETS = os.path.join(ROOT, "src", "assets", "favicon")
OUT_PUBLIC = os.path.join(ROOT, "public")
BG = (255, 255, 255, 255)  # fond blanc pour favicon
GOLD_RING = (201, 162, 39, 255)


def load_mark():
    if os.path.exists(SRC):
        return Image.open(SRC).convert("RGBA")
    img = Image.open(FALLBACK).convert("RGBA")
    w, h = img.size
    return img.crop((0, 0, w, int(h * 0.58)))


def compose_icon(size: int, padding_ratio=0.12):
    mark = load_mark()
    canvas = Image.new("RGBA", (size, size), BG)
    draw = ImageDraw.Draw(canvas)
    inset = max(2, int(size * 0.06))
    draw.ellipse((inset, inset, size - inset, size - inset), outline=GOLD_RING, width=max(1, size // 32))

    pad = int(size * padding_ratio)
    inner = size - pad * 2
    mark.thumbnail((inner, inner), Image.Resampling.LANCZOS)
    x = (size - mark.size[0]) // 2
    y = (size - mark.size[1]) // 2 - int(size * 0.02)
    canvas.paste(mark, (x, y), mark)
    return canvas


def main():
    os.makedirs(OUT_ASSETS, exist_ok=True)
    os.makedirs(OUT_PUBLIC, exist_ok=True)

    icons = {
        16: "favicon-16.png",
        32: "favicon-32.png",
        48: "favicon-48.png",
        180: "apple-touch-icon.png",
        192: "icon-192.png",
        512: "icon-512.png",
    }

    rendered = {}
    for size, name in icons.items():
        icon = compose_icon(size)
        rendered[size] = icon
        icon.save(os.path.join(OUT_ASSETS, name))
        icon.save(os.path.join(OUT_PUBLIC, name))

    rendered[32].save(os.path.join(OUT_ASSETS, "favicon.png"))
    rendered[32].save(os.path.join(OUT_PUBLIC, "favicon.png"))

    ico_list = [rendered[s] for s in (16, 32, 48)]
    ico_list[0].save(
        os.path.join(OUT_ASSETS, "favicon.ico"),
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=ico_list[1:],
    )
    ico_list[0].save(
        os.path.join(OUT_PUBLIC, "favicon.ico"),
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=ico_list[1:],
    )

    print("favicon assets generated", list(icons.values()))


if __name__ == "__main__":
    main()
