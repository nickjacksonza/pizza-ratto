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

**Decision:** Keep the main page static/server-rendered and confine client behavior to the mobile menu and one coordinated motion component. Respect reduced-motion preferences.

**Consequence:** Prefer HTML/CSS for static presentation. Motion dependencies are acceptable only when they provide a concrete authored effect and retain a complete reduced-motion fallback.

## 011 — Make the ticker a duplicated continuous track

**Context:** A single short text run translated by half its width. On wide screens this left most of the banner empty, appeared pinned to the left and reset before replacement text could enter from the right.

**Decision:** Render two identical multi-phrase runs in a flex track and translate that track by exactly `-50%`. The 14-second loop is intentionally brisker than the original 18-second short-run animation.

**Consequence:** The two `.ticker-copy` elements must stay byte-for-byte equivalent in visible content and remain adjacent. A different message or gap in only one copy will produce a visible jump at the loop boundary.

## 012 — Keep mobile pizza art and labels in separate rows

**Context:** Desktop collage offsets carried into narrow screens, causing labels to visually collide with circular images and leaving neighboring images on different baselines.

**Decision:** At phone width, remove every collage rotation/vertical offset and give each pizza item an explicit image row followed by a label row with positive spacing.

**Consequence:** Desktop keeps its loose flyer collage, while mobile prioritizes clean scanning. New positional `nth-child` rules must be reset inside the phone breakpoint.

## 013 — Prefer the July 2026 owner photography batch

**Context:** The first release relied on small flyer crops, four pizza photos and two placeholders. The owner later supplied thirteen stronger food and venue photographs.

**Decision:** Enhance the owner batch into compressed WebP derivatives, map all six confirmed pizzas by visible ingredients, add two explicitly provisional photo-led specials, and replace every rendered non-hero/non-Remi photograph with the new batch.

**Consequence:** `public/images/owner-2026/` is now the active photography source. Legacy photographs remain for provenance but are not rendered. Bianca Pollo and Sole must keep their confirmation notes until the owner approves their names, ingredients and prices.

## 014 — Complete the pizza grid with explicit concept specials

**Context:** Eight pizza cards left an incomplete final row in the three-column desktop composition, and the earlier collage offsets caused uneven image baselines and label overlap.

**Decision:** Use twelve equal photo cards—four rows of three on desktop and six rows of two on mobile. Add Bosco, Bandito, Verde and Tramonto as visibly provisional generated concepts, remove positional card offsets, and keep a positive gap between every image and label.

**Consequence:** The demo grid is balanced at both target layouts. The four concepts are not owner-confirmed products and must retain their confirmation labels until approved, renamed or removed.

## 015 — Bound the Rat Hole editorial header

> Superseded for the photograph layout by decision 018; the compact header and shared divider remain.

**Context:** A tall photograph spanning all gallery rows was allowed to influence an automatic first row. The title and slogan consequently sat at opposite edges of a large empty rectangle, weakening proximity and visual hierarchy.

**Decision:** Give the first two gallery columns a fixed-height editorial header containing both the section title and slogan, separated from the photographs by a shared rule. Keep the venue image isolated in the third column and let the two food images form the lower collage.

**Consequence:** The layout retains deliberate asymmetry without accidental dead space. Mobile collapses the header and all three photographs into a full-width reading sequence.

## 016 — Preserve the full announcement with a mobile-only loop

**Context:** The full announcement line works as a strong desktop masthead but cannot fit a phone viewport. Hiding its latter phrases removed useful location and opening-hour context, while shrinking it further damaged legibility.

**Decision:** Keep one static centered copy on larger screens and use two identical continuous runs below 520px. Expose one concise accessible label, hide the repeated visual text from assistive technology, and replace motion with a wrapped static copy under `prefers-reduced-motion`.

**Consequence:** Desktop appearance is unchanged, mobile retains the full message, and users who disable animation receive a complete non-moving alternative.

## 017 — Concentrate motion in a scroll-driven Remi road scene

> Superseded for the animation runtime by decision 018; the palette, pacing and single focal road scene remain.

**Context:** The site needed the section pacing, word-reveal drama and horizontal vehicle movement of the supplied food-site reference without losing Pizza Ratto's flyer identity or static-export compatibility.

**Decision:** Use the approved `#FF8513`, `#CC2832`, `#FFC0C1` and `#373737` palette; reorganize the homepage into strong full-bleed color scenes; and add one native, dependency-free client component that turns scroll progress into CSS variables for a pinned `Hot / PIZZA` reveal and Remi's Vespa travel. Use the same component to apply small parallax offsets to selected photography.

**Consequence:** Motion has a clear focal point, works on GitHub Pages, and retains a complete reduced-motion fallback. Future animation should extend this progress system rather than introduce a second competing motion runtime.

## 018 — Match the reference with one GSAP motion system

**Context:** The first road scene used native scroll math and clip-path reveals. Review showed that the `Hot` word looked uncovered rather than written, headings lacked the reference's character-level entrances, Remi moved too mechanically, and the gallery did not have the layered store-photo choreography seen in the supplied recording.

**Decision:** Inspect the reference site's public theme bundle and follow its verified animation model: GSAP timelines, ScrollTrigger scrubbing and SplitText character treatment. Use GSAP 3.13 with DrawSVG for Pizza Ratto, plus Vara 1.4 with local Satisfy stroke data to generate the actual handwritten word. Keep Remi as the supplied raster but animate its outer travel separately from an inner suspension timeline. Rebuild the Rat Hole as four overlapping cards entering from different directions. Do not add Swiper because the gallery is editorial rather than an interactive carousel, and do not fake a frame-by-frame Remi sprite without a real approved frame set.

**Consequence:** Drawing, type, panels, parallax, vehicle motion and the gallery now share one timeline grammar. The page remains statically exportable, loads no animation assets from a CDN, and disables the entire choreography under reduced motion.

## 019 — Use the complete GSAP scroll stack and transform-safe pinning

**Context:** The second motion pass still used native CSS scrolling and a sticky road stage. Review requested the full GSAP smooth-scroll toolset, more directional scene movement and stronger physical response from Remi. The oversized `PIZZA` word was also clipped by its own overflow mask.

**Decision:** Put `main` and `footer` inside the conventional ScrollSmoother wrapper/content pair while keeping fixed chrome outside it. Use ScrollTrigger for all scrubbed reveals and for the road-scene pin, ScrollToPlugin for internal navigation and Observer for direction-aware header behavior. Add velocity-derived elastic tilt/lift to Remi, alternate panel wipes and child entrances, and scroll-drive the menu marquee. Remove the `PIZZA` overflow mask and reserve masking for individual character entrances. Keep all four approved brand colors as the visible scene palette.

**Consequence:** Smooth scrolling, navigation, pinned choreography and directional motion now share one native-scroll-backed GSAP runtime. The page remains a static export, the fixed header and order bar are not trapped in transformed content, `PIZZA` keeps its complete glyph bounds, and reduced-motion users retain the static fallback.
