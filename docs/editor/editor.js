// Pizza Ratto menu editor. Static page on GitHub Pages; no server.
// Sign-in: the password decrypts a GitHub token stored encrypted in sealed.json (PBKDF2-SHA256 + AES-GCM, Web Crypto).
// Save: applies the owner's changes to fresh copies of the JSON from GitHub, writes them in the repo's layout,
// commits them to main in one commit through the GitHub API, then follows the "Rebuild docs" workflow run.
(function () {
  "use strict";
  var L = window.EditorLib;
  var OWNER = "nickjacksonza", REPO = "pizza-ratto";
  var BRANCH = new URLSearchParams(location.search).get("branch") || "main"; // ?branch=x for a test run that doesn't go live
  var LIVE = BRANCH === "main";
  var SITE_URL = "https://pizzaratto.com/";
  var DIR = "site-references/for-sale/";
  var API = "https://api.github.com/repos/" + OWNER + "/" + REPO;
  var ITER = 1000000, MIN_PASSWORD = 16;
  var EDITABLE = ["name", "brand", "price", "price_label", "variants", "description", "size", "options", "available"];
  var LIMITS = L.TEXT_LIMITS;

  var token = null;
  var state = { base: null, work: null, raw: null, paths: {}, uploads: {}, club: null, clubBase: null, tab: "menu", open: {}, head: null, busy: false, tmpN: 0 };
  var SITE_JSON = "src/data/site.json";
  var $ = function (id) { return document.getElementById(id); };
  var app = $("app"), tabs = $("tabs"), bar = $("bar"), statusEl = $("status");

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
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

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

  // ------------------------------------------------------------ crypto
  var enc = new TextEncoder(), dec = new TextDecoder();
  function b64(bytes) { var s = ""; new Uint8Array(bytes).forEach(function (b) { s += String.fromCharCode(b); }); return btoa(s); }
  function unb64(s) { var bin = atob(s.replace(/\s/g, "")); var out = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out; }
  function deriveKey(password, salt, iter) {
    return crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]).then(function (base) {
      return crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt, iterations: iter, hash: "SHA-256" }, base,
        { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    });
  }
  function seal(secret, password) {
    var salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    return deriveKey(password, salt, ITER).then(function (k) {
      return crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, k, enc.encode(secret));
    }).then(function (ct) {
      return { v: 1, kdf: "PBKDF2-SHA256", iterations: ITER, salt: b64(salt), iv: b64(iv), ciphertext: b64(ct) };
    });
  }
  function unseal(box, password) {
    return deriveKey(password, unb64(box.salt), box.iterations).then(function (k) {
      return crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(box.iv) }, k, unb64(box.ciphertext));
    }).then(function (pt) { return dec.decode(pt); });
  }

  // ------------------------------------------------------------ GitHub API
  function ApiError(status, message, body) { this.status = status; this.message = message; this.body = body; }
  function gh(method, path, body) {
    var headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    if (token) headers.Authorization = "Bearer " + token;
    if (body) headers["Content-Type"] = "application/json";
    return fetch(path.indexOf("https:") === 0 ? path : API + path, { method: method, headers: headers, cache: "no-store",
      body: body ? JSON.stringify(body) : undefined }).then(function (r) {
      return r.text().then(function (t) {
        var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) { j = null; }
        if (!r.ok) throw new ApiError(r.status, (j && j.message) || ("HTTP " + r.status), t);
        return j;
      });
    }, function () { throw new ApiError(0, "Couldn't reach GitHub. Check your connection.", ""); });
  }
  function plainError(e) {
    if (e instanceof L.OpError) return e.message;
    if (e instanceof ApiError) {
      if (e.status === 401) return "GitHub refused the saved access key. It may have expired: ask Nick for a new one.";
      if (e.status === 403 && /rate limit/i.test(e.message)) return "GitHub has had too many requests from this connection. Wait a while (up to an hour) and try again.";
      if (e.status === 403 || e.status === 404) return "GitHub refused access (" + e.message + "). The access key may be missing a permission: ask Nick.";
      if (e.status === 0) return e.message;
      return "GitHub said: " + e.message;
    }
    return String((e && e.message) || e);
  }
  function decodeBlob(content) { return dec.decode(unb64(content)); }

  // Latest commit on the branch, the three JSON files at that commit, and which item photos exist.
  function fetchHead() {
    return gh("GET", "/git/ref/heads/" + encodeURIComponent(BRANCH)).then(function (ref) {
      var sha = ref.object.sha;
      return gh("GET", "/git/commits/" + sha).then(function (c) {
        return gh("GET", "/git/trees/" + c.tree.sha + "?recursive=1");
      }).then(function (tree) {
        var paths = {};
        tree.tree.forEach(function (t) { paths[t.path] = t.sha; });
        var keys = Object.keys(L.FILES);
        var want = keys.map(function (k) { return DIR + L.FILES[k]; }).concat([SITE_JSON]);
        return Promise.all(want.map(function (pth) {
          if (!paths[pth]) throw new ApiError(404, pth + " is missing", "");
          return gh("GET", "/git/blobs/" + paths[pth]);
        })).then(function (blobs) {
          var raw = {}, docs = {};
          keys.forEach(function (k, i) { raw[k] = decodeBlob(blobs[i].content); docs[k] = JSON.parse(raw[k]); });
          var site = JSON.parse(decodeBlob(blobs[keys.length].content));
          return { sha: sha, tree: tree.sha, raw: raw, docs: docs, site: site, paths: paths };
        });
      });
    });
  }

  // Tree entries: text file {path, content}, uploaded blob {path, sha}, deletion {path, sha: null}.
  function entry(f) {
    var e = { path: f.path, mode: "100644", type: "blob" };
    if ("content" in f) e.content = f.content; else e.sha = f.sha;
    return e;
  }
  // One commit with every changed file, then move the branch to it (no force: a concurrent edit makes this fail and we retry).
  function commitFiles(head, files, message) {
    return gh("POST", "/git/trees", { base_tree: head.tree, tree: files.map(entry) }).then(function (t) {
      return gh("POST", "/git/commits", { message: message, tree: t.sha, parents: [head.sha] });
    }).then(function (c) {
      return gh("PATCH", "/git/refs/heads/" + encodeURIComponent(BRANCH), { sha: c.sha, force: false }).then(function () { return c; });
    });
  }

  // ------------------------------------------------------------ sign in and set up
  function loadSealed() {
    return fetch("sealed.json", { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }

  function showLogin(box) {
    $("login").hidden = false; $("editor").hidden = true;
    var form = $("login-form"), msg = $("login-msg"), btn = form.querySelector("button");
    if (!box) {
      msg.hidden = false; msg.textContent = "The editor isn't set up yet. Nick needs to open this page with #setup at the end of the address.";
      btn.disabled = true; return;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var pw = $("password").value;
      if (!pw) return;
      btn.disabled = true; btn.textContent = "Checking…"; msg.hidden = true;
      unseal(box, pw).then(function (t) {
        token = t; $("password").value = "";
        $("login").hidden = true; $("editor").hidden = false;
        load();
      }, function () {
        msg.hidden = false; msg.textContent = "That password is not right.";
        btn.disabled = false; btn.textContent = "Sign in"; $("password").select();
      });
    });
  }

  function showSetup() {
    $("login").hidden = true; $("editor").hidden = true; $("setup").hidden = false;
    var form = $("setup-form"), out = $("setup-msg"), btn = form.querySelector("button");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var t = $("setup-token").value.trim(), p1 = $("setup-pw").value, p2 = $("setup-pw2").value;
      function fail(m) { out.hidden = false; out.className = "msg msg-err"; out.textContent = m; btn.disabled = false; btn.textContent = "Encrypt and save"; }
      if (p1 !== p2) return fail("The two passwords are different.");
      if (p1.length < MIN_PASSWORD) return fail("Use at least " + MIN_PASSWORD + " characters. Four or five random words work well.");
      if (!/^(github_pat_|ghp_)[A-Za-z0-9_]+$/.test(t)) return fail("That doesn't look like a GitHub token.");
      btn.disabled = true; btn.textContent = "Working…"; out.hidden = true;
      token = t;
      seal(t, p1).then(function (box) {
        return fetchHead().then(function (head) {
          return commitFiles(head, [{ path: "editor/sealed.json", content: JSON.stringify(box, null, 2) + "\n" }], "Menu editor: new encrypted access key");
        });
      }).then(function (c) {
        token = null; $("setup-token").value = ""; $("setup-pw").value = ""; $("setup-pw2").value = "";
        out.hidden = false; out.className = "msg msg-ok";
        out.textContent = "Saved (commit " + c.sha.slice(0, 7) + "). The token works and can write to the repo. " +
          (LIVE ? "The site rebuilds in a few minutes; then the password opens the editor." : "Test branch: merge it to main to use it.");
        btn.textContent = "Done";
      }, function (err) { token = null; fail(plainError(err)); });
    });
  }

  // ------------------------------------------------------------ loading
  function load() {
    app.textContent = ""; tabs.textContent = ""; bar.hidden = true;
    app.appendChild(el("p", { class: "loading", text: "Loading the latest menu…" }));
    return fetchHead().then(function (h) {
      state.head = h; state.raw = h.raw; state.base = {}; state.work = {};
      Object.keys(h.docs).forEach(function (k) { state.base[k] = h.docs[k]; state.work[k] = clone(h.docs[k]); });
      state.paths = h.paths; state.uploads = {};
      state.clubBase = { heading: h.site.meet_night.heading, rows: clone(h.site.meet_night.rows) };
      state.club = clone(state.clubBase);
      render();
    }).catch(function (e) { app.textContent = ""; showStatus("err", "Couldn't load the menu", [plainError(e)], e && e.body); });
  }

  // ------------------------------------------------------------ change list
  function norm(v) {
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
              EDITABLE.forEach(function (k) { var v = norm(it[k]); if (v !== null) fields[k] = v; });
              if (!("price" in fields) && !fields.variants) fields.price = null;
              out.push({ op: "add", file: fk, section: s.id, group: g.id, tmp: it._tmp, item: fields });
              return;
            }
            seen[it.id] = true;
            var b = baseIdx[it.id], set = {};
            EDITABLE.forEach(function (k) {
              var a = norm(it[k]), was = norm(b[k]);
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
    var lab = L.LABELS[o.file];
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
  // ------------------------------------------------------------ photos and club night changes
  function folderOf(g, it) {
    var img = it.image;
    if (!img && it._tmp) g.items.some(function (x) { if (typeof x.image === "string") { img = x.image; return true; } return false; });
    var m = typeof img === "string" && /^images\/([a-z0-9-]+)\//.exec(img);
    return m ? m[1] : null;
  }
  function photoChanges() {
    var out = [];
    Object.keys(state.work).forEach(function (fk) {
      state.work[fk].sections.forEach(function (s) { s.groups.forEach(function (g) { g.items.forEach(function (it) {
        var u = state.uploads[fk + "|" + key(it)];
        if (u) out.push({ fk: fk, it: it, folder: folderOf(g, it), u: u });
      }); }); });
    });
    return out;
  }
  function clubChanged() { return state.club && JSON.stringify(state.club) !== JSON.stringify(state.clubBase); }
  function changeCount() { return ops().length + photoChanges().length + (clubChanged() ? 1 : 0); }
  function describePhoto(c) {
    return L.LABELS[c.fk] + ": " + (c.u.remove ? "remove photo of " : "new photo for ") + (c.it.name || "new item");
  }

  function updateBar() {
    var n = changeCount();
    bar.hidden = n === 0;
    $("count").textContent = n === 1 ? "1 change" : n + " changes";
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
    var input = el("input", { type: "text", inputmode: "numeric", pattern: "[0-9]*", placeholder: "e.g. 85", oninput: function (e) {
      var v = e.target.value.replace(",", ".").trim();
      var n = v === "" ? null : Number(v);
      e.target.classList.toggle("bad", v !== "" && (isNaN(n) || n < 0 || !Number.isInteger(n)));
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
    fieldsFor(fk, g, it).forEach(function (f) {
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
    var folder = folderOf(g, it);
    if (folder) body.appendChild(photoBox(fk, it, folder));
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
  // Photo: shows the current or chosen picture, with Change / Remove. The browser crops it square and shrinks it;
  // GitHub turns it into the site's WebP files when it rebuilds (tools/process_uploads.py).
  function photoBox(fk, it, folder) {
    var pk = fk + "|" + key(it), u = state.uploads[pk];
    var has = !it._tmp && it.image && state.paths[it.image];
    var small = has && it.image.replace(/\.webp$/, "-400w.webp");
    var src = u && !u.remove ? u.url : (has && !(u && u.remove) ? "../" + (state.paths[small] ? small : it.image) : null);
    var box = el("div", { class: "photo" });
    box.appendChild(src ? el("img", { src: src, alt: "", width: 96, height: 96 }) : el("div", { class: "nophoto", text: "no photo" }));
    var text = u && u.remove ? "The photo will be removed when you publish."
      : u ? "New photo, ready to publish." + (u.small ? " It is quite small, so it may look soft." : "")
      : has ? "Shown on the site, cropped to a circle." : "No photo yet: the site shows a 'photo coming hot' tile.";
    var input = el("input", { type: "file", accept: "image/*", class: "visually-hidden", onchange: function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      prepPhoto(file).then(function (p) {
        if (u && u.url) URL.revokeObjectURL(u.url);
        state.uploads[pk] = p; state.open[fk + key(it)] = true; render();
      }, function () { showStatus("err", "Couldn't use that photo", ["Choose a JPEG or PNG photo."]); });
    } });
    var btns = [el("label", { class: "btn small" }, [input, has || u ? "Change photo" : "Add photo"])];
    if (u) btns.push(el("button", { type: "button", class: "btn small", text: "Undo", onclick: function () {
      if (u.url) URL.revokeObjectURL(u.url);
      delete state.uploads[pk]; state.open[fk + key(it)] = true; render();
    } }));
    else if (has) btns.push(el("button", { type: "button", class: "btn small danger", text: "Remove photo", onclick: function () {
      state.uploads[pk] = { remove: true }; state.open[fk + key(it)] = true; render();
    } }));
    box.appendChild(el("div", {}, [el("p", { class: "hint", text: text }), el("div", { class: "row" }, btns)]));
    return box;
  }
  var PHOTO_PX = 1080;
  function prepPhoto(file) {
    return createImageBitmap(file).then(function (bmp) {
      var side = Math.min(bmp.width, bmp.height), out = Math.min(PHOTO_PX, side);
      var c = document.createElement("canvas"); c.width = out; c.height = out;
      var ctx = c.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, out, out);
      if (bmp.close) bmp.close();
      return new Promise(function (res, rej) { c.toBlob(function (b) { b ? res(b) : rej(new Error("encode")); }, "image/jpeg", 0.88); })
        .then(function (blob) {
          return blob.arrayBuffer().then(function (buf) { return { b64: b64(buf), url: URL.createObjectURL(blob), small: out < 600 }; });
        });
    });
  }

  // ------------------------------------------------------------ club night tab
  function renderClub() {
    var c = state.club;
    var sec = el("section", { class: "sec" }, [el("h2", { text: "Club night" }),
      el("p", { class: "hint", text: "The next Woodstock Backgammon Club meet night, shown in the Club section of the home page." })]);
    var heading = el("input", { type: "text", maxlength: L.CLUB_LIMITS.heading, oninput: function (e) { c.heading = e.target.value; updateBar(); } });
    heading.value = c.heading;
    sec.appendChild(el("div", { class: "fields card" }, [el("label", {}, ["Heading (usually the date)", heading])]));
    var list = el("div", { class: "fields card" });
    c.rows.forEach(function (r, i) {
      var k = el("input", { type: "text", maxlength: L.CLUB_LIMITS.label, "aria-label": "Detail name", oninput: function (e) { r[0] = e.target.value; updateBar(); } });
      var v = el("input", { type: "text", maxlength: L.CLUB_LIMITS.value, "aria-label": "Detail", oninput: function (e) { r[1] = e.target.value; updateBar(); } });
      k.value = r[0]; v.value = r[1];
      list.appendChild(el("div", { class: "crow" }, [k, v, el("div", { class: "row" }, [
        el("button", { type: "button", class: "btn small", text: "↑", "aria-label": "Move up", disabled: i === 0, onclick: function () { var t = c.rows[i - 1]; c.rows[i - 1] = r; c.rows[i] = t; render(); } }),
        el("button", { type: "button", class: "btn small danger", text: "✕", "aria-label": "Remove line", disabled: c.rows.length === 1, onclick: function () { c.rows.splice(i, 1); render(); } })
      ])]));
    });
    if (c.rows.length < L.CLUB_LIMITS.rows) list.appendChild(el("button", { type: "button", class: "btn add", text: "+ Add a line", onclick: function () { c.rows.push(["", ""]); render(); } }));
    sec.appendChild(el("h3", { text: "Details (name, then detail)" }));
    sec.appendChild(list);
    app.appendChild(sec);
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
        text: L.LABELS[fk], onclick: function () { state.tab = fk; render(); } }));
    });
    tabs.appendChild(el("button", { type: "button", role: "tab", "aria-selected": state.tab === "club" ? "true" : "false", class: "tab",
      text: "Club night", onclick: function () { state.tab = "club"; render(); } }));
    app.textContent = "";
    var note = "Showing the latest saved version (" + state.head.sha.slice(0, 7) + ").";
    if (!LIVE) note += " Test branch " + BRANCH + ": saves here don't change the live site.";
    app.appendChild(el("p", { class: "hint", text: note }));
    if (state.tab === "club") { renderClub(); updateBar(); return; }
    state.work[state.tab].sections.forEach(function (s) {
      var sec = el("section", { class: "sec" }, [el("h2", { text: s.title || s.id })]);
      s.groups.forEach(function (g) {
        var grp = el("div", { class: "grp" });
        if (g.title) grp.appendChild(el("h3", { text: g.title + (g.note ? " · " + g.note : "") }));
        g.items.forEach(function (it, i) { grp.appendChild(itemCard(state.tab, s, g, it, i)); });
        grp.appendChild(el("button", { type: "button", class: "btn add", text: "+ Add item to " + (g.title || s.title), onclick: function () {
          state.tmpN += 1;
          var it = { _tmp: "new:" + state.tmpN, name: "", available: true };
          if (g.items.some(function (x) { return "price" in x; }) || !g.items.length) it.price = null;
          g.items.push(it); state.open[state.tab + it._tmp] = true; render();
          var cards = document.querySelectorAll("details[open] input[type=text]");
          if (cards.length) cards[cards.length - 1].focus();
        } }));
        sec.appendChild(grp);
      });
      app.appendChild(sec);
    });
    updateBar();
  }

  // ------------------------------------------------------------ save
  $("discard").addEventListener("click", function () {
    if (!confirm("Throw away all unsaved changes?")) return;
    Object.keys(state.base).forEach(function (k) { state.work[k] = clone(state.base[k]); });
    Object.keys(state.uploads).forEach(function (k) { if (state.uploads[k].url) URL.revokeObjectURL(state.uploads[k].url); });
    state.uploads = {}; state.club = clone(state.clubBase);
    state.open = {}; render();
  });
  $("signout").addEventListener("click", function () {
    if (state.work && changeCount() && !confirm("You have unsaved changes. Sign out anyway?")) return;
    token = null; state.work = null; location.reload();
  });
  var dialog = $("confirm");
  $("save").addEventListener("click", function () {
    var list = ops(), photos = photoChanges(), club = clubChanged();
    if (!(list.length || photos.length || club) || state.busy) return;
    try { // catch mistakes before the dialog
      if (list.length) L.applyOps(clone(state.base), clone(list));
      if (club) L.applyClub({ meet_night: clone(state.clubBase) }, clone(state.club));
    } catch (e) { showStatus("err", "Not saved yet", [plainError(e)]); return; }
    var ul = $("confirm-list"); ul.textContent = "";
    list.forEach(function (o) { ul.appendChild(el("li", { text: describe(o) })); });
    photos.forEach(function (c) { ul.appendChild(el("li", { text: describePhoto(c) })); });
    if (club) ul.appendChild(el("li", { text: "Club night details" }));
    $("confirm-note").textContent = LIVE ? "This updates the live website. It takes a few minutes to show." : "Test branch: the live site doesn't change.";
    if (dialog.showModal) dialog.showModal(); else if (confirm("Publish these changes?")) doSave();
  });
  dialog.addEventListener("close", function () { if (dialog.returnValue === "ok") doSave(); });

  // Fetch the latest files, apply the changes, commit. If someone else saved in between, try once more on top of theirs.
  function publish(job, attempt) {
    return fetchHead().then(function (head) {
      var docs = head.docs, files = [], notes = [], ids = {};
      if (job.list.length) {
        var res = L.applyOps(docs, clone(job.list));
        ids = res.ids; notes = notes.concat(res.notes);
        res.changed.forEach(function (k) { files.push({ path: DIR + L.FILES[k], content: L.dumps(docs[k], L.blankAfterIds(head.raw[k])) }); });
      }
      if (job.club) {
        var cn = L.applyClub(head.site, clone(job.club));
        if (cn.length) { notes = notes.concat(cn); files.push({ path: SITE_JSON, content: L.dumpsSite(head.site) }); }
      }
      var uploads = [];
      job.photos.forEach(function (c) {
        var id = c.it._tmp ? ids[c.it._tmp] : c.it.id;
        if (!id || !c.folder) return;
        var name = c.it.name || id;
        if (c.u.remove) {
          ["images/" + c.folder + "/" + id + ".webp", "images/" + c.folder + "/" + id + "-400w.webp"].forEach(function (pth) {
            if (head.paths[pth]) files.push({ path: pth, sha: null });
          });
          notes.push("removed the photo of " + name);
        } else {
          uploads.push({ path: "uploads/" + c.folder + "/" + id + ".jpg", b64: c.u.b64 });
          notes.push("new photo for " + name);
        }
      });
      if (!files.length && !uploads.length) throw new L.OpError("There are no changes to publish.");
      return Promise.all(uploads.map(function (u) {
        return gh("POST", "/git/blobs", { content: u.b64, encoding: "base64" }).then(function (b) { files.push({ path: u.path, sha: b.sha }); });
      })).then(function () {
        var summary = notes.slice(0, 6).join("; ") + (notes.length > 6 ? "; +" + (notes.length - 6) + " more" : "");
        return commitFiles(head, files, "Menu update via editor: " + summary);
      }).then(function (c) { return { commit: c, notes: notes }; });
    }).catch(function (e) {
      if (attempt < 2 && e instanceof ApiError && e.status === 422) return publish(job, attempt + 1);
      throw e;
    });
  }

  // Follow the "Rebuild docs" run for this commit. Needs the token's Actions read permission; without it we just say "a few minutes".
  function followRun(sha) {
    var t0 = Date.now();
    function poll() {
      return gh("GET", "/actions/runs?head_sha=" + sha + "&per_page=5").then(function (r) {
        var run = (r.workflow_runs || []).filter(function (w) { return w.name === "Rebuild docs"; })[0];
        if (run && run.status === "completed") return run;
        if (Date.now() - t0 > 6 * 60 * 1000) return run || null;
        return sleep(6000).then(poll);
      });
    }
    return sleep(4000).then(poll);
  }

  function doSave() {
    var job = { list: ops(), photos: photoChanges(), club: clubChanged() ? clone(state.club) : null };
    state.busy = true;
    var btn = $("save");
    btn.disabled = true; btn.textContent = "Publishing…";
    showStatus("info", "Publishing…", ["Saving your changes to GitHub. Keep this page open."]);
    publish(job, 0).then(function (r) {
      var lines = r.notes.map(function (n) { return "• " + n; });
      var commitUrl = r.commit.html_url;
      if (!LIVE) {
        showStatus("ok", "Saved to the test branch", ["The live site doesn't change."].concat(lines), null, [["See the change on GitHub", commitUrl]]);
        return load();
      }
      showStatus("info", "Saved. Now updating the website…", ["GitHub is rebuilding the site and checking it. This takes one to three minutes. Keep this page open to see the result."].concat(lines));
      load();
      return followRun(r.commit.sha).then(function (run) {
        if (run && run.conclusion === "success") {
          showStatus("ok", "Published", ["The site is rebuilt. The live page shows the change within a minute or two (refresh it)."].concat(lines),
            null, [["Open the live site", SITE_URL], ["See the change on GitHub", commitUrl]]);
        } else if (run && run.status === "completed") {
          showStatus("err", "Saved, but the website was not updated", ["Your changes are saved, but the site check failed, so the live site still shows the old version. Ask Nick to look at it."],
            null, [["See what went wrong", run.html_url]]);
        } else {
          showStatus("ok", "Saved", ["Your changes are saved. The live site updates within a few minutes."].concat(lines),
            null, [["Open the live site", SITE_URL], ["See the change on GitHub", commitUrl]]);
        }
      }, function () {
        showStatus("ok", "Saved", ["Your changes are saved. The live site updates within a few minutes."].concat(lines),
          null, [["Open the live site", SITE_URL], ["See the change on GitHub", commitUrl]]);
      });
    }).catch(function (e) {
      showStatus("err", "Not published", [plainError(e), "Nothing was changed. Your edits are still here."], e && e.body);
    }).then(function () { state.busy = false; btn.disabled = false; btn.textContent = "Save and publish"; });
  }

  window.addEventListener("beforeunload", function (e) { if (state.work && changeCount() && !state.busy) { e.preventDefault(); e.returnValue = ""; } });

  if (!window.crypto || !crypto.subtle) {
    $("login-msg").hidden = false; $("login-msg").textContent = "This browser can't run the editor. Use an up-to-date Chrome, Safari or Firefox.";
  } else if (location.hash === "#setup") showSetup();
  else loadSealed().then(showLogin);
})();
