# Design and engineering decisions

This is a lightweight architectural decision log. Add new entries when a choice would otherwise be easy for a future contributor to “clean up” without knowing why it exists.

## 001 — Translate the flyer; do not embed it as the interface

**Context:** The supplied flyer is the strongest expression of the brand, but one large flyer image was difficult to crop responsively and caused the logo, mascot, food and CTA to collide.

**Decision:** Rebuild its visual language with live HTML and separately prepared artwork. Retain paper grain, limited inks, checkerboards, condensed type and purposeful overlap.

**Consequence:** The page remains accessible and responsive while still feeling like the physical artifact. Visual changes should be judged against both usability and flyer fidelity.

## 002 — Separate hero art from the CTA

**Context:** Early hero versions used `og.png` as a large background. The useful art was cropped, while text and pizza photography baked into the source overlapped the live phone/action panel.

**Decision:** Use `hero-logo-mascot.png` for the logo and mascot, `hero-paper-texture.png` for the shared background, and live HTML for the promise, location and CTA.

**Consequence:** The CTA can reflow at every breakpoint and phone numbers remain real links. Do not merge these layers back into one flattened image.

## 003 — Give the entire hero one paper surface

**Context:** A plain CTA card beside textured artwork looked detached. A darker sampled background also felt too heavy.

**Decision:** Apply the extracted, light poster-paper texture to the full hero and let the CTA use that same surface with borders and spacing for hierarchy.

**Consequence:** Future color adjustments should start with the root paper tokens or the texture treatment, not an isolated solid CTA fill.

## 004 — Checkerboards are structural framing

**Context:** Short checker accents made the composition feel like a component inside a webpage rather than a full poster.

**Decision:** Checkerboard bands span the viewport. Supporting footnote text sits outside the checker pattern so it stays readable.

**Consequence:** Do not constrain these bands to the central content width or place body copy inside individual checks.

## 005 — Keep the vertical rhythm compact

**Context:** The first implementation had unusually tall hero and story sections, especially on laptops.

**Decision:** Use bounded minimum heights and restrained section padding. Current reference values are documented in `design-system.md`.

**Consequence:** Adding content should not silently restore full-screen-height sections. Test 1366×768-class laptops as well as large desktop displays.

## 006 — Content lives in typed data modules

**Context:** Business facts and menu prices are repeated conversion-critical information.

**Decision:** Centralize them in `data/business.ts` and `data/menu.ts`; render lists from those sources.

**Consequence:** Avoid hardcoding duplicate prices, hours or order URLs in JSX. Narrative copy may stay near its section when it is not reused.

## 007 — Use native `<img>` for the current static target

**Context:** vinext's image optimization route (`/_vinext/image`) is not available on GitHub Pages.

**Decision:** Use native images and the local `asset()` prefix helper.

**Consequence:** Contributors must specify meaningful alt text and sensible loading behavior manually. Revisit only if every production target supports a shared image pipeline.

## 008 — Maintain dual build targets

**Context:** The project originated as an OpenAI Sites/vinext application and was later published to the repository's GitHub Pages project path.

**Decision:** Keep `npm run build` for Sites/Cloudflare and `npm run build:pages` for static Pages output.

**Consequence:** Any routing, asset or font change must pass both builds. Removing either target is an owner-level decision.

## 009 — Avoid `basePath` for this vinext version

**Context:** Using a Next-style `basePath` with vinext `0.0.50` caused static prerender RSC requests to 404.

**Decision:** Use Vite `base`, Next `assetPrefix`, the `asset()` helper and the Pages post-build font rewrite.

**Consequence:** This looks more manual than a normal Next deployment, but is intentional. Retest the underlying issue before simplifying it after a vinext upgrade.

## 010 — Minimize client JavaScript and motion

**Context:** This is a content and ordering site, not an application dashboard. The identity is already visually dense.

**Decision:** Keep the main page static/server-rendered and use client behavior only where interaction requires it, currently the mobile menu. Respect reduced-motion preferences.

**Consequence:** Prefer HTML/CSS solutions for presentation. New client dependencies need a concrete user benefit.

## 011 — Make the ticker a duplicated continuous track

**Context:** A single short text run translated by half its width. On wide screens this left most of the banner empty, appeared pinned to the left and reset before replacement text could enter from the right.

**Decision:** Render two identical multi-phrase runs in a flex track and translate that track by exactly `-50%`. The 14-second loop is intentionally brisker than the original 18-second short-run animation.

**Consequence:** The two `.ticker-copy` elements must stay byte-for-byte equivalent in visible content and remain adjacent. A different message or gap in only one copy will produce a visible jump at the loop boundary.

## 012 — Keep mobile pizza art and labels in separate rows

**Context:** Desktop collage offsets carried into narrow screens, causing labels to visually collide with circular images and leaving neighboring images on different baselines.

**Decision:** At phone width, remove every collage rotation/vertical offset and give each pizza item an explicit image row followed by a label row with positive spacing.

**Consequence:** Desktop keeps its loose flyer collage, while mobile prioritizes clean scanning. New positional `nth-child` rules must be reset inside the phone breakpoint.
