#!/usr/bin/env python3
"""Post-build checks on docs/: JSON-LD parses, one h1, img sizes, internal links resolve, no prototype leftovers."""
import json, re, sys
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
sys.exit(1 if bad else 0)
