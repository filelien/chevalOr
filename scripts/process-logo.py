from PIL import Image
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src", "assets", "logo-source.png")
LEGACY_SRC = os.path.join(ROOT, "src", "assets", "logo.png")


def remove_white_bg(img, threshold=240):
    img = img.convert("RGBA")
    pixels = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if r >= threshold and g >= threshold and b >= threshold:
                pixels[x, y] = (r, g, b, 0)
            elif r >= 215 and g >= 205 and b >= 190:
                fade = max(r, g, b)
                alpha = max(0, min(255, int((255 - fade) * 5)))
                pixels[x, y] = (r, g, b, 255 - alpha if alpha < 200 else 0)
    return img


def extract_horse_mark(transparent: Image.Image) -> Image.Image:
    w, h = transparent.size
    horse_h = int(h * 0.56)
    horse = transparent.crop((0, 0, w, horse_h))

    side = max(w, horse_h)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(horse, ((side - w) // 2, (side - horse_h) // 2), horse)

    bbox = square.getbbox()
    if not bbox:
        return square

    square = square.crop(bbox)
    s = max(square.size)
    padded = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    padded.paste(square, ((s - square.size[0]) // 2, (s - square.size[1]) // 2), square)
    return padded


def build_og_image(transparent: Image.Image) -> Image.Image:
    """Image 1200×630 pour aperçu WhatsApp / Facebook / Twitter."""
    width, height = 1200, 630
    cream = (250, 248, 244, 255)
    canvas = Image.new("RGBA", (width, height), cream)

    logo = transparent.copy()
    logo.thumbnail((int(width * 0.78), int(height * 0.62)), Image.Resampling.LANCZOS)
    x = (width - logo.size[0]) // 2
    y = (height - logo.size[1]) // 2
    canvas.paste(logo, (x, y), logo)
    return canvas


def main():
    source = SRC if os.path.exists(SRC) else LEGACY_SRC
    img = Image.open(source).convert("RGB")
    transparent = remove_white_bg(img)

    assets = os.path.join(ROOT, "src", "assets")
    public = os.path.join(ROOT, "public")
    favicon_dir = os.path.join(assets, "favicon")
    os.makedirs(public, exist_ok=True)
    os.makedirs(favicon_dir, exist_ok=True)

    # Keep original source for future reprocessing
    if source != SRC:
        shutil.copy2(source, SRC)

    transparent.save(os.path.join(assets, "logo-transparent.png"), optimize=True)
    transparent.save(os.path.join(assets, "logo.png"), optimize=True)
    transparent.save(os.path.join(public, "logo.png"), optimize=True)

    mark = extract_horse_mark(transparent)
    mark.save(os.path.join(assets, "logo-mark.png"), optimize=True)

    og = build_og_image(transparent)
    og.save(os.path.join(public, "og-image.png"), optimize=True)

    print(f"OK source={img.size} transparent={transparent.size} mark={mark.size} og={og.size}")


if __name__ == "__main__":
    main()
