// Pizza Ratto menu editor. Plain JS, no build step. The page keeps a working copy of the files,
// and "Save and publish" sends only a list of changes (ops) to the server.
(function () {
  "use strict";
  var BASE = document.querySelector('meta[name="base"]').content;
  var CSRF = document.querySelector('meta[name="csrf"]').content;
  var EDITABLE = ["name", "brand", "price", "price_label", "variants", "description", "size", "options", "available"];
  var LIMITS = { name: 60, brand: 60, price_label: 30, description: 300, size: 30 };

  var state = { base: null, work: null, photos: {}, tab: "menu", open: {}, info: null, busy: false, tmpN: 0 };
  var app = document.getElementById("app");
  var tabs = document.getElementById("tabs");
  var bar = document.getElementById("bar");
  var statusEl = document.getElementById("status");

  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") e.textContent = attrs[k];
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] === true) e.setAttribute(k, "");
      else if (attrs[k] !== false && attrs[k] != null) e.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }
  function key(it) { return it._tmp || it.id; }
  function sym(fk) { return (state.work[fk] && state.work[fk].currency_symbol) || "R"; }
  function priceText(it, fk) {
    if (it.variants && it.variants.length) return it.variants.map(function (v) { return v.name + " " + sym(fk) + v.price; }).join(" · ");
    if (typeof it.price === "number") return sym(fk) + it.price;
    return it.price_label || "no price";
  }

  // ------------------------------------------------------------ status messages
  function showStatus(kind, title, lines, detail, links) {
    statusEl.textContent = "";
    var box = el("div", { class: "msg msg-" + kind, role: kind === "err" ? "alert" : "status" }, [el("strong", { text: title })]);
    (lines || []).forEach(function (l) { box.appendChild(el("p", { text: l })); });
    (links || []).forEach(function (l) {
      box.appendChild(el("p", {}, [el("a", { href: l[1], target: "_blank", rel: "noopener noreferrer", text: l[0] })]));
    });
    if (detail) box.appendChild(el("details", {}, [el("summary", { text: "Technical details" }), el("pre", { text: detail })]));
    box.appendChild(el("button", { class: "link", type: "button", text: "Dismiss", onclick: function () { statusEl.textContent = ""; } }));
    statusEl.appendChild(box);
    statusEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ------------------------------------------------------------ loading
  function load() {
    app.textContent = "";
    app.appendChild(el("p", { class: "loading", text: "Loading the latest menu…" }));
    fetch(BASE + "/api/data", { credentials: "same-origin" }).then(function (r) {
      if (r.status === 401) { location.reload(); throw null; }
      return r.json();
    }).then(function (d) {
      if (!d.ok) { app.textContent = ""; showStatus("err", "Couldn't load the menu", [d.error], d.detail); return; }
      state.base = {}; state.work = {};
      Object.keys(d.files).forEach(function (k) { state.base[k] = d.files[k].data; state.work[k] = clone(d.files[k].data); state.base[k]._label = d.files[k].label; });
      state.photos = d.photos; state.info = d;
      render();
    }).catch(function (e) { if (e) showStatus("err", "Couldn't reach the editor", ["Check your connection and reload the page."]); });
  }

  // ------------------------------------------------------------ change list
  function norm(k, v) {
    if (v === undefined || v === null) return null;
    if (typeof v === "string") { v = v.replace(/\s+/g, " ").trim(); return v === "" ? null : v; }
    if (Array.isArray(v)) return v.length ? v : null;
    return v;
  }
  function ops() {
    var out = [];
    Object.keys(state.work).forEach(function (fk) {
      var baseIdx = {};
      state.base[fk].sections.forEach(function (s) { s.groups.forEach(function (g) { g.items.forEach(function (it) { baseIdx[it.id] = it; }); }); });
      var seen = {};
      state.work[fk].sections.forEach(function (s, si) {
        s.groups.forEach(function (g, gi) {
          g.items.forEach(function (it) {
            if (it._tmp) {
              var fields = {};
              EDITABLE.forEach(function (k) { var v = norm(k, it[k]); if (v !== null) fields[k] = v; });
              if (!("price" in fields) && !fields.variants) fields.price = null;
              out.push({ op: "add", file: fk, section: s.id, group: g.id, tmp: it._tmp, item: fields });
              return;
            }
            seen[it.id] = true;
            var b = baseIdx[it.id], set = {};
            EDITABLE.forEach(function (k) {
              var a = norm(k, it[k]), was = norm(k, b[k]);
              if (k === "available") { a = it.available !== false; was = b.available !== false; }
              if (JSON.stringify(a) !== JSON.stringify(was)) set[k] = a;
            });
            if (Object.keys(set).length) out.push({ op: "update", file: fk, id: it.id, set: set });
          });
          var before = state.base[fk].sections[si].groups[gi].items.map(function (x) { return x.id; });
          var now = g.items.map(key);
          var isNew = function (x) { return x.indexOf("new:") === 0; };
          var kept = now.filter(function (x) { return !isNew(x); });
          var stillThere = before.filter(function (x) { return now.indexOf(x) >= 0; });
          var firstNew = now.findIndex(isNew);
          var newAtEnd = firstNew < 0 || now.slice(firstNew).every(isNew);
          if (JSON.stringify(kept) !== JSON.stringify(stillThere) || !newAtEnd)
            out.push({ op: "order", file: fk, section: s.id, group: g.id, ids: now });
        });
      });
      Object.keys(baseIdx).forEach(function (id) { if (!seen[id]) out.push({ op: "delete", file: fk, id: id }); });
    });
    return out;
  }
  function describe(o) {
    var lab = state.base[o.file]._label;
    if (o.op === "add") return lab + ": add " + o.item.name;
    if (o.op === "delete") {
      var hit = null;
      state.base[o.file].sections.forEach(function (s) { s.groups.forEach(function (g) { g.items.forEach(function (it) { if (it.id === o.id) hit = it; }); }); });
      return lab + ": remove " + (hit ? hit.name : o.id);
    }
    if (o.op === "order") return lab + ": new order in " + o.group.replace(/-/g, " ");
    var cur = null;
    state.work[o.file].sections.forEach(function (s) { s.groups.forEach(function (g) { g.items.forEach(function (it) { if (it.id === o.id) cur = it; }); }); });
    return lab + ": " + (cur ? cur.name : o.id) + " (" + Object.keys(o.set).map(function (k) { return k.replace("_", " "); }).join(", ") + ")";
  }
  function updateBar() {
    var n = ops().length;
    bar.hidden = n === 0;
    document.getElementById("count").textContent = n === 1 ? "1 change" : n + " changes";
  }

  // ------------------------------------------------------------ editing widgets
  function fieldsFor(fk, g, it) {
    var used = {};
    g.items.forEach(function (x) { Object.keys(x).forEach(function (k) { used[k] = true; }); });
    var show = ["name"];
    if (used.brand || it.brand !== undefined) show.push("brand");
    if (!(it.variants && it.variants.length && !("price" in it)) || it._tmp) show.push("price");
    if (fk !== "menu" || it.price_label !== undefined) show.push("price_label");
    if (used.variants || it.variants !== undefined) show.push("variants");
    if (used.description || it.description !== undefined) show.push("description");
    if (used.size || it.size !== undefined) show.push("size");
    if (used.options || it.options !== undefined) show.push("options");
    return show;
  }

  function textInput(it, k, label, after, multi) {
    var attrs = { maxlength: LIMITS[k], oninput: function (e) { it[k] = e.target.value; after(); } };
    var input = multi ? el("textarea", Object.assign({ rows: 3 }, attrs)) : el("input", Object.assign({ type: "text" }, attrs));
    input.value = it[k] == null ? "" : it[k];
    return el("label", {}, [label, input]);
  }
  function priceInput(label, value, onchange) {
    var input = el("input", { type: "text", inputmode: "decimal", pattern: "[0-9]*[.,]?[0-9]*", placeholder: "e.g. 85", oninput: function (e) {
      var v = e.target.value.replace(",", ".").trim();
      var n = v === "" ? null : Number(v);
      e.target.classList.toggle("bad", v !== "" && (isNaN(n) || n < 0));
      onchange(v === "" ? null : (isNaN(n) ? v : n));
    } });
    input.value = value == null ? "" : value;
    return el("label", { class: "price" }, [label, input]);
  }

  function itemCard(fk, s, g, it, idx) {
    var k = key(it);
    var summaryName = el("b", { text: it.name || "New item" });
    var summaryPrice = el("span", { class: "p", text: priceText(it, fk) });
    var badges = el("span", { class: "badges" });
    function refreshSummary() {
      summaryName.textContent = it.name || "New item";
      summaryPrice.textContent = priceText(it, fk);
      badges.textContent = "";
      if (it.available === false) badges.appendChild(el("i", { class: "badge off", text: "hidden" }));
      if (it._tmp) badges.appendChild(el("i", { class: "badge new", text: "new" }));
      updateBar();
    }
    refreshSummary();
    var body = el("div", { class: "fields" });
    var shown = fieldsFor(fk, g, it);
    shown.forEach(function (f) {
      if (f === "name") body.appendChild(textInput(it, "name", "Name", refreshSummary));
      if (f === "brand") body.appendChild(textInput(it, "brand", "Brand", refreshSummary));
      if (f === "price") body.appendChild(priceInput("Price (" + sym(fk) + ")", it.price, function (v) { it.price = v; refreshSummary(); }));
      if (f === "price_label") body.appendChild(textInput(it, "price_label", "Price text when there is no price (e.g. POA, Varies)", refreshSummary));
      if (f === "description") body.appendChild(textInput(it, "description", "Description", refreshSummary, true));
      if (f === "size") body.appendChild(textInput(it, "size", "Size (e.g. 500ml)", refreshSummary));
      if (f === "options") {
        var ta = el("textarea", { rows: 3, oninput: function (e) {
          it.options = e.target.value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean); refreshSummary();
        } });
        ta.value = (it.options || []).join("\n");
        body.appendChild(el("label", {}, ["Flavours / options (one per line)", ta]));
      }
      if (f === "variants") {
        var box = el("fieldset", { class: "variants" }, [el("legend", { text: "Sizes with their own price" })]);
        (it.variants || []).forEach(function (v, vi) {
          var name = el("input", { type: "text", maxlength: 30, "aria-label": "Size name", oninput: function (e) { v.name = e.target.value; refreshSummary(); } });
          name.value = v.name || "";
          box.appendChild(el("div", { class: "vrow" }, [name,
            priceInput(sym(fk), v.price, function (p) { v.price = p; refreshSummary(); }),
            el("button", { type: "button", class: "btn small", "aria-label": "Remove size", text: "✕", onclick: function () {
              it.variants.splice(vi, 1); if (!it.variants.length) delete it.variants; render();
            } })]));
        });
        box.appendChild(el("button", { type: "button", class: "btn small", text: "+ Add size", onclick: function () {
          it.variants = (it.variants || []).concat([{ name: "", price: null }]); state.open[fk + k] = true; render();
        } }));
        body.appendChild(box);
      }
    });
    var avail = el("input", { type: "checkbox", role: "switch", onchange: function (e) { it.available = e.target.checked; refreshSummary(); } });
    avail.checked = it.available !== false;
    body.appendChild(el("label", { class: "switch" }, [avail, el("span", { text: "On the menu (untick to hide it from the site without deleting it)" })]));
    if (!it._tmp) {
      var photo = state.photos[fk] && state.photos[fk][it.id];
      body.appendChild(el("p", { class: "hint", text: photo ? "Has a photo." : (it.image ? "No photo yet: the site shows a 'photo coming hot' tile." : "") }));
    } else {
      body.appendChild(el("p", { class: "hint", text: "New items show a 'photo coming hot' tile until a photo is added to the site." }));
    }
    var items = g.items;
    body.appendChild(el("div", { class: "row actions" }, [
      el("button", { type: "button", class: "btn small", text: "↑ Up", disabled: idx === 0, onclick: function () { move(items, idx, -1, fk + k); } }),
      el("button", { type: "button", class: "btn small", text: "↓ Down", disabled: idx === items.length - 1, onclick: function () { move(items, idx, 1, fk + k); } }),
      el("button", { type: "button", class: "btn small danger", text: "Delete", onclick: function () {
        if (confirm("Delete " + (it.name || "this new item") + "? It is removed when you publish. To hide it for now, untick 'On the menu' instead.")) {
          items.splice(idx, 1); render();
        }
      } })
    ]));
    var det = el("details", { class: "item" + (it.available === false ? " is-off" : ""), ontoggle: function () { state.open[fk + k] = det.open; } },
      [el("summary", {}, [summaryName, badges, summaryPrice]), body]);
    if (state.open[fk + k]) det.open = true;
    return det;
  }
  function move(items, idx, d, openKey) {
    var t = items[idx]; items[idx] = items[idx + d]; items[idx + d] = t;
    state.open[openKey] = true; render();
  }

  // ------------------------------------------------------------ render
  function render() {
    tabs.textContent = "";
    Object.keys(state.work).forEach(function (fk) {
      tabs.appendChild(el("button", { type: "button", role: "tab", "aria-selected": fk === state.tab ? "true" : "false", class: "tab",
        text: state.base[fk]._label, onclick: function () { state.tab = fk; render(); } }));
    });
    app.textContent = "";
    if (state.info) {
      var note = "Editing branch " + state.info.target + " (version " + state.info.head + ").";
      if (state.info.dry_run) note += " Test mode: saves are built and checked but not published.";
      app.appendChild(el("p", { class: "hint", text: note }));
    }
    var fk = state.tab, doc = state.work[fk];
    doc.sections.forEach(function (s) {
      var sec = el("section", { class: "sec" }, [el("h2", { text: s.title || s.id })]);
      s.groups.forEach(function (g) {
        var grp = el("div", { class: "grp" });
        if (g.title) grp.appendChild(el("h3", { text: g.title + (g.note ? " · " + g.note : "") }));
        g.items.forEach(function (it, i) { grp.appendChild(itemCard(fk, s, g, it, i)); });
        grp.appendChild(el("button", { type: "button", class: "btn add", text: "+ Add item to " + (g.title || s.title), onclick: function () {
          state.tmpN += 1;
          var it = { _tmp: "new:" + state.tmpN, name: "", available: true };
          var hasPrice = g.items.some(function (x) { return "price" in x; });
          if (hasPrice || !g.items.length) it.price = null;
          g.items.push(it); state.open[fk + it._tmp] = true; render();
          var cards = grp.ownerDocument.querySelectorAll("details[open] input[type=text]");
          if (cards.length) cards[cards.length - 1].focus();
        } }));
        sec.appendChild(grp);
      });
      app.appendChild(sec);
    });
    updateBar();
  }

  // ------------------------------------------------------------ save
  document.getElementById("discard").addEventListener("click", function () {
    if (!confirm("Throw away all unsaved changes?")) return;
    Object.keys(state.base).forEach(function (k) { state.work[k] = clone(state.base[k]); });
    state.open = {}; render();
  });
  var dialog = document.getElementById("confirm");
  document.getElementById("save").addEventListener("click", function () {
    var list = ops();
    if (!list.length || state.busy) return;
    var ul = document.getElementById("confirm-list"); ul.textContent = "";
    list.forEach(function (o) { ul.appendChild(el("li", { text: describe(o) })); });
    document.getElementById("confirm-note").textContent = state.info && state.info.dry_run
      ? "Test mode: this builds and checks the site but does not publish it."
      : "This updates the live website. It can take a few minutes to show.";
    if (dialog.showModal) dialog.showModal(); else if (confirm("Publish these changes?")) doSave(list);
  });
  dialog.addEventListener("close", function () { if (dialog.returnValue === "ok") doSave(ops()); });

  function doSave(list) {
    state.busy = true;
    var btn = document.getElementById("save");
    btn.disabled = true; btn.textContent = "Publishing…";
    showStatus("info", "Publishing…", ["Building and checking the site. This takes up to a minute. Keep this page open."]);
    fetch(BASE + "/api/publish", {
      method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": CSRF },
      body: JSON.stringify({ ops: list })
    }).then(function (r) { return r.json().catch(function () { return { ok: false, error: "The server sent an unexpected reply (" + r.status + ")." }; }); })
      .then(function (d) {
        if (d.ok) {
          var lines = (d.notes || []).map(function (n) { return "• " + n; }).concat(d.warnings || []);
          if (d.dry_run) {
            showStatus("ok", "Test save worked (not published)", ["The site built and passed its checks. Test mode is on, so nothing went to the live site."].concat(lines));
          } else {
            showStatus("ok", "Published", ["Your changes are saved. The live site updates within a few minutes."].concat(lines),
              null, [["Open the live site", d.site_url], ["See the change on GitHub", d.commit_url]]);
          }
          load();
        } else {
          showStatus("err", "Not published", [d.error || "Something went wrong."], d.detail);
        }
      }).catch(function () { showStatus("err", "Not published", ["Couldn't reach the editor. Check your connection; if the save went through, reloading will show it."]); })
      .then(function () { state.busy = false; btn.disabled = false; btn.textContent = "Save and publish"; });
  }

  window.addEventListener("beforeunload", function (e) { if (state.work && ops().length && !state.busy) { e.preventDefault(); e.returnValue = ""; } });
  load();
})();
