"""Validate the editor's change list and apply it to the for-sale JSON.

The browser never sends a whole file. It sends operations (update fields of an item, add an item,
delete an item, set the order of a group). The server applies them to a freshly fetched copy, so
fields the editor does not know about, and changes made on GitHub meanwhile, are kept.
"""
import os
import re
import unicodedata

FILES = {"menu": "menu.json", "deli": "deli.json", "merchandise": "merchandise.json"}
LABELS = {"menu": "Menu", "deli": "Deli", "merchandise": "Merchandise"}

# Key order for fields the editor adds. Existing keys keep their place.
KEY_ORDER = ["id", "image", "name", "brand", "price", "price_label", "variants", "description", "size", "options", "available"]
TEXT_LIMITS = {"name": 60, "brand": 60, "price_label": 30, "description": 300, "size": 30}
EDITABLE = set(TEXT_LIMITS) | {"price", "variants", "options", "available"}
MAX_PRICE = 100000
MAX_OPS = 500
BAD_CHARS = re.compile(r"[<>\x00-\x1f\x7f]")


class OpError(ValueError):
    """A change the owner can fix. The message is shown to them as is."""


# ---------------------------------------------------------------- values

def clean_text(value, field, limit):
    if not isinstance(value, str):
        raise OpError(f"{field} must be text.")
    value = " ".join(value.split())  # collapse newlines and runs of spaces
    if len(value) > limit:
        raise OpError(f"{field} is too long ({len(value)} characters, the limit is {limit}).")
    if BAD_CHARS.search(value):
        raise OpError(f"{field} can't contain < or > or control characters.")
    return value


def clean_price(value, field="Price"):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise OpError(f"{field} must be a number, like 85 or 42.50.")
    if value != value or value < 0 or value > MAX_PRICE:  # NaN or out of range
        raise OpError(f"{field} must be between 0 and {MAX_PRICE}.")
    value = round(float(value), 2)
    return int(value) if value.is_integer() else value


def clean_field(key, value):
    """Return the cleaned value, or None to remove an optional field."""
    if key in TEXT_LIMITS:
        if value is None:
            return None
        value = clean_text(value, key.replace("_", " ").capitalize(), TEXT_LIMITS[key])
        return value or None
    if key == "available":
        if not isinstance(value, bool):
            raise OpError("Available must be on or off.")
        return value
    if key == "price":
        return None if value is None else clean_price(value)
    if key == "options":
        if value is None:
            return None
        if not isinstance(value, list) or len(value) > 20:
            raise OpError("Options must be a list of at most 20 entries.")
        out = [clean_text(v, "Option", 40) for v in value]
        return [v for v in out if v] or None
    if key == "variants":
        if value is None:
            return None
        if not isinstance(value, list) or len(value) > 10:
            raise OpError("Sizes/variants must be a list of at most 10 entries.")
        out = []
        for v in value:
            if not isinstance(v, dict) or set(v) - {"name", "price"}:
                raise OpError("Each variant needs a name and a price.")
            name = clean_text(v.get("name", ""), "Variant name", 30)
            if not name:
                raise OpError("Each variant needs a name.")
            out.append({"name": name, "price": clean_price(v.get("price"), f"Price for {name}")})
        return out or None
    raise OpError(f"The field {key!r} can't be edited here.")


def set_key(item, key, value):
    """Set item[key], placing a new key by KEY_ORDER so the file keeps its usual order."""
    if key in item:
        item[key] = value
        return
    rank = KEY_ORDER.index(key)
    pairs = list(item.items())
    pos = len(pairs)
    for n, (k, _) in enumerate(pairs):
        if k in KEY_ORDER and KEY_ORDER.index(k) > rank:
            pos = n
            break
    pairs.insert(pos, (key, value))
    item.clear()
    item.update(pairs)


def apply_fields(item, fields, file_key):
    if not isinstance(fields, dict):
        raise OpError("Bad change format.")
    for key, value in fields.items():
        if key not in EDITABLE:
            raise OpError(f"The field {key!r} can't be edited here.")
        value = clean_field(key, value)
        if key == "price":
            if value is None and file_key == "menu" and not (item.get("variants") or fields.get("variants")):
                raise OpError(f"{item.get('name') or 'A new item'} needs a price.")
            if value is None and "price" not in item:
                continue
            set_key(item, "price", value)
        elif value is None:
            item.pop(key, None)
        else:
            set_key(item, key, value)


def check_item(item, file_key):
    name = item.get("name")
    if not isinstance(name, str) or not name.strip():
        raise OpError("Every item needs a name.")
    if item.get("variants"):
        return
    if isinstance(item.get("price"), (int, float)) and not isinstance(item.get("price"), bool):
        return
    if file_key != "menu" and item.get("price") is None and item.get("price_label"):
        return
    if file_key == "menu":
        raise OpError(f"{name} needs a price (or sizes with prices).")
    raise OpError(f"{name} needs a price, or a price text such as POA.")


# ---------------------------------------------------------------- ids and lookups

def slugify(name):
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s[:50].strip("-") or "item"


def all_ids(docs):
    ids = set()
    for doc in docs.values():
        for s in doc["sections"]:
            for g in s["groups"]:
                ids.update(i.get("id") for i in g["items"])
    return ids


def find_item(doc, item_id):
    for s in doc["sections"]:
        for g in s["groups"]:
            for n, it in enumerate(g["items"]):
                if it.get("id") == item_id:
                    return s, g, n, it
    return None


def find_group(doc, section_id, group_id):
    for s in doc["sections"]:
        if s["id"] == section_id:
            for g in s["groups"]:
                if g["id"] == group_id:
                    return s, g
    raise OpError("That category no longer exists. Reload the page.")


def group_label(s, g):
    return g.get("title") or s.get("title") or g["id"]


def new_id(name, group, taken):
    """Slug from the name, with the group's shared id prefix (extra toppings use 'extra-'), unique across all files."""
    sib = [i["id"] for i in group["items"] if isinstance(i.get("id"), str)]
    prefix = ""
    if sib and all(i.startswith(sib[0].split("-")[0] + "-") for i in sib) and len(sib) > 1:
        prefix = sib[0].split("-")[0] + "-"
    base = slugify(name)
    if prefix and not base.startswith(prefix):
        base = prefix + base
    cand, n = base, 2
    while cand in taken:
        cand, n = f"{base}-{n}", n + 1
    return cand


def new_image(group, item_id):
    """images/<dir>/<id>.webp, using the folder the other items in the group use; null when they have none."""
    for i in group["items"]:
        if isinstance(i.get("image"), str) and "/" in i["image"]:
            return f"{os.path.dirname(i['image'])}/{item_id}.webp"
    return None


# ---------------------------------------------------------------- apply

def money(v, sym="R"):
    return "none" if v is None else f"{sym}{v}"


def apply_ops(docs, ops):
    """Apply `ops` to `docs` ({file_key: parsed JSON}) in place.

    Returns (changed file keys, list of plain-words change notes). Raises OpError for bad input.
    """
    if not isinstance(ops, list) or not ops:
        raise OpError("There are no changes to publish.")
    if len(ops) > MAX_OPS:
        raise OpError("Too many changes at once. Publish in smaller batches.")
    changed, notes, temp_ids = set(), [], {}
    taken = all_ids(docs)

    def doc_for(op):
        key = op.get("file")
        if key not in FILES or key not in docs:
            raise OpError("Unknown menu file.")
        return key, docs[key]

    # Deletes, updates and adds first; group order last, so it can refer to new items.
    for op in sorted(ops, key=lambda o: 1 if isinstance(o, dict) and o.get("op") == "order" else 0):
        if not isinstance(op, dict):
            raise OpError("Bad change format.")
        kind = op.get("op")
        key, doc = doc_for(op)
        sym = doc.get("currency_symbol", "R")
        if kind == "delete":
            hit = find_item(doc, op.get("id"))
            if not hit:
                continue  # already gone
            s, g, n, it = hit
            del g["items"][n]
            notes.append(f"removed {it.get('name')} ({group_label(s, g)})")
        elif kind == "update":
            hit = find_item(doc, op.get("id"))
            if not hit:
                raise OpError(f"An item you edited ({op.get('id')}) was removed elsewhere. Reload the page and try again.")
            s, g, n, it = hit
            before = dict(it)
            apply_fields(it, op.get("set"), key)
            check_item(it, key)
            if it == before:
                continue
            name = it.get("name")
            bits = []
            if before.get("name") != it.get("name"):
                bits.append(f"renamed {before.get('name')} to {name}")
            if before.get("price") != it.get("price"):
                bits.append(f"{name} {money(before.get('price'), sym)} to {money(it.get('price'), sym)}")
            if before.get("available", True) != it.get("available", True):
                bits.append(f"{name} {'back on' if it.get('available', True) else 'hidden'}")
            other = sorted(k for k in set(before) | set(it) if before.get(k) != it.get(k) and k not in ("name", "price", "available"))
            if other:
                bits.append(f"{name}: {', '.join(k.replace('_', ' ') for k in other)}")
            notes.extend(bits)
        elif kind == "add":
            s, g = find_group(doc, op.get("section"), op.get("group"))
            tmp = op.get("tmp")
            if not isinstance(tmp, str) or not tmp.startswith("new:") or tmp in temp_ids:
                raise OpError("Bad change format.")
            fields = op.get("item")
            if not isinstance(fields, dict) or not isinstance(fields.get("name"), str):
                raise OpError("A new item needs a name.")
            name = clean_text(fields["name"], "Name", TEXT_LIMITS["name"])
            if not name:
                raise OpError("A new item needs a name.")
            item_id = new_id(name, g, taken)
            taken.add(item_id)
            item = {"id": item_id, "image": new_image(g, item_id), "name": name}
            if not fields.get("variants"):
                item["price"] = None
            fields = {k: v for k, v in fields.items() if k != "name"}
            fields.setdefault("available", True)
            apply_fields(item, fields, key)
            if "available" not in item:
                item["available"] = True
            check_item(item, key)
            g["items"].append(item)
            temp_ids[tmp] = item_id
            notes.append(f"added {name} ({group_label(s, g)})")
        elif kind == "order":
            s, g = find_group(doc, op.get("section"), op.get("group"))
            ids = op.get("ids")
            if not isinstance(ids, list):
                raise OpError("Bad change format.")
            ids = [temp_ids.get(i, i) for i in ids]
            by_id = {it.get("id"): it for it in g["items"]}
            before = [it.get("id") for it in g["items"]]
            ordered = [by_id.pop(i) for i in ids if i in by_id]
            g["items"] = ordered + [it for it in g["items"] if it.get("id") in by_id]  # items added elsewhere stay, at the end
            if [it.get("id") for it in g["items"]] == before:
                continue
            notes.append(f"reordered {group_label(s, g)}")
        else:
            raise OpError("Bad change format.")
        changed.add(key)

    for key in changed:  # ids must stay unique within each file
        ids = [it.get("id") for s in docs[key]["sections"] for g in s["groups"] for it in g["items"]]
        if len(ids) != len(set(ids)):
            raise OpError("Two items ended up with the same id. Reload the page and try again.")
    return changed, notes
