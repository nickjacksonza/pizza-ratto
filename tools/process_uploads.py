#!/usr/bin/env python3
"""Turn photos the menu editor uploaded into the site's card images, then delete the uploads.

The editor commits uploads/<folder>/<item-id>.jpg (already cropped square in the browser).
This writes images/<folder>/<item-id>.webp (720 px) and <item-id>-400w.webp, the files build.py
looks for. Runs in the rebuild-docs workflow before build.py. Needs Pillow:
  pip install "pillow>=10,<12" && python3 tools/process_uploads.py
"""
import re
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
UP = ROOT / "uploads"
FOLDERS = {"pizza", "deli", "merchandise", "drinks", "desserts"}
NAME = re.compile(r"^[a-z0-9][a-z0-9-]{0,80}$")
SIZES = [(None, 720), ("400w", 400)]
QUALITY = 80

done = bad = 0
for f in sorted(UP.glob("*/*")) if UP.exists() else []:
    if f.name.startswith(".") or not f.is_file():
        continue
    folder, stem = f.parent.name, f.stem
    if folder not in FOLDERS or not NAME.match(stem) or f.suffix.lower() not in (".jpg", ".jpeg", ".png", ".webp"):
        print(f"skip {f.relative_to(ROOT)}: unexpected folder or name", file=sys.stderr)
        f.unlink()
        bad += 1
        continue
    try:
        with Image.open(f) as im:
            im = ImageOps.exif_transpose(im).convert("RGB")
            side = min(im.size)
            im = ImageOps.fit(im, (side, side), Image.Resampling.LANCZOS)  # centre square crop
            out_dir = ROOT / "images" / folder
            out_dir.mkdir(parents=True, exist_ok=True)
            for suffix, w in SIZES:
                w = min(w, side)
                name = f"{stem}-{suffix}.webp" if suffix else f"{stem}.webp"
                im.resize((w, w), Image.Resampling.LANCZOS).save(out_dir / name, "WEBP", quality=QUALITY, method=6)
                print("wrote", (out_dir / name).relative_to(ROOT))
        done += 1
    except Exception as e:  # a broken upload must not block the rest of the site
        print(f"skip {f.relative_to(ROOT)}: {e}", file=sys.stderr)
        bad += 1
    f.unlink()
print(f"processed {done} upload(s), skipped {bad}")
