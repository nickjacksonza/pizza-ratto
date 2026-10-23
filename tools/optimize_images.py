#!/usr/bin/env python3
"""Build the shipped assets (images/, videos/, fonts/, data/) from the Claude Design handoff zip.

Needs Pillow, fonttools and brotli, which are not installed on the host. Run it in a throwaway container
from the repo root:

    docker run --rm -v "$PWD":/app -w /app python:3.12-slim sh -c \
      'pip install -q pillow fonttools brotli && python tools/optimize_images.py'

Only assets the page uses are written. Assets the handoff README lists as unused are skipped.
"""
import io
import json
import shutil
import zipfile
from pathlib import Path

from PIL import Image
from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
ZIP = ROOT / "Pizza Ratto Website Update.zip"
PFX = "design_handoff_pizza_ratto_site/prototype/assets/"
MENU = json.loads((ROOT / "site-references/for-sale/menu.json").read_text(encoding="utf-8"))

z = zipfile.ZipFile(ZIP)


def read(name):
    return z.read(PFX + name)


def write(rel, data):
    p = ROOT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes(data)
    print(f"{rel}  {len(data) // 1024} KB")


def webp(data, max_side, quality=80):
    im = Image.open(io.BytesIO(data))
    im.thumbnail((max_side, max_side), Image.LANCZOS)
    out = io.BytesIO()
    im.save(out, "WEBP", quality=quality, method=6)
    return out.getvalue(), im.size


# Pizza photos: only where the handoff photo name matches a menu.json id. Never reuse another pizza's photo.
names = set(z.namelist())
for sec in MENU["sections"]:
    for g in sec["groups"]:
        for it in g["items"]:
            if sec["id"] == "pizza" and g["id"] == "pizzas":
                src = PFX + f"photos/pizza-{it['id']}.webp"
                if src in names:
                    data, _ = webp(z.read(src), 720)
                    write(f"images/pizza/{it['id']}.webp", data)
                else:
                    print(f"NO PHOTO for pizza '{it['id']}' (card shows the fallback tile)")

for n in ("feast-landscape", "interior"):
    write(f"images/photos/{n}.webp", webp(read(f"photos/{n}.webp"), 1000)[0])

for n in ("oven-close", "oven-flames", "pizza-pass", "espresso-pull", "sugar-doughnuts", "box-lettering", "counter-sweep"):
    write(f"images/stills/{n}.webp", read(f"photos/video-stills/{n}.webp"))
    write(f"videos/{n}.mp4", read(f"videos/{n}.mp4"))

write("images/mascot/ratto-vespa-cutout.webp", read("mascot/ratto-vespa-cutout.webp"))
write("images/hero/hero-paper-texture.webp", read("hero/hero-paper-texture.webp"))
for n in ("favicon", "pizza-ratto-wordmark", "red-cup", "red-ice-cream", "red-pizza-slice"):
    write(f"images/brand/{n}.svg", read(f"brand/{n}.svg"))

# Hero logo: the repo copy of the owner's PNG (site-references/logos) is the same file the prototype uses.
logo = Image.open(ROOT / "site-references/logos/Pizza-Ratto-logo.png").convert("RGBA")
print("logo size", logo.size)
out = io.BytesIO()
logo.save(out, "WEBP", quality=88, method=6)
write("images/hero/pizza-ratto-logo.webp", out.getvalue())

# Open Graph image, 1200x630: blush paper with the logo centred.
canvas = Image.new("RGB", (1200, 630), "#F5D2C7")
lg = logo.copy()
lg.thumbnail((1060, 560), Image.LANCZOS)
canvas.paste(lg, ((1200 - lg.width) // 2, (630 - lg.height) // 2), lg)
out = io.BytesIO()
canvas.save(out, "JPEG", quality=85, optimize=True)
write("images/og.jpg", out.getvalue())

# Fonts. Heathfield is 1.7 MB as OTF: subset to Basic Latin + Latin-1 + common punctuation, WOFF2.
opts = subset.Options()
opts.flavor = "woff2"
opts.layout_features = ["*"]
f = TTFont(str(ROOT / "site-references/fonts/Heathfield-515nV.otf"))
sub = subset.Subsetter(opts)
sub.populate(unicodes=list(range(0x20, 0x7F)) + list(range(0xA0, 0x100)) + [0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2026, 0x2011, 0x2605])
sub.subset(f)
f.flavor = "woff2"
buf = io.BytesIO()
f.save(buf)
write("fonts/heathfield-latin.woff2", buf.getvalue())
shutil.copy(ROOT / "site-references/fonts/shrikhand/static/shrikhand-latin-400-normal.woff2", ROOT / "fonts/shrikhand-latin.woff2")
shutil.copy(ROOT / "site-references/fonts/headland-one/static/headland-one-latin-400-normal.woff2", ROOT / "fonts/headland-one-latin.woff2")

# Pen strokes for the handwritten "Hot" (only the glyphs the page draws).
sat = json.loads(read("fonts/satisfy.json"))
hot = {"space": sat["p"]["space"], "c": {str(ord(c)): sat["c"][str(ord(c))] if str(ord(c)) in sat["c"] else sat["c"][ord(c)] for c in "Hot"}}
write("js/hot-glyphs.json", json.dumps(hot, separators=(",", ":")).encode())
