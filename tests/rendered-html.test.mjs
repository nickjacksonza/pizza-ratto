import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Pizza Ratto homepage and metadata", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Pizza Ratto \| Wood-Fired Pizza in Salt River, Cape Town<\/title>/i);
  assert.match(html, /Made fresh\. Taken seriously by no one\./i);
  assert.match(html, /Pick your ride/);
  assert.match(html, /Bianca &amp; Dip/);
  assert.match(html, /R150/);
  assert.match(html, /Bianca Pollo/);
  assert.match(html, /Sole/);
  assert.match(html, /Bosco/);
  assert.match(html, /Bandito/);
  assert.match(html, /Verde/);
  assert.match(html, /Tramonto/);
  assert.match(html, /Twelve rides\. One very hot oven\./);
  assert.match(html, /Fresh proof\./);
  assert.match(html, /Meet[\s\S]*Remi\./);
  assert.match(html, /Big Bertha\./);
  assert.match(html, /data-remi-disintegration/);
  assert.match(html, /data-remi-fragments/);
  assert.match(html, /\/images\/ratto-vespa-cutout\.png/);
  assert.match(html, /Gone for pizza\./);
  assert.match(html, /\/videos\/owner-2026\/oven-close\.mp4/);
  assert.match(html, /\/images\/brand\/pizza-ratto-wordmark\.svg/);
  assert.match(html, /\/images\/brand\/red-ice-cream\.svg/);
  assert.match(html, /data-lock-chapter="counter-tapes"/);
  assert.match(html, /data-transition="counter-static"/);
  assert.match(html, /id="counter-gooey-filter"/);
  assert.match(html, /counter-gooey-noise/);
  assert.match(html, /NEXT \/ BUILT DIFFERENT/);
  assert.match(html, /FIRE #01 \/ HEART OF THE HOUSE/);
  assert.match(html, /pizza baking beside the flames inside Pizza Ratto/);
  assert.match(html, /\/images\/owner-2026\/video-stills\/oven-flames\.webp/);
  assert.doesNotMatch(html, /\/images\/owner-2026\/dessert-brownie\.webp/);
  assert.doesNotMatch(html, /From the Figma drawer|Owner archive \/ dates on artwork/);
  assert.doesNotMatch(html, /pizza-placeholder/);
  assert.match(html, /https:\/\/wa\.me\/27825250380/);
  assert.match(html, /tel:\+27825250380/);
  assert.match(html, /ubereats\.com\/za\/store\/pizza-ratto/);
  assert.match(html, /Pizza Ratto on Instagram/);
  assert.match(html, /application\/ld\+json/);
  assert.doesNotMatch(html, /codex-preview|Starter Project|react-loading-skeleton/);
});

test("centralises business and menu content and keeps fake links out", async () => {
  const [page, business, menu] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../data/business.ts", import.meta.url), "utf8"),
    readFile(new URL("../data/menu.ts", import.meta.url), "utf8"),
  ]);
  assert.match(page, /business\.whatsappUrl/);
  assert.match(page, /pizzaMenu\.items\.map/);
  assert.match(page, /sideMenu\.map/);
  assert.match(page, /ticker-track/);
  assert.match(page, /ticker-copy/);
  assert.match(page, /BrandIcon name="whatsapp"/);
  assert.match(page, /BrandIcon name="instagram"/);
  assert.match(page, /className="spaced-heading"/);
  assert.match(page, /data-morph-icon/);
  assert.match(page, /MorphBrandMark name="pizza"/);
  assert.match(page, /red-cup\.svg/);
  assert.match(page, /red-ice-cream\.svg/);
  const motion = await readFile(new URL("../components/ScrollChoreography.tsx", import.meta.url), "utf8");
  assert.match(motion, /gsap\/MorphSVGPlugin/);
  assert.match(motion, /morphSVG:/);
  assert.match(motion, /fragmentCount = 75/);
  assert.match(motion, /repeatCount = 3/);
  assert.match(motion, /remi-fragment-canvas/);
  assert.doesNotMatch(page, /className="text-link" href=\{business\.instagramUrl\}/);
  assert.match(page, /dynamic = "force-static"/);
  assert.match(page, /asset\("\/images\//);
  assert.match(business, /\+27825250380/);
  assert.match(business, /ubereats\.com\/za\/store\/pizza-ratto/);
  assert.match(menu, /Arcobaleno/);
  assert.match(menu, /New special · confirm availability/);
  assert.doesNotMatch(page, /href=["']#["']/);
  assert.doesNotMatch(page + business, /google\.com\/maps/);
});
