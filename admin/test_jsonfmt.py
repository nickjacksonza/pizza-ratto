"""Run: python3 admin/test_jsonfmt.py  (round-trips the for-sale JSON and exercises menu_ops)."""
import copy
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import jsonfmt  # noqa: E402
import menu_ops  # noqa: E402

DIR = HERE.parent / "site-references" / "for-sale"
raws = {k: (DIR / f).read_text(encoding="utf-8") for k, f in menu_ops.FILES.items()}
docs = {k: json.loads(v) for k, v in raws.items()}

for k, raw in raws.items():
    assert jsonfmt.dumps(docs[k], jsonfmt.blank_after_ids(raw)) == raw, f"{k} does not round-trip"

d = copy.deepcopy(docs)
changed, notes = menu_ops.apply_ops(d, [
    {"op": "update", "file": "menu", "id": "sprint", "set": {"price": 170, "description": "Hot honey, salami"}},
    {"op": "add", "file": "menu", "section": "pizza", "group": "pizzas", "tmp": "new:1",
     "item": {"name": "Calzoné Special", "price": 150, "description": "Folded", "available": True}},
    {"op": "add", "file": "menu", "section": "pizza", "group": "extra-toppings", "tmp": "new:2", "item": {"name": "Olives", "price": 10}},
    {"op": "delete", "file": "menu", "id": "rally"},
    {"op": "order", "file": "menu", "section": "pizza", "group": "pizzas", "ids": ["new:1", "bianca"]},
    {"op": "update", "file": "merchandise", "id": "jackets", "set": {"price": 900, "price_label": None}},
])
pizzas = d["menu"]["sections"][0]["groups"][0]["items"]
assert [i["id"] for i in pizzas][:2] == ["calzone-special", "bianca"], pizzas[:2]
assert pizzas[0] == {"id": "calzone-special", "image": "images/pizza/calzone-special.webp", "name": "Calzoné Special",
                     "price": 150, "description": "Folded", "available": True}, pizzas[0]
assert d["menu"]["sections"][0]["groups"][1]["items"][-1]["id"] == "extra-olives"
assert "rally" not in [i["id"] for i in pizzas]
jackets = d["merchandise"]["sections"][0]["groups"][0]["items"][1]
assert jackets == {"id": "jackets", "image": "images/merchandise/jackets.webp", "name": "Jackets", "price": 900, "available": True}
assert changed == {"menu", "merchandise"}, changed

for bad in ([{"op": "update", "file": "menu", "id": "sprint", "set": {"name": "<script>"}}],
            [{"op": "update", "file": "menu", "id": "sprint", "set": {"price": "12"}}],
            [{"op": "update", "file": "menu", "id": "sprint", "set": {"price": None}}],
            [{"op": "update", "file": "menu", "id": "sprint", "set": {"image": "x"}}],
            [{"op": "update", "file": "menu", "id": "sprint", "set": {"description": "x" * 301}}]):
    try:
        menu_ops.apply_ops(copy.deepcopy(docs), bad)
    except menu_ops.OpError as e:
        print("rejected as expected:", e)
    else:
        raise AssertionError(f"accepted {bad}")
print("all ok;", notes)
