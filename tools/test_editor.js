// Run: node tools/test_editor.js
// Round-trips the for-sale JSON through the editor's writer and checks its rules.
"use strict";
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const lib = require("../editor/editor-lib.js");

const DIR = path.join(__dirname, "..", "site-references", "for-sale");
const raws = {}, docs = {};
for (const [k, f] of Object.entries(lib.FILES)) {
  raws[k] = fs.readFileSync(path.join(DIR, f), "utf8");
  docs[k] = JSON.parse(raws[k]);
  assert.strictEqual(lib.dumps(docs[k], lib.blankAfterIds(raws[k])), raws[k], k + " does not round-trip");
}
const copy = (x) => JSON.parse(JSON.stringify(x));

const d = copy(docs);
const res = lib.applyOps(d, [
  { op: "update", file: "menu", id: "sprint", set: { price: 170, description: "Hot honey, salami" } },
  { op: "add", file: "menu", section: "pizza", group: "pizzas", tmp: "new:1", item: { name: "Calzoné Special", price: 150, description: "Folded", available: true } },
  { op: "add", file: "menu", section: "pizza", group: "extra-toppings", tmp: "new:2", item: { name: "Olives", price: 10 } },
  { op: "delete", file: "menu", id: "rally" },
  { op: "order", file: "menu", section: "pizza", group: "pizzas", ids: ["new:1", "bianca"] },
  { op: "update", file: "merchandise", id: "jackets", set: { price: 900, price_label: null } },
]);
const pizzas = d.menu.sections[0].groups[0].items;
assert.deepStrictEqual(pizzas.slice(0, 2).map((i) => i.id), ["calzone-special", "bianca"]);
assert.strictEqual(JSON.stringify(pizzas[0]), JSON.stringify({ id: "calzone-special", image: "images/pizza/calzone-special.webp", name: "Calzoné Special", price: 150, description: "Folded", available: true }));
assert.strictEqual(d.menu.sections[0].groups[1].items.slice(-1)[0].id, "extra-olives");
assert.ok(!pizzas.some((i) => i.id === "rally"));
const jackets = d.merchandise.sections[0].groups[0].items[1];
assert.strictEqual(JSON.stringify(jackets), JSON.stringify({ id: "jackets", image: "images/merchandise/jackets.webp", name: "Jackets", price: 900, available: true }));
assert.deepStrictEqual(res.changed.sort(), ["menu", "merchandise"]);

// The written file must still parse and keep the extra-topping blank lines.
const out = lib.dumps(d.menu, lib.blankAfterIds(raws.menu));
assert.deepStrictEqual(JSON.parse(out), JSON.parse(JSON.stringify(d.menu)));

const bad = [
  { set: { name: "<script>" } }, { set: { price: "12" } }, { set: { price: null } },
  { set: { image: "x" } }, { set: { description: "x".repeat(301) } }, { set: { price: 42.5 } },
];
for (const b of bad) {
  assert.throws(() => lib.applyOps(copy(docs), [{ op: "update", file: "menu", id: "sprint", set: b.set }]),
    (e) => { console.log("rejected as expected:", e.message); return e instanceof lib.OpError; });
}
console.log("all ok;", res.notes);
