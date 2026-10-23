/* Pizza Ratto: small vanilla modules. Every motion respects prefers-reduced-motion. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* 1. Sticky chrome height -> --chrome-h */
  function chrome() {
    var top = $(".pr-top");
    if (!top) return;
    var set = function () { document.documentElement.style.setProperty("--chrome-h", top.offsetHeight + "px"); };
    set();
    window.addEventListener("resize", set);
  }

  /* 2. Active nav link follows the section in view (home page only) */
  function activeNav() {
    var links = $$(".pr-nav a[href^='#']");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          if (a.getAttribute("href") === "#" + e.target.id) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["story", "menu", "visit"].forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  /* 3. House slider: fade, wrap-around, no autoplay */
  function slider() {
    var root = $(".pr-slider");
    if (!root) return;
    var slides = $$(".pr-slide", root), dots = $$(".pr-dot", root), i = 0;
    function go(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        s.classList.toggle("is-on", k === i);
        if (k === i) s.removeAttribute("aria-hidden"); else s.setAttribute("aria-hidden", "true");
      });
      dots.forEach(function (d, k) { d.setAttribute("aria-pressed", k === i ? "true" : "false"); });
    }
    $$(".pr-slide-btn", root).forEach(function (b) { b.addEventListener("click", function () { go(i + Number(b.dataset.dir)); }); });
    dots.forEach(function (d, k) { d.addEventListener("click", function () { go(k); }); });
  }

  /* 4. Contact form: opens WhatsApp with the message pre-filled. No backend. */
  function form() {
    var f = $(".pr-form");
    if (!f) return;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = new FormData(f), phone = (d.get("phone") || "").toString().trim();
      var msg = "Hi Pizza Ratto, it's " + d.get("name") + (phone ? " (" + phone + ")" : "") + ". " + d.get("message");
      window.open("https://wa.me/" + f.dataset.wa + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
    });
  }

  /* 5. Reel videos play only while on screen. Reduced motion: poster only. */
  function reel() {
    var vids = $$(".pr-tape video");
    if (!vids.length || reduce || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) e.target.play().catch(function () {}); else e.target.pause();
      });
    }, { threshold: 0.4 });
    vids.forEach(function (v) { io.observe(v); });
  }

  /* 6. Handwritten "Hot": pen strokes drawn from scroll position (Satisfy single-line glyphs) */
  function handwriting() {
    var svg = $(".pr-hot");
    if (!svg) return;
    fetch(svg.dataset.glyphs).then(function (r) { return r.json(); }).then(function (font) {
      var NS = "http://www.w3.org/2000/svg", g = document.createElementNS(NS, "g"), x = 0, paths = [];
      svg.appendChild(g);
      Array.from(svg.dataset.text).forEach(function (ch) {
        if (ch === " ") { x += font.space; return; }
        var gl = font.c[ch.charCodeAt(0)];
        if (!gl) return;
        var cg = document.createElementNS(NS, "g");
        g.appendChild(cg);
        gl.paths.forEach(function (p) {
          var el = document.createElementNS(NS, "path");
          el.setAttribute("d", "M" + p.mx + " " + (-p.my) + p.d.replace(/^m\s*0,0/i, ""));
          cg.appendChild(el);
          paths.push(el);
        });
        var bb = cg.getBBox();
        cg.setAttribute("transform", "translate(" + (x - bb.x) + " 0)");
        x += bb.width + 0.3;
      });
      var b = g.getBBox(), pad = 3;
      svg.setAttribute("viewBox", [b.x - pad, b.y - pad, b.width + pad * 2, b.height + pad * 2].join(" "));
      var len = paths.map(function (p) {
        p.setAttribute("fill", "none"); p.setAttribute("stroke", "#421212"); p.setAttribute("stroke-width", "2");
        p.setAttribute("stroke-linecap", "round"); p.setAttribute("stroke-linejoin", "round");
        return p.getTotalLength();
      });
      var total = len.reduce(function (a, c) { return a + c; }, 0);
      paths.forEach(function (p, k) { p.style.strokeDasharray = len[k] + " " + (len[k] + 2); });
      function draw(q) {
        var d = q * total;
        paths.forEach(function (p, k) { var s = Math.max(0, Math.min(len[k], d)); d -= len[k]; p.style.strokeDashoffset = len[k] - s; });
      }
      if (reduce) { draw(1); return; }
      var raf = 0;
      function upd() {
        raf = 0;
        var r = svg.getBoundingClientRect();
        draw(Math.max(0, Math.min(1, (innerHeight * 0.95 - r.top) / (innerHeight * 0.5))));
      }
      function on() { if (!raf) raf = requestAnimationFrame(upd); }
      upd();
      window.addEventListener("scroll", on, { passive: true });
      window.addEventListener("resize", on);
    }).catch(function () {});
  }

  chrome(); activeNav(); slider(); form(); reel(); handwriting();
})();
