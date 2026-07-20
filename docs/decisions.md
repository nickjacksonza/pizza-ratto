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

## 020 — Make Remi pull the next scene and unblock motion startup

**Context:** Review found that some choreography appeared late or snapped into place, section entrances did not visibly originate from the left, and the red tail of the pinned road sequence read as unused space. The reference vehicle is effective because it acts as the transition mechanism: the next view follows it across the viewport.

**Decision:** Initialize the GSAP/ScrollSmoother runtime before waiting for Vara font data, preload the local Vara JSON, and give the handwriting its own ScrollTrigger once its paths are ready. Replace shallow directional wipes with full off-canvas panel translations. During Remi's crossing, move a complete red editorial scene from `-100%` to `0%` behind the scooter and animate a short tow line, while the orange title composition exits.

**Consequence:** General motion no longer depends on handwriting-data readiness, left/right entrances have clear physical travel, and the road scene ends on finished editorial content instead of an empty color band. The handoff stays inside the approved palette, uses an already documented owner photograph, remains statically exportable, and disappears in the reduced-motion fallback.

## 021 — Make the complete page a responsive scene sequence

> Superseded for the pizza-menu layout and chapter-transition mechanism by decision 022; the scene identities and seamless hero treatment remain.

**Context:** The Remi handoff had become an authored full-screen moment, but the following story and menu sections still read as conventional page blocks. Review requested every major section to feel like its own view and identified the opaque hero artwork's pink paper as a visible seam.

**Decision:** Give each major story container a `data-scene` identity and a distinct scrubbed transition: paper-left, iris, cards-up, split, columns, deck or shutter-right. Use a nested ScrollTrigger pin for a horizontally translated twelve-card pizza rail on desktop, with `gsap.matchMedia()` restoring the normal two-column menu below `761px`. Keep the pinned stage static and animate only its descendants. Reuse the matching `hero-paper-texture.png` behind the hero shell, art and red copy layer, and remove image blending/filtering that darkens the baked paper background.

**Consequence:** The homepage now reads as a connected series of poster views rather than one animated scene followed by normal sections. Desktop menu browsing becomes an immersive vertical-to-horizontal sequence, mobile and reduced-motion users retain a complete natural-flow menu, and the hero artwork sits on one continuous paper surface. The full selector inventory, cleanup order, responsive exception and QA requirements live in `docs/motion-system.md`.

## 022 — Restore the menu grid and hand chapters between palette curtains

> Extended by decision 023: the grid remains natural flow, while large-screen narrative chapters now lock after their curtain entrance.

**Context:** The pinned horizontal pizza rail made a practical restaurant menu slower to compare, its fixed viewport clipped the hot-honey/rat-sauce badge, and several chapter entrances still felt like variations of ordinary vertical scrolling. The handwritten `Hot` also remained visually lighter than the surrounding display type.

**Decision:** Restore the twelve pizzas to a permanent three-column desktop and two-column mobile grid. Keep lateral energy by using `gsap.matchMedia()` to alternate grid-row entrances from the left and right, while the menu marquee keeps its own horizontal ScrollTrigger. Add a direct-child palette curtain to every enhanced chapter and clear it with distinct horizontal, centre-split, diagonal-shutter, column, or iris choreography while the semantic scene remains in normal document flow. Increase Vara's generated stroke width to `8.2` on larger screens and `6.8` below `600px`.

**Consequence:** Prices, toppings and cards are immediately comparable at every size; the sauce badge is no longer trapped inside a pinned viewport; and chapters now feel pulled, uncovered or assembled rather than merely lifted by vertical scroll. Base and reduced-motion layouts hide the curtains and retain the complete grid, so the progressive enhancement and static-export guarantees remain intact.

## 023 — Lock narrative chapters and turn social proof into a Ratto poster

**Context:** The reference recordings showed a stronger pacing device than a curtain alone: document movement stops when a chapter reaches the viewport, scroll is spent on an internal composition, and only then does the page release. Review also called out the reference's social collage and cursor-following action as a particularly effective blend of brand color, photography and interaction.

**Decision:** Add `data-lock-chapter` and per-stage `data-lock-scroll` budgets to the story, menu portal, ingredients, character, Ratto Social Club and visit sections. At `min-width: 1001px` and `min-height: 720px`, create an independent ScrollTrigger pin and bespoke descendant timeline for each; keep the menu grids permanently unpinned. Replace the older Rat Hole stack with `Never pizza solo.`, a four-image Instagram poster over a code-native mural made from the approved palette. On precise desktop pointers, move the visible follow badge with eased `gsap.quickTo()` setters; keep it static on touch, narrow and reduced-motion layouts.

**Consequence:** Desktop scrolling now has clear chapters with authored pauses instead of one continuous vertical cadence, while menus remain quick to scan. Short screens, phones and reduced-motion users keep complete semantic natural flow without pin spacers. The social view provides an explicit discovery route without adding a carousel dependency, new imagery or a second animation runtime.

## 024 — Cover long jumps and localize late-chapter reveals

**Context:** Review found that the stacked Dolci list completed its animation before reaching the viewport, the social `RATTO` outline was too faint and static, the visit information and actions did not share a stable visual top edge, and clicking Menu visibly accelerated through every intervening pinned timeline.

**Decision:** Remove the coffee/dolci grid from the parent scene-child entrance and give each category its own viewport-relative scrub range. Replace the faint CSS `RATTO` pseudo-element with a second Vara/DrawSVG word in approved red with a grey registration shadow. Align the three desktop visit columns from a shared top edge and reveal actions laterally without vertical displacement. For anchor distances above `1.35 × viewport height`, place a fixed red route card outside ScrollSmoother, change the smoothed scroll position only after the card fully covers the viewport, update focus and hash, then reveal the destination; retain ScrollToPlugin for nearby links.

**Consequence:** Dolci motion now occurs while Dolci is visible, the social background becomes a legible authored drawing beat, and the visit layout remains aligned both during and after its pin. Navigation no longer presents intermediate scenes as a fast-forward montage, while keyboard focus, reduced-motion fallback, static export compatibility and the single GSAP runtime are preserved.

## 025 — Treat the social Vara word as one signature

**Context:** The first scroll-drawn `Ratto` treatment was oversized, drew all Vara paths concurrently and used a strong grey offset shadow. Mid-animation it read as dotted fragments and two tangled words, competing with `Never pizza solo.` and the incoming photographs.

**Decision:** Keep Vara as the glyph and path source, but reduce the signature's footprint, remove the duplicate shadow layer and render one approved-red ink. Build a DrawSVG timeline in Vara's DOM path order, weighting each stroke duration by its measured length so only one pen stroke is actively drawing at a time.

**Consequence:** The lettering now reads as a deliberate signature instead of background noise, remains genuinely scroll-drawn and reversible, and supports the collage hierarchy without introducing a new font, asset or animation runtime.

## 026 — Prefer the owner/Figma brand package over approximations

> Extended and partially superseded by decision 027: the Figma/owner package remains active, while the character scene restores the earlier generated Remi art and the counter reel becomes a desktop lock.

**Context:** The owner supplied seven short shop videos, an original Remi/Vespa mural photograph and a set of Figma exports containing the stacked wordmark, pizza-slice marks, cup art, chef-hat artwork and two poster compositions. The existing site had strong derived assets but little authentic counter footage and still used a live-type approximation in the fixed header.

**Decision:** Use the supplied stacked Figma wordmark in the header, add the pizza/cup/chef-hat marks as restrained menu punctuation, replace the generated character portrait with the owner mural photograph, and assemble every owner video into one native horizontal `FROM THE COUNTER` reel. Include the Figma hero composition and backgammon artwork as clearly labelled archive cards rather than turning them into new promotional claims. Keep the generated transparent Remi asset in the scroll-driving road scene because it remains the technically appropriate cutout there.

**Consequence:** The page now carries recognisably owner-made marks and real shop motion without sacrificing the existing static-export architecture or scan-friendly menus. Video loops are muted, compressed and paired with poster frames; reduced-motion users see the stills. The backgammon year and promotional status remain an owner-confirmation item.

## 027 — Lock the counter reel and give every menu mark a deliberate slot

> Extended and partially superseded by decision 028: the counter lock remains, but its banner treatment, background, card set and motion language have been revised.

**Context:** Review found that the coffee, dolci and pizza marks looked appended rather than composed, the filtered counter banner shifted green, the owner mural was less effective in the established Meet Remi layout, and the new footage reel needed the same authored scroll pacing as the surrounding chapters.

**Decision:** Replace Dolci's chef-hat badge with the supplied red ice-cream vector, place the coffee, dolci and pizza marks in dedicated header groups, and render the wide counter banner as an exact-red CSS mask. Restore `ratto-vespa-red.png` to the character scene. Promote `FROM THE COUNTER` to a top-level `tape-deck` scene and a `2.35 × viewport` large-desktop lock: cards deal in behind a pink shutter, settle with alternating tilt, then travel horizontally across the pinned view. Preserve the native snap-assisted reel below the lock breakpoint and the poster-only reduced-motion fallback.

**Consequence:** Brand marks now read as part of their headers, the banner stays on-palette, and the owner footage gains a complete scroll narrative without pinning practical menus or compromising touch and reduced-motion layouts. The owner mural WebP remains documented but is no longer rendered.

## 028 — Turn the counter reel into a seven-clip film gate

> Superseded by decision 030: the seven clips remain, but the film-gate focus sequence and cake backdrop have been removed.

**Context:** Follow-up review found that masking the counter banner removed the interior holes from its characters, the two archive cards distracted from the real shop footage, and a uniform horizontal conveyor did not give each clip enough presence. The character-and-scooter imagery also competed with the reel's subject.

**Decision:** Recolour the supplied banner at the SVG path level so its counters remain visible, remove the Figma-drawer and dated owner-archive cards from the rendered reel, and retain exactly the seven owner videos. Use the owner chocolate-cake photograph as a red-washed background. On large desktop, keep the scroll lock but advance clips through a central film-gate frame: the active video scales up and brightens while adjacent cards dim and tilt away. Keep native snap scrolling and poster-frame fallbacks for smaller or reduced-motion layouts.

**Consequence:** The mark remains legible and on-palette, the section is focused entirely on authentic moving footage, and the locked scroll has a clear visual beat for every clip without changing the accessible fallback or static-export model.

## 029 — Morph supplied menu marks from ink into artwork

**Context:** The new pizza, cup and ice-cream vectors were well positioned but remained static inside a motion-led page. Review requested GSAP MorphSVG treatment to give those owner-supplied marks a more premium entrance.

**Decision:** Render exact inline copies of the three supplied vectors while retaining their canonical files and provenance. Give each icon a viewBox-matched compact start path, morph its dominant silhouette into the final owner path with MorphSVG, then reveal the secondary toppings, steam, cup details or cone with a short stagger. Scrub each animation over its own local header range so it reverses naturally. Do not initialize morph states under reduced motion.

**Consequence:** The new marks now participate in the page's scroll language without becoming decorative loops or delaying content. Their static final forms remain available to reduced-motion users and in the server-rendered export.

## 030 — Keep the counter footage static and spend motion on the exit

**Context:** Review found that the film-gate focus sequence added too much movement inside `Fresh proof. No filters.` The requested reference was Ksenia Kondrashova's “On-Scroll Gooey Overlay (WebGL + GSAP ScrollTrigger),” whose defining behavior is an irregular liquid-colour boundary controlled by scroll.

**Decision:** Remove the cake backdrop, focus frame, card spotlighting and reel travel. On large desktop, present all seven videos as one static line. Preserve the section lock, but hold the composition still through its first phase; during the exit phase, use GSAP to pull a field of exact `--red` drops over the viewport. Merge the drops into a continuous sheet with an SVG blur-and-threshold filter, then reveal `NEXT / BUILT DIFFERENT` before releasing the pin. Keep the smaller-screen swipe strip and reduced-motion layout free of the gooey overlay.

**Consequence:** The footage becomes easier to scan, and the premium movement is concentrated at the chapter boundary. The effect evokes the referenced gooey overlay without adding a WebGL runtime or compromising the static export and motion fallback.
