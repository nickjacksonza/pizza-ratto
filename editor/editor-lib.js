// Pizza Ratto menu editor: rules and JSON writer. No DOM here, so tools/test_editor.js can run it in Node.
(function (root) {
  "use strict";

  var FILES = { menu: "menu.json", deli: "deli.json", merchandise: "merchandise.json" };
  var LABELS = { menu: "Menu", deli: "Deli", merchandise: "Merchandise" };
  // Key order for fields the editor adds. Existing keys keep their place.
  var KEY_ORDER = ["id", "image", "name", "brand", "price", "price_label", "variants", "description", "size", "options", "available"];
  var TEXT_LIMITS = { name: 60, brand: 60, price_label: 30, description: 300, size: 30 };
  var EDITABLE = Object.keys(TEXT_LIMITS).concat(["price", "variants", "options", "available"]);
  var MAX_PRICE = 100000;
  var MAX_OPS = 500;
  var BAD_CHARS = /[<>\x00-\x1f\x7f]/;

  function OpError(message) { this.message = message; this.name = "OpError"; }
  OpError.prototype = Object.create(Error.prototype);

  function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function get(o, k) { return has(o, k) ? o[k] : undefined; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // ---------------------------------------------------------------- values

  function cleanText(value, field, limit) {
    if (typeof value !== "string") throw new OpError(field + " must be text.");
    value = value.split(/\s+/).filter(Boolean).join(" ");
    if (value.length > limit) throw new OpError(field + " is too long (" + value.length + " characters, the limit is " + limit + ").");
    if (BAD_CHARS.test(value)) throw new OpError(field + " can't contain < or > or control characters.");
    return value;
  }

  function cleanPrice(value, field) {
    field = field || "Price";
    // Whole rand only: the site prints the number as is, so 42.5 would show as "R42.5".
    if (typeof value !== "number" || !Number.isInteger(value)) throw new OpError(field + " must be a whole number of rand, like 85.");
    if (value < 0 || value > MAX_PRICE) throw new OpError(field + " must be between 0 and " + MAX_PRICE + ".");
    return value;
  }

  function cleanField(key, value) {
    if (has(TEXT_LIMITS, key)) {
      if (value === null || value === undefined) return null;
      value = cleanText(value, cap(key.replace("_", " ")), TEXT_LIMITS[key]);
      return value || null;
    }
    if (key === "available") {
      if (typeof value !== "boolean") throw new OpError("Available must be on or off.");
      return value;
    }
    if (key === "price") return value === null || value === undefined ? null : cleanPrice(value);
    if (key === "options") {
      if (value === null || value === undefined) return null;
      if (!Array.isArray(value) || value.length > 20) throw new OpError("Options must be a list of at most 20 entries.");
      var opts = value.map(function (v) { return cleanText(v, "Option", 40); }).filter(Boolean);
      return opts.length ? opts : null;
    }
    if (key === "variants") {
      if (value === null || value === undefined) return null;
      if (!Array.isArray(value) || value.length > 10) throw new OpError("Sizes/variants must be a list of at most 10 entries.");
      var out = value.map(function (v) {
        if (!v || typeof v !== "object" || Array.isArray(v) || Object.keys(v).some(function (k) { return k !== "name" && k !== "price"; }))
          throw new OpError("Each variant needs a name and a price.");
        var name = cleanText(has(v, "name") ? v.name : "", "Variant name", 30);
        if (!name) throw new OpError("Each variant needs a name.");
        return { name: name, price: cleanPrice(get(v, "price"), "Price for " + name) };
      });
      return out.length ? out : null;
    }
    throw new OpError("The field '" + key + "' can't be edited here.");
  }

  // Set item[key], placing a new key by KEY_ORDER so the file keeps its usual order. Mutates item in place.
  function setKey(item, key, value) {
    if (has(item, key)) { item[key] = value; return; }
    var rank = KEY_ORDER.indexOf(key);
    var pairs = Object.keys(item).map(function (k) { return [k, item[k]]; });
    var pos = pairs.length;
    for (var n = 0; n < pairs.length; n++) {
      var r = KEY_ORDER.indexOf(pairs[n][0]);
      if (r >= 0 && r > rank) { pos = n; break; }
    }
    pairs.splice(pos, 0, [key, value]);
    Object.keys(item).forEach(function (k) { delete item[k]; });
    pairs.forEach(function (p) { item[p[0]] = p[1]; });
  }

  function applyFields(item, fields, fileKey) {
    if (!fields || typeof fields !== "object" || Array.isArray(fields)) throw new OpError("Bad change format.");
    Object.keys(fields).forEach(function (key) {
      if (EDITABLE.indexOf(key) < 0) throw new OpError("The field '" + key + "' can't be edited here.");
      var value = cleanField(key, fields[key]);
      if (key === "price") {
        if (value === null && fileKey === "menu" && !((item.variants && item.variants.length) || (fields.variants && fields.variants.length)))
          throw new OpError((item.name || "A new item") + " needs a price.");
        if (value === null && !has(item, "price")) return;
        setKey(item, "price", value);
      } else if (value === null) {
        delete item[key];
      } else {
        setKey(item, key, value);
      }
    });
  }

  function isNum(v) { return typeof v === "number"; }

  function checkItem(item, fileKey) {
    var name = item.name;
    if (typeof name !== "string" || !name.trim()) throw new OpError("Every item needs a name.");
    if (item.variants && item.variants.length) return;
    if (isNum(item.price)) return;
    if (fileKey !== "menu" && (item.price === null || item.price === undefined) && item.price_label) return;
    if (fileKey === "menu") throw new OpError(name + " needs a price (or sizes with prices).");
    throw new OpError(name + " needs a price, or a price text such as POA.");
  }

  // ---------------------------------------------------------------- ids and lookups

  function slugify(name) {
    var s = name.normalize("NFKD").replace(/[^\x00-\x7f]/g, "");
    s = s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return s.slice(0, 50).replace(/^-+|-+$/g, "") || "item";
  }

  function eachItem(doc, fn) {
    doc.sections.forEach(function (s) { s.groups.forEach(function (g) { g.items.forEach(function (it, n) { fn(s, g, n, it); }); }); });
  }

  function allIds(docs) {
    var ids = {};
    Object.keys(docs).forEach(function (k) { eachItem(docs[k], function (s, g, n, it) { ids[it.id] = true; }); });
    return ids;
  }

  function findItem(doc, id) {
    var hit = null;
    eachItem(doc, function (s, g, n, it) { if (!hit && it.id === id) hit = { s: s, g: g, n: n, it: it }; });
    return hit;
  }

  function findGroup(doc, sectionId, groupId) {
    for (var i = 0; i < doc.sections.length; i++) {
      var s = doc.sections[i];
      if (s.id !== sectionId) continue;
      for (var j = 0; j < s.groups.length; j++) if (s.groups[j].id === groupId) return { s: s, g: s.groups[j] };
    }
    throw new OpError("That category no longer exists. Reload the page.");
  }

  function groupLabel(s, g) { return g.title || s.title || g.id; }

  // Slug from the name, with the group's shared id prefix (extra toppings use 'extra-'), unique across all files.
  function newId(name, group, taken) {
    var sib = group.items.map(function (i) { return i.id; }).filter(function (i) { return typeof i === "string"; });
    var prefix = "";
    if (sib.length > 1) {
      var p = sib[0].split("-")[0] + "-";
      if (sib.every(function (i) { return i.indexOf(p) === 0; })) prefix = p;
    }
    var base = slugify(name);
    if (prefix && base.indexOf(prefix) !== 0) base = prefix + base;
    var cand = base, n = 2;
    while (taken[cand]) { cand = base + "-" + n; n += 1; }
    return cand;
  }

  // images/<dir>/<id>.webp, using the folder the other items in the group use; null when they have none.
  function newImage(group, id) {
    for (var i = 0; i < group.items.length; i++) {
      var img = group.items[i].image;
      if (typeof img === "string" && img.indexOf("/") >= 0) return img.slice(0, img.lastIndexOf("/")) + "/" + id + ".webp";
    }
    return null;
  }

  // ---------------------------------------------------------------- apply

  function money(v, sym) { return v === null || v === undefined ? "none" : (sym || "R") + v; }

  // Apply ops to docs ({fileKey: parsed JSON}) in place. Returns {changed: [fileKeys], notes: [plain words]}.
  function applyOps(docs, ops) {
    if (!Array.isArray(ops) || !ops.length) throw new OpError("There are no changes to publish.");
    if (ops.length > MAX_OPS) throw new OpError("Too many changes at once. Publish in smaller batches.");
    var changed = {}, notes = [], tempIds = {};
    var taken = allIds(docs);
    // Deletes, updates and adds first; group order last, so it can refer to new items.
    var sorted = ops.filter(function (o) { return !(o && o.op === "order"); }).concat(ops.filter(function (o) { return o && o.op === "order"; }));

    sorted.forEach(function (op) {
      if (!op || typeof op !== "object") throw new OpError("Bad change format.");
      var key = op.file;
      if (!has(FILES, key) || !has(docs, key)) throw new OpError("Unknown menu file.");
      var doc = docs[key], sym = doc.currency_symbol || "R", hit, sg;
      if (op.op === "delete") {
        hit = findItem(doc, op.id);
        if (!hit) return; // already gone
        hit.g.items.splice(hit.n, 1);
        notes.push("removed " + hit.it.name + " (" + groupLabel(hit.s, hit.g) + ")");
      } else if (op.op === "update") {
        hit = findItem(doc, op.id);
        if (!hit) throw new OpError("An item you edited (" + op.id + ") was removed elsewhere. Reload the page and try again.");
        var it = hit.it, before = JSON.parse(JSON.stringify(it));
        applyFields(it, op.set, key);
        checkItem(it, key);
        var keys = {};
        Object.keys(before).concat(Object.keys(it)).forEach(function (k) { keys[k] = true; });
        var diff = Object.keys(keys).filter(function (k) { return !same(get(before, k), get(it, k)); });
        if (!diff.length) return;
        var name = it.name;
        if (before.name !== it.name) notes.push("renamed " + before.name + " to " + name);
        if (!same(get(before, "price"), get(it, "price"))) notes.push(name + " " + money(before.price, sym) + " to " + money(it.price, sym));
        if ((before.available !== false) !== (it.available !== false)) notes.push(name + " " + (it.available !== false ? "back on" : "hidden"));
        var other = diff.filter(function (k) { return ["name", "price", "available"].indexOf(k) < 0; }).sort();
        if (other.length) notes.push(name + ": " + other.map(function (k) { return k.replace("_", " "); }).join(", "));
      } else if (op.op === "add") {
        sg = findGroup(doc, op.section, op.group);
        var tmp = op.tmp;
        if (typeof tmp !== "string" || tmp.indexOf("new:") !== 0 || has(tempIds, tmp)) throw new OpError("Bad change format.");
        var f = op.item;
        if (!f || typeof f !== "object" || typeof f.name !== "string") throw new OpError("A new item needs a name.");
        var nm = cleanText(f.name, "Name", TEXT_LIMITS.name);
        if (!nm) throw new OpError("A new item needs a name.");
        var id = newId(nm, sg.g, taken);
        taken[id] = true;
        var item = { id: id, image: newImage(sg.g, id), name: nm };
        if (!(f.variants && f.variants.length)) item.price = null;
        var rest = {};
        Object.keys(f).forEach(function (k) { if (k !== "name") rest[k] = f[k]; });
        if (!has(rest, "available")) rest.available = true;
        applyFields(item, rest, key);
        if (!has(item, "available")) item.available = true;
        checkItem(item, key);
        sg.g.items.push(item);
        tempIds[tmp] = id;
        notes.push("added " + nm + " (" + groupLabel(sg.s, sg.g) + ")");
      } else if (op.op === "order") {
        sg = findGroup(doc, op.section, op.group);
        if (!Array.isArray(op.ids)) throw new OpError("Bad change format.");
        var ids = op.ids.map(function (i) { return has(tempIds, i) ? tempIds[i] : i; });
        var beforeIds = sg.g.items.map(function (x) { return x.id; });
        var byId = {};
        sg.g.items.forEach(function (x) { byId[x.id] = x; });
        var ordered = [];
        ids.forEach(function (i) { if (has(byId, i)) { ordered.push(byId[i]); delete byId[i]; } });
        sg.g.items = ordered.concat(sg.g.items.filter(function (x) { return has(byId, x.id); })); // items added elsewhere stay, at the end
        if (same(sg.g.items.map(function (x) { return x.id; }), beforeIds)) return;
        notes.push("reordered " + groupLabel(sg.s, sg.g));
      } else {
        throw new OpError("Bad change format.");
      }
      changed[key] = true;
    });

    Object.keys(changed).forEach(function (key) { // ids must stay unique within each file
      var seen = {};
      eachItem(docs[key], function (s, g, n, it) {
        if (has(seen, it.id)) throw new OpError("Two items ended up with the same id. Reload the page and try again.");
        seen[it.id] = true;
      });
    });
    return { changed: Object.keys(changed), notes: notes, ids: tempIds };
  }

  // ---------------------------------------------------------------- JSON writer
  // The files are 2-space indented, but short items sit on one line, arrays of plain values are inline
  // and variant objects are inline. dumps(JSON.parse(raw), blankAfterIds(raw)) === raw for all three files.

  var INLINE_KEYS = ["id", "image", "name", "price", "price_label", "available"];

  function scalar(v) { return v === null || ["string", "number", "boolean"].indexOf(typeof v) >= 0; }
  function atom(v) { return JSON.stringify(v); }
  function isObj(v) { return v !== null && typeof v === "object" && !Array.isArray(v); }
  function inlineObj(d) {
    var ks = Object.keys(d);
    if (!ks.length) return "{}";
    return "{ " + ks.map(function (k) { return atom(k) + ": " + atom(d[k]); }).join(", ") + " }";
  }
  function onlyKeys(d, allowed) { return Object.keys(d).every(function (k) { return allowed.indexOf(k) >= 0; }); }
  function allScalar(d) { return Object.keys(d).every(function (k) { return scalar(d[k]); }); }

  // Ids of list items followed by an empty line (menu.json groups extra toppings by price this way).
  function blankAfterIds(raw) {
    var ids = {}, last = null;
    raw.split(/\r?\n/).forEach(function (line) {
      var m = /"id":\s*"([^"]*)"/.exec(line);
      if (m) last = m[1];
      else if (!line.trim() && last) ids[last] = true;
    });
    return ids;
  }

  function write(v, ind, inList, blanks) {
    var pad = new Array(ind + 1).join("  ");
    var inner = pad + "  ";
    if (isObj(v)) {
      if (inList && allScalar(v) && onlyKeys(v, INLINE_KEYS)) return inlineObj(v);
      var ks = Object.keys(v);
      if (!ks.length) return "{}";
      return "{\n" + ks.map(function (k) { return inner + atom(k) + ": " + write(v[k], ind + 1, false, blanks); }).join(",\n") + "\n" + pad + "}";
    }
    if (Array.isArray(v)) {
      if (!v.length) return "[]";
      if (v.every(scalar)) return "[" + v.map(atom).join(", ") + "]";
      var out = "";
      v.forEach(function (x, n) {
        if (isObj(x) && allScalar(x) && onlyKeys(x, ["name", "price"])) out += inner + inlineObj(x); // variants
        else out += inner + write(x, ind + 1, true, blanks);
        if (n < v.length - 1) out += ",\n" + (isObj(x) && has(blanks, x.id) ? "\n" : "");
      });
      return "[\n" + out + "\n" + pad + "]";
    }
    return atom(v);
  }

  function dumps(data, blanks) { return write(data, 0, false, blanks || {}) + "\n"; }

  // ---------------------------------------------------------------- club night (src/data/site.json, meet_night)
  // The owner edits the heading and the label/value rows. Other keys in meet_night and site.json are kept.

  var CLUB_LIMITS = { heading: 60, label: 20, value: 120, rows: 8 };

  function cleanClub(club) {
    if (!club || typeof club !== "object" || !Array.isArray(club.rows)) throw new OpError("Bad club night format.");
    var heading = cleanText(club.heading || "", "Club night heading", CLUB_LIMITS.heading);
    if (!heading) throw new OpError("The club night needs a heading, such as the date.");
    if (!club.rows.length) throw new OpError("The club night needs at least one detail line.");
    if (club.rows.length > CLUB_LIMITS.rows) throw new OpError("The club night can have at most " + CLUB_LIMITS.rows + " detail lines.");
    var rows = club.rows.map(function (r) {
      if (!Array.isArray(r) || r.length !== 2) throw new OpError("Bad club night format.");
      var k = cleanText(r[0] || "", "Detail name", CLUB_LIMITS.label), v = cleanText(r[1] || "", "Detail", CLUB_LIMITS.value);
      if (!k || !v) throw new OpError("Every club night line needs a name (like Time) and a detail.");
      return [k, v];
    });
    return { heading: heading, rows: rows };
  }

  // Apply the owner's club night to a parsed site.json in place. Returns plain-words notes ([] when nothing changed).
  function applyClub(site, club) {
    var m = site.meet_night;
    if (!m) throw new OpError("The club night section is missing from the site data.");
    var c = cleanClub(club), notes = [];
    if (m.heading !== c.heading) notes.push("club night heading: " + c.heading);
    var before = {};
    (m.rows || []).forEach(function (r) { before[r[0]] = r[1]; });
    c.rows.forEach(function (r) { if (before[r[0]] !== r[1]) notes.push("club night " + r[0] + ": " + r[1]); });
    var now = c.rows.map(function (r) { return r[0]; });
    Object.keys(before).forEach(function (k) { if (now.indexOf(k) < 0) notes.push("club night: removed " + k); });
    if (!notes.length && !same(m.rows, c.rows)) notes.push("club night: new order");
    m.heading = c.heading; m.rows = c.rows;
    return notes;
  }

  function dumpsSite(site) { return JSON.stringify(site, null, 2) + "\n"; }

  var lib = { FILES: FILES, applyClub: applyClub, dumpsSite: dumpsSite, CLUB_LIMITS: CLUB_LIMITS, LABELS: LABELS, TEXT_LIMITS: TEXT_LIMITS, OpError: OpError, applyOps: applyOps,
              dumps: dumps, blankAfterIds: blankAfterIds, slugify: slugify };
  if (typeof module !== "undefined" && module.exports) module.exports = lib;
  else root.EditorLib = lib;
})(this);
