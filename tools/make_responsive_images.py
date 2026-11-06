#!/usr/bin/env python3
"""Write smaller WebP width variants (<name>-<w>w.webp) next to the originals for srcset, plus the Apple touch icon.

Needs Pillow; run it in Docker:
  docker run --rm -v "$PWD":/app -w /app python:3.12-slim sh -c 'pip install -q pillow && python tools/make_responsive_images.py'

build.py reads the variants from disk, so re-run this after the originals change.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CARD_DIRS = ["pizza", "deli", "merchandise", "drinks", "desserts"]  # shown at 180-380 CSS px
CARD_W = [400]
HERO = {"images/hero/pizza-ratto-wall.webp": [480, 800]}
QUALITY = 80


def variants(path, widths):
    with Image.open(path) as im:
        im.load()
        for w in widths:
            if w >= im.width:
                continue
            out = path.with_name(f"{path.stem}-{w}w.webp")
            im.resize((w, round(im.height * w / im.width)), Image.Resampling.LANCZOS).save(out, "WEBP", quality=QUALITY, method=6)
            print("wrote", out.relative_to(ROOT), out.stat().st_size)


for d in CARD_DIRS:
    for f in sorted((ROOT / "images" / d).glob("*.webp")):
        if "w.webp" in f.name and f.stem.rsplit("-", 1)[-1].endswith("w"):
            continue
        variants(f, CARD_W)
for rel, widths in HERO.items():
    variants(ROOT / rel, widths)

# Apple touch icon and favicons are now the gesture-hand artwork, supplied as files in images/brand/ (not generated here).
