#!/usr/bin/env python3
"""Static site generator for Pizza Ratto.

Run: python3 build.py   (standard library only)

Reads src/pages/*.html (front-matter + body), wraps them in src/partials/, fills {{ placeholders }} from
src/data/site.json, the front-matter, and HTML the script generates from the owner's JSON (menu.json,
deli.json, merchandise.json), then writes plain static HTML to docs/. Paths are relative so the site works
at a sub-path as well as at the domain root. Prints every menu image that is missing on disk; those cards
render the branded fallback tile instead of a broken image.
"""

import hashlib
import html
import json
import re
import shutil
import struct
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "src"
OUT = ROOT / "docs"
STATIC_DIRS = ["js", "images", "fonts", "videos"]
CSS_BUNDLE = ["css/tokens.css", "css/styles.css"]

site = json.loads((SRC / "data" / "site.json").read_text(encoding="utf-8"))
MENU = json.loads((SRC / "data" / "menu.json").read_text(encoding="utf-8"))
DELI = json.loads((SRC / "data" / "deli.json").read_text(encoding="utf-8"))
MERCH = json.loads((SRC / "data" / "merchandise.json").read_text(encoding="utf-8"))

DOMAIN = site["domain"].rstrip("/")
MISSING = []  # image paths named in the JSON that are not on disk
VERSIONS = {}


def esc(s):
    return html.escape(str(s), quote=True)


def money(item, symbol):
    """Build note: price -> 'R135', otherwise the item's price_label."""
    price = item.get("price")
    return f"{symbol}{price}" if price is not None else item.get("price_label", "")


def words(n):
    names = "Zero One Two Three Four Five Six Seven Eight Nine Ten Eleven Twelve Thirteen Fourteen Fifteen Sixteen".split()
    return names[n] if n < len(names) else str(n)


def asset_version(data):
    return hashlib.sha256(data).hexdigest()[:8]


# ---------------------------------------------------------------- image helpers

def image_size(path):
    """(width, height) from a webp/png/jpg/svg header, or None. No Pillow on the host."""
    p = ROOT / path
    try:
        b = p.read_bytes()
    except OSError:
        return None
    if p.suffix == ".webp" and b[:4] == b"RIFF":
        kind = b[12:16]
        if kind == b"VP8X":
            return (int.from_bytes(b[24:27], "little") + 1, int.from_bytes(b[27:30], "little") + 1)
        if kind == b"VP8L":
            v = struct.unpack("<I", b[21:25])[0]
            return ((v & 0x3FFF) + 1, ((v >> 14) & 0x3FFF) + 1)
        if kind == b"VP8 ":
            return (struct.unpack("<H", b[26:28])[0] & 0x3FFF, struct.unpack("<H", b[28:30])[0] & 0x3FFF)
    if p.suffix == ".png":
        return struct.unpack(">II", b[16:24])
    if p.suffix == ".svg":
        m = re.search(rb'viewBox="[\d.\-]+ [\d.\-]+ ([\d.]+) ([\d.]+)"', b)
        if m:
            return (round(float(m.group(1))), round(float(m.group(2))))
    return None


def img(path, alt, rel, cls="", lazy=True, eager=False, size=None):
    w, h = size or image_size(path) or (0, 0)
    dim = f' width="{w}" height="{h}"' if w else ""
    attrs = ' fetchpriority="high" decoding="async"' if eager else (' loading="lazy" decoding="async"' if lazy else ' decoding="async"')
    c = f' class="{cls}"' if cls else ""
    return f'<img{c} src="{rel}{path}" alt="{esc(alt)}"{dim}{attrs}>'


def card_img(item, alt, rel, first=False):
    """Circular photo, or the branded 'photo coming hot' tile when the file is missing."""
    path = item.get("image")
    if path and (ROOT / path).exists():
        return f'<div class="pr-card-img">{img(path, alt, rel, lazy=not first)}</div>'
    if path:
        MISSING.append(path)
    return '<div class="pr-card-img is-empty"><span>photo<br>coming hot</span></div>'


# ---------------------------------------------------------------- icons

ICONS = {
    "whatsapp": ("0 0 24 24", "M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.78h-.01a9.84 9.84 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26A9.9 9.9 0 0 1 12.05 2a9.82 9.82 0 0 1 6.99 2.9 9.820 9.82 0 0 1 2.9 7c0 5.45-4.44 9.88-9.89 9.88M20.47 3.49A11.82 11.82 0 0 0 12.06 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.9 11.9 0 0 0 5.69 1.45h.01c6.56 0 11.89-5.34 11.89-11.9 0-3.18-1.23-6.16-3.48-8.41"),
    "call": ("0 0 24 24", "M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z"),
    "ubereats": ("0 0 36 24", "M3 4h3v11c0 .6.4 1 1 1h5c.6 0 1-.4 1-1V4h3v13c0 2.2-1.8 4-4 4H7c-2.2 0-4-1.8-4-4V4Zm17 0h13v3H23v3h9v3h-9v4h10v3H20V4Z"),
}


def icon(name):
    if name == "instagram":
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>'
    vb, d = ICONS[name]
    cls = ' class="uber"' if name == "ubereats" else ""
    return f'<svg{cls} viewBox="{vb}" fill="currentColor" aria-hidden="true" focusable="false"><path d="{d}"/></svg>'


def button(label, href, variant="", ico=None, extra="", external=True):
    cls = "pr-btn" + (f" pr-btn-{variant}" if variant else "") + (f" {extra}" if extra else "")
    target = ' target="_blank" rel="noopener"' if external else ""
    return f'<a class="{cls}" href="{esc(href)}"{target}>{icon(ico) if ico else ""}{label}</a>'


# ---------------------------------------------------------------- generated sections

def find_group(data, section_id, group_id):
    for s in data["sections"]:
        if s["id"] == section_id:
            for g in s["groups"]:
                if g["id"] == group_id:
                    return g
    raise KeyError(group_id)


def available(items):
    return [i for i in items if i.get("available", True)]


def pizza_cards(rel):
    sym = MENU["currency_symbol"]
    out = []
    for n, it in enumerate(available(find_group(MENU, "pizza", "pizzas")["items"])):
        alt = site["image_alts"].get(it["id"], f"{it['name']} pizza from Pizza Ratto")
        note = f'<small>{esc(it["note"])}</small>' if it.get("note") else ""
        out.append(
            f'<li><div class="pr-card">{card_img(it, alt, rel, first=n < 3)}<div>'
            f'<div class="pr-card-top"><b>{esc(it["name"])}</b><strong>{esc(money(it, sym))}</strong></div>'
            f'<p>{esc(it.get("description", ""))}</p>{note}</div></div></li>'
        )
    return "\n".join(out)


def toppings_list():
    g = find_group(MENU, "pizza", "extra-toppings")
    sym = MENU["currency_symbol"]
    tiers = {}
    for it in available(g["items"]):
        tiers.setdefault(it["price"], []).append(it["name"])
    rows = "".join(
        f'<div><dt>{sym}{p}</dt><dd>{esc(" · ".join(names))}</dd></div>'
        for p, names in sorted(tiers.items(), reverse=True)
    )
    return f'<div class="pr-toppings"><span class="pr-sticker">{esc(g["title"])} · {esc(g["note"])}</span><dl>{rows}</dl></div>'


def item_aside(it, sym):
    """variants -> 'Single R20 · Double R30'; options and size as a small line under the name."""
    bits = []
    if it.get("variants"):
        bits.append(" · ".join(f'{v["name"]} {sym}{v["price"]}' for v in it["variants"]))
    if it.get("options"):
        bits.append(" · ".join(it["options"]))
    if it.get("description"):
        bits.append(it["description"])
    return bits


def side_cards(rel):
    sym = MENU["currency_symbol"]
    out = []
    for card in site["side_cards"]:
        g = find_group(MENU, card["section"], card["group"])
        groups = {}  # keep first-seen order of price labels
        for it in available(g["items"]):
            if it.get("variants"):
                prices = [v["price"] for v in it["variants"]]
                label = f"{sym}{prices[0]}/{prices[-1]}"
            else:
                label = f"{sym}{it['price']}"
            groups.setdefault(label, []).append(it)

        def price_key(label):
            return int(re.match(r"\D*(\d+)", label).group(1))

        body = []
        for label in sorted(groups, key=price_key):
            lis = []
            for it in groups[label]:
                size = f' ({esc(it["size"])})' if it.get("size") else ""
                aside = "".join(f"<small>{esc(b)}</small>" for b in item_aside(it, sym))
                lis.append(f"<li><b>{esc(it['name'])}{size}</b>{aside}</li>")
            body.append(f'<div class="pr-cat-group"><span>{esc(label)}</span><ul>{"".join(lis)}</ul></div>')
        mark = img(f"images/brand/{card['mark']}.svg", "", rel, lazy=True, size=(44, 52)) if card["mark"] else ""
        mark = mark.replace('alt=""', 'alt="" aria-hidden="true"') if mark else ""
        out.append(
            f'<section class="pr-cat pr-cat-{card["tone"]}"><header><div><h3>{esc(card["name"])}</h3>'
            f'<p>{esc(card["kicker"])}</p></div>{mark}</header><div class="pr-cat-groups">{"".join(body)}</div></section>'
        )
    return "\n".join(out)


def house(rel):
    out = []
    for h in site["house"]:
        cls = "pr-oven pr-oven-mascot" if h.get("fit") == "mascot" else "pr-oven"
        out.append(
            f'<article class="pr-panel pr-panel-brown pr-resident"><div class="{cls}">{img(h["img"], h["alt"], rel, lazy=True, size=(h["w"], h["h"]))}</div>'
            f'<div><p class="pr-secnum"><span>{esc(h["label"])}</span></p>'
            f'<h3>{esc(h["title"])}</h3><p class="pr-body">{esc(h["body"])}</p></div></article>'
        )
    return "\n".join(out)


def events():
    return "\n".join(
        f'<article class="pr-event"><p class="pr-label">{esc(e["tag"])}</p><h3>{esc(e["name"])}</h3><p>{esc(e["body"])}</p></article>'
        for e in site["events"]["items"]
    )


def socials():
    return "\n".join(
        f'<li><a class="pr-account" href="{esc(s["url"])}" target="_blank" rel="noopener">{icon("instagram") if s["name"] == "Instagram" else ""}'
        f'<span><b>{esc(s["name"])}</b><i>{esc(s["handle"])}</i><small>{esc(s["note"])}</small></span><em aria-hidden="true">↗</em></a></li>'
        for s in site["socials"]
    )


def reel(rel):
    out = []
    for i, t in enumerate(site["tapes"], 1):
        out.append(
            f'<figure class="pr-tape"><video muted loop playsinline preload="none" disablePictureInPicture width="720" height="1280" '
            f'poster="{rel}images/stills/{t["vid"]}.webp" aria-hidden="true"><source src="{rel}videos/{t["vid"]}.mp4" type="video/mp4"></video>'
            f'<figcaption><b>{i:02d}</b>{esc(t["label"])}</figcaption></figure>'
        )
    return "\n".join(out)


def catalogue_cards(data, rel):
    sym = data["currency_symbol"]
    items = available(data["sections"][0]["groups"][0]["items"])
    out = []
    for n, it in enumerate(items):
        brand = f'<span class="pr-card-brand">{esc(it["brand"])}</span>' if it.get("brand") else ""
        out.append(
            f'<li><div class="pr-card">{card_img(it, it["name"], rel, first=n < 3)}<div>'
            f'<div class="pr-card-top"><b>{esc(it["name"])}</b><strong>{esc(money(it, sym))}</strong></div>{brand}</div></div></li>'
        )
    return "\n".join(out)


# ---------------------------------------------------------------- schema

def price_range():
    """R<min>–R<max> across pizzas, drinks and desserts (extra toppings excluded: they are add-ons)."""
    prices = []
    for s in MENU["sections"]:
        for g in s["groups"]:
            if g["id"] == "extra-toppings":
                continue
            for it in available(g["items"]):
                prices += [v["price"] for v in it.get("variants", [])] or ([it["price"]] if it.get("price") is not None else [])
    sym = MENU["currency_symbol"]
    return f"{sym}{min(prices)}–{sym}{max(prices)}"


def menu_item(it, cur, local=True):
    node = {"@type": "MenuItem", "name": it["name"]}
    desc = [it.get("description")] + ([f'Options: {", ".join(it["options"])}'] if it.get("options") else [])
    desc = " ".join(d for d in desc if d)
    if desc:
        node["description"] = desc
    if it.get("image") and (ROOT / it["image"]).exists():
        node["image"] = f"{DOMAIN}/{it['image']}"
    if it.get("variants"):
        node["offers"] = [{"@type": "Offer", "name": v["name"], "price": str(v["price"]), "priceCurrency": cur} for v in it["variants"]]
    elif it.get("price") is not None:
        node["offers"] = {"@type": "Offer", "price": str(it["price"]), "priceCurrency": cur}
    return node


def menu_node():
    cur = MENU["currency"]
    sections = []
    for s in MENU["sections"]:
        subs = []
        for g in s["groups"]:
            items = [menu_item(i, cur) for i in available(g["items"])]
            if not items:
                continue
            subs.append({"@type": "MenuSection", "name": g["title"] or s["title"], "hasMenuItem": items})
        # A section with one untitled group collapses to that group's items.
        if len(subs) == 1 and not s["groups"][0]["title"]:
            sections.append({"@type": "MenuSection", "name": s["title"], "hasMenuItem": subs[0]["hasMenuItem"]})
        else:
            sections.append({"@type": "MenuSection", "name": s["title"], "hasMenuSection": subs})
    return {"@type": "Menu", "@id": f"{DOMAIN}/#menu", "name": f"{site['name']} menu", "inLanguage": site["locale"], "hasMenuSection": sections}


def graph(page):
    a = site["address"]
    restaurant = {
        "@type": "Restaurant",
        "@id": f"{DOMAIN}/#restaurant",
        "name": site["name"],
        "url": f"{DOMAIN}/",
        "description": site["tagline"] + " Hand-stretched, wood-fired pizza in Salt River, Cape Town.",
        "telephone": site["phone_intl"],
        "image": f"{DOMAIN}/{site['og_image']}",
        "logo": f"{DOMAIN}/images/hero/pizza-ratto-logo.webp",
        "servesCuisine": site["cuisine"],
        "priceRange": price_range(),
        "currenciesAccepted": MENU["currency"],
        "acceptsReservations": False,
        "address": {"@type": "PostalAddress", "streetAddress": a["street"], "addressLocality": a["locality"], "addressRegion": a["region"], "addressCountry": a["country"]},
        "hasMap": "https://www.google.com/maps/search/?api=1&query=" + urllib.parse.quote_plus(f"{a['street']}, {a['locality']}, {a['city']}"),
        "openingHoursSpecification": [{"@type": "OpeningHoursSpecification", "dayOfWeek": site["hours"]["days"], "opens": site["hours"]["opens"], "closes": site["hours"]["closes"]}],
        "sameAs": [site["instagram"]],
        "hasMenu": {"@id": f"{DOMAIN}/#menu"},
        "menu": f"{DOMAIN}/#menu",
        "potentialAction": {
            "@type": "OrderAction",
            "target": [
                {"@type": "EntryPoint", "urlTemplate": site["whatsapp"], "actionPlatform": "https://schema.org/DesktopWebPlatform"},
                {"@type": "EntryPoint", "urlTemplate": site["uber_eats"], "actionPlatform": "https://schema.org/DesktopWebPlatform"},
            ],
            "deliveryMethod": "http://purl.org/goodrelations/v1#DeliveryModePickUp",
        },
    }
    website = {"@type": "WebSite", "@id": f"{DOMAIN}/#website", "url": f"{DOMAIN}/", "name": site["name"], "inLanguage": site["locale"], "publisher": {"@id": f"{DOMAIN}/#restaurant"}}
    url = page["canonical"]
    webpage = {
        "@type": "WebPage",
        "@id": url + "#webpage",
        "url": url,
        "name": page["title"],
        "description": page["description"],
        "inLanguage": site["locale"],
        "isPartOf": {"@id": f"{DOMAIN}/#website"},
        "about": {"@id": f"{DOMAIN}/#restaurant"},
        "primaryImageOfPage": {"@type": "ImageObject", "url": f"{DOMAIN}/{site['og_image']}", "width": 1200, "height": 630},
    }
    nodes = [restaurant, website, webpage]
    kind = page.get("kind", "home")
    if kind == "home":
        nodes.append(menu_node())
    elif kind in ("deli", "merch"):
        data = DELI if kind == "deli" else MERCH
        cur = data["currency"]
        products = []
        for it in available(data["sections"][0]["groups"][0]["items"]):
            p = {"@type": "Product", "name": it["name"]}
            if it.get("brand"):
                p["brand"] = {"@type": "Brand", "name": it["brand"]}
            if it.get("image") and (ROOT / it["image"]).exists():
                p["image"] = f"{DOMAIN}/{it['image']}"
            if it.get("price") is not None:
                p["offers"] = {"@type": "Offer", "price": str(it["price"]), "priceCurrency": cur, "seller": {"@id": f"{DOMAIN}/#restaurant"}}
            products.append(p)
        webpage["mainEntity"] = {"@type": "ItemList", "numberOfItems": len(products), "itemListElement": [{"@type": "ListItem", "position": i, "item": p} for i, p in enumerate(products, 1)]}
        nodes.append({
            "@type": "BreadcrumbList",
            "@id": url + "#breadcrumb",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{DOMAIN}/"},
                {"@type": "ListItem", "position": 2, "name": page["crumb"], "item": url},
            ],
        })
        webpage["breadcrumb"] = {"@id": url + "#breadcrumb"}
    return {"@context": "https://schema.org", "@graph": nodes}


# ---------------------------------------------------------------- pages

def parse_page(path):
    text = path.read_text(encoding="utf-8")
    meta = {}
    body = text
    if text.startswith("---"):
        _, fm, body = text.split("---", 2)
        for line in fm.strip().splitlines():
            k, _, v = line.partition(":")
            v = v.strip()
            if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
                v = v[1:-1]
            meta[k.strip()] = v
    return meta, body.lstrip("\n")


def nav_html(current, on_home):
    out = []
    for n in site["nav"]:
        href = n["href"]
        if href.startswith("#"):
            href = href if on_home else "./" + href
        cur = ' aria-current="page"' if n["id"] == current else ""
        out.append(f'<a href="{esc(href)}"{cur}>{esc(n["label"])}</a>')
    return "".join(out)


def analytics():
    gid = site.get("ga4_id")
    if not gid:
        return ""
    return (
        "<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}"
        "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});</script>"
        f'<script async src="https://www.googletagmanager.com/gtag/js?id={esc(gid)}"></script>'
        f"<script>gtag('js',new Date());gtag('config','{esc(gid)}');</script>"
    )


def render(name, meta, body, partials):
    rel = meta.get("root", "")
    on_home = name == "index"
    canonical = DOMAIN + "/" + ("" if on_home else ("404.html" if name == "404" else f"{name}.html"))
    page = {
        "title": meta["title"], "description": meta["description"], "canonical": canonical,
        "kind": meta.get("kind", "home" if on_home else "plain"), "crumb": meta.get("crumb", ""),
    }
    for label, text, lo, hi in (("title", page["title"], 10, 60), ("description", page["description"], 120, 160)):
        if not lo <= len(text) <= hi:
            print(f"WARN {name}: {label} is {len(text)} chars (target {lo}-{hi})")
    ctx = {
        "title": esc(page["title"]), "description": esc(page["description"]), "canonical": esc(canonical),
        "name": esc(site["name"]), "domain": DOMAIN, "og_image": f"{DOMAIN}/{site['og_image']}",
        "locale": site["locale"], "og_locale": site["locale"].replace("-", "_"), "theme_color": site["theme_color"],
        "root": rel, "robots": meta.get("robots", "index, follow, max-image-preview:large"),
        "css_v": VERSIONS["css"], "js_v": VERSIONS["js"],
        "hero_preload": f'<link rel="preload" as="image" href="{rel}images/hero/pizza-ratto-logo.webp" type="image/webp" fetchpriority="high">' if on_home else "",
        "analytics": analytics(),
        "jsonld": json.dumps(graph(page), ensure_ascii=False, indent=2).replace("</", "<\\/"),
        "nav": nav_html({"deli": "deli", "merchandise": "merch"}.get(name), on_home),
        "logo_href": "#top" if on_home else "./",
        "home": "" if on_home else "./",
        "announce": '<i aria-hidden="true"></i>'.join(esc(t) for t in site["announcement"]),
        "whatsapp": esc(site["whatsapp"]), "uber": esc(site["uber_eats"]), "phone": esc(site["phone_display"]),
        "phone_intl": esc(site["phone_intl"]), "instagram": esc(site["instagram"]), "handle": esc(site["instagram_handle"]),
        "address": esc(f"{site['address']['street']}, {site['address']['locality']}, {site['address']['city']}"),
        "hours": esc(site["hours_text"]), "tagline": esc(site["tagline"]),
        "icon_whatsapp": icon("whatsapp"), "icon_call": icon("call"), "icon_uber": icon("ubereats"), "icon_ig": icon("instagram"),
        "btn_whatsapp": button("Order on WhatsApp", site["whatsapp"], "cream", "whatsapp"),
        "btn_whatsapp_red": button("Order on WhatsApp", site["whatsapp"], "", "whatsapp"),
        "btn_uber": button("Uber Eats", site["uber_eats"], "street", "ubereats"),
        "pizza_cards": pizza_cards(rel), "pizza_count_word": words(len(available(find_group(MENU, "pizza", "pizzas")["items"]))),
        "toppings": toppings_list(), "side_cards": side_cards(rel), "house": house(rel), "events": events(), "socials": socials(), "reel": reel(rel),
        "deli_cards": catalogue_cards(DELI, rel), "merch_cards": catalogue_cards(MERCH, rel),
        "ticker": esc(site["ticker"] * 4), "ev_label": esc(site["events"]["label"]), "ev_title": esc(site["events"]["title"]), "ev_title_alt": esc(site["events"]["title_alt"]), "ev_intro": esc(site["events"]["intro"]), "ev_sticker": esc(site["events"]["sticker"]), "wa_number": site["whatsapp_number"], "year": "2026",
        **{k: v for k, v in meta.items()},
    }
    ctx["h1"] = meta.get("h1", "")

    def fill(text):
        # Two passes: partials may contain placeholders that expand to more placeholders.
        for _ in range(2):
            text = re.sub(r"\{\{\s*(\w+)\s*\}\}", lambda m: str(ctx[m.group(1)]) if m.group(1) in ctx else m.group(0), text)
        return text

    ctx["body"] = fill(body)
    doc = "<!doctype html>\n<html lang=\"{{ locale }}\">\n{{ head }}\n<body id=\"top\">\n<a class=\"pr-skip\" href=\"#main\">Skip to content</a>\n{{ header }}\n<main id=\"main\" tabindex=\"-1\">\n{{ body }}\n</main>\n{{ footer }}\n{{ mobilebar }}\n<script src=\"{{ root }}js/scripts.js?v={{ js_v }}\" defer></script>\n</body>\n</html>\n"
    for key in ("head", "header", "footer", "mobilebar"):
        ctx[key] = fill(partials[key])
    out = fill(doc)
    left = re.findall(r"\{\{\s*\w+\s*\}\}", out)
    if left:
        raise SystemExit(f"{name}: unresolved placeholders {set(left)}")
    return out


def build():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()
    css = "\n".join((ROOT / f).read_text(encoding="utf-8") for f in CSS_BUNDLE)
    (OUT / "css").mkdir()
    (OUT / "css" / "site.css").write_text(css, encoding="utf-8")
    VERSIONS["css"] = asset_version(css.encode())
    VERSIONS["js"] = asset_version((ROOT / "js" / "scripts.js").read_bytes())
    for d in STATIC_DIRS:
        if (ROOT / d).exists():
            shutil.copytree(ROOT / d, OUT / d)
    for f in (SRC / "static").iterdir():
        if f.name in ("sitemap.xml", "llms.txt"):
            continue
        shutil.copy2(f, OUT / f.name)
    partials = {k: (SRC / "partials" / f"{k}.html").read_text(encoding="utf-8") for k in ("head", "header", "footer", "mobilebar")}
    urls = []
    for p in sorted((SRC / "pages").glob("*.html")):
        meta, body = parse_page(p)
        (OUT / p.name).write_text(render(p.stem, meta, body, partials), encoding="utf-8")
        if meta.get("robots", "").startswith("noindex"):
            continue
        urls.append(DOMAIN + "/" + ("" if p.stem == "index" else p.name))
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    sm += [f"  <url><loc>{u}</loc></url>" for u in urls]
    sm.append("</urlset>")
    (OUT / "sitemap.xml").write_text("\n".join(sm) + "\n", encoding="utf-8")
    a = site["address"]
    llms = f"""# {site['name']}

> {site['tagline']} Wood-fired pizza shop in {a['locality']}, {a['city']}, South Africa. Hand-stretched pizza, caffè and dolci, plus a small deli and merchandise range. Collection only: order on WhatsApp, by phone or on Uber Eats. Meat toppings are halal.

Address: {a['street']}, {a['locality']}, {a['city']}. Hours: {site['hours_text']}. Phone / WhatsApp: {site['phone_display']}. Instagram: {site['instagram']}

## Pages

- [Home and menu]({DOMAIN}/): pizza menu with prices, caffè, cold drinks, desserts, opening hours and how to order
- [Deli]({DOMAIN}/deli.html): hot honey, chilli sauce, spice blends, limoncello and other take-home items
- [Merchandise]({DOMAIN}/merchandise.html): helmet keyrings, jackets, stickers, pins and Vespa-inspired gear
"""
    (OUT / "llms.txt").write_text(llms, encoding="utf-8")
    if MISSING:
        print(f"\n{len(set(MISSING))} menu images named in the JSON are not on disk (fallback tile shown):")
        for m in sorted(set(MISSING)):
            print("  ", m)
    print(f"\nBuilt {len(urls)} indexed pages to {OUT.relative_to(ROOT)}/")


if __name__ == "__main__":
    build()
