#!/usr/bin/env python3
"""Post-build checks on docs/: JSON-LD parses, one h1, img sizes, internal links resolve, no prototype leftovers."""
import html, json, re, sys
from pathlib import Path
from html.parser import HTMLParser

DOCS = Path(__file__).resolve().parent.parent / "docs"
bad = 0


class P(HTMLParser):
    def __init__(s):
        super().__init__(); s.h1 = 0; s.imgs = []; s.links = []; s.ld = False; s.ldtext = []; s.ids = set()
    def handle_starttag(s, t, a):
        a = dict(a)
        if "id" in a: s.ids.add(a["id"])
        if t == "h1": s.h1 += 1
        if t == "img": s.imgs.append(a)
        for k in ("href", "src", "poster"):
            if k in a and a[k]: s.links.append(a[k])
        if t == "script" and a.get("type") == "application/ld+json": s.ld = True
    def handle_endtag(s, t):
        if t == "script": s.ld = False
    def handle_data(s, d):
        if s.ld: s.ldtext.append(d)


def err(msg):
    global bad; bad += 1; print("FAIL", msg)

for f in sorted(DOCS.glob("*.html")):
    txt = f.read_text(encoding="utf-8"); p = P(); p.feed(txt)
    if p.h1 != 1: err(f"{f.name}: {p.h1} h1")
    try: json.loads("".join(p.ldtext))
    except Exception as e: err(f"{f.name}: JSON-LD {e}")
    for i in p.imgs:
        if not (i.get("width") and i.get("height")): err(f"{f.name}: img without size {i.get('src')}")
        if "alt" not in i: err(f"{f.name}: img without alt {i.get('src')}")
    for l in p.links:
        if re.match(r"(https?:|mailto:|tel:|data:|#)", l): continue
        path = l.split("#")[0].split("?")[0]
        if path in ("", "./", "/"): continue
        target = DOCS / path.lstrip("/")
        if not target.exists(): err(f"{f.name}: missing {l}")
    for bad_word in ("react", "babel", "chatgpt.site", "pizza-ratto-cpt"):
        if bad_word in txt.lower(): err(f"{f.name}: contains '{bad_word}'")
    print(f"ok {f.name}: h1={p.h1} imgs={len(p.imgs)} links={len(p.links)}")
# Prices must come from site-references/for-sale/*.json: every available item's price text must be in the built page.
FOR_SALE = DOCS.parent / "site-references" / "for-sale"
PRICE_PAGES = {"menu.json": "index.html", "deli.json": "deli.html", "merchandise.json": "merchandise.html"}


def price_texts(it, sym):
    """Same rule as build.py money(): price -> 'R135', else price_label. Variants show 'R20' each."""
    if it.get("price") is not None:
        yield f"{sym}{it['price']}"
    elif it.get("price_label"):
        yield it["price_label"]
    for v in it.get("variants") or []:
        yield f"{sym}{v['price']}"


def walk_items(o):
    if isinstance(o, dict):
        if "id" in o and "name" in o and any(k in o for k in ("price", "price_label", "variants")):
            yield o
        for v in o.values(): yield from walk_items(v)
    elif isinstance(o, list):
        for v in o: yield from walk_items(v)


npr = 0
for jf, page in PRICE_PAGES.items():
    data = json.loads((FOR_SALE / jf).read_text(encoding="utf-8")); sym = data["currency_symbol"]
    text = html.unescape((DOCS / page).read_text(encoding="utf-8"))
    for it in walk_items(data):
        if not it.get("available", True): continue
        for t in price_texts(it, sym):
            npr += 1
            if not re.search(r"(?<![\w.])" + re.escape(t) + r"(?!\d)", text):
                err(f"{page}: price '{t}' for '{it['name']}' ({jf}) not found in the built page. Rebuild with python3 build.py")
print(f"ok prices: {npr} price texts from site-references match docs/")
sys.exit(1 if bad else 0)
