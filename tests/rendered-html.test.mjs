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
  assert.match(page, /dynamic = "force-static"/);
  assert.match(page, /asset\("\/images\//);
  assert.match(business, /\+27825250380/);
  assert.match(business, /ubereats\.com\/za\/store\/pizza-ratto/);
  assert.match(menu, /Arcobaleno/);
  assert.doesNotMatch(page, /href=["']#["']/);
  assert.doesNotMatch(page + business, /google\.com\/maps/);
});
