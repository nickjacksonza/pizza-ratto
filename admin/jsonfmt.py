"""Write the for-sale JSON files in the same hand-made style the repo uses.

The files are 2-space indented, but short items sit on one line ({ "id": ..., "available": true }),
arrays of plain values are inline (["Still", "Sparkling"]) and variant objects are inline.
json.dumps cannot produce that, so this small writer does. `dumps(json.loads(text), blank_after_ids(text)) == text`
holds for menu.json, deli.json and merchandise.json (tested in admin/test_jsonfmt.py).
"""
import json
import re

# An object inside a list goes on one line when every value is a plain value and every key is one of these.
INLINE_KEYS = {"id", "image", "name", "price", "price_label", "available"}


def _scalar(v):
    return v is None or isinstance(v, (str, int, float, bool))


def _atom(v):
    return json.dumps(v, ensure_ascii=False)


def _inline_obj(d):
    if not d:
        return "{}"
    return "{ " + ", ".join(f"{_atom(k)}: {_atom(v)}" for k, v in d.items()) + " }"


def blank_after_ids(raw):
    """Ids of list items followed by an empty line (menu.json groups extra toppings by price this way)."""
    ids, last = set(), None
    for line in raw.splitlines():
        m = re.search(r'"id":\s*"([^"]*)"', line)
        if m:
            last = m.group(1)
        elif not line.strip() and last:
            ids.add(last)
    return ids


def _write(v, ind, in_list=False, blanks=frozenset()):
    pad = "  " * ind
    if isinstance(v, dict):
        if in_list and all(_scalar(x) for x in v.values()) and set(v) <= INLINE_KEYS:
            return _inline_obj(v)
        if not v:
            return "{}"
        inner = "  " * (ind + 1)
        rows = [f"{inner}{_atom(k)}: {_write(x, ind + 1, blanks=blanks)}" for k, x in v.items()]
        return "{\n" + ",\n".join(rows) + "\n" + pad + "}"
    if isinstance(v, list):
        if not v:
            return "[]"
        if all(_scalar(x) for x in v):
            return "[" + ", ".join(_atom(x) for x in v) + "]"
        inner = "  " * (ind + 1)
        out = ""
        for n, x in enumerate(v):
            if isinstance(x, dict) and all(_scalar(y) for y in x.values()) and set(x) <= {"name", "price"}:
                out += inner + _inline_obj(x)  # variants
            else:
                out += inner + _write(x, ind + 1, in_list=True, blanks=blanks)
            if n < len(v) - 1:
                out += ",\n" + ("\n" if isinstance(x, dict) and x.get("id") in blanks else "")
        return "[\n" + out + "\n" + pad + "]"
    return _atom(v)


def dumps(data, blanks=frozenset()):
    """Serialise `data`. `blanks` = item ids to follow with an empty line (from blank_after_ids)."""
    return _write(data, 0, blanks=blanks) + "\n"
