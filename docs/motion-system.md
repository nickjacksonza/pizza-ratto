# Motion system handoff

This document is the source of truth for Pizza Ratto's GSAP scene choreography. Read it with `architecture.md`, `design-system.md`, and `testing.md` before changing scroll behavior.

## Intent

The page is structured as a sequence of authored poster views rather than a stack of generic content sections. Each major section owns a viewport-scale color field and a distinct entrance. The motion borrows the pacing and scene-handoff logic of the Gelato La Boca reference while keeping Pizza Ratto's supplied artwork, flyer typography, palette, and static-export constraints.

Motion must always remain:

- subordinate to readable restaurant content;
- reversible by scrolling;
- native-scroll-backed;
- safe for keyboard and touch users;
- fully disabled by `prefers-reduced-motion`;
- compatible with the GitHub Pages static export.

## Runtime ownership

`components/ScrollChoreography.tsx` is the only client motion coordinator. Do not add a second scroll runtime.

It dynamically imports and registers:

- GSAP 3.13;
- ScrollSmoother;
- ScrollTrigger;
- ScrollToPlugin;
- Observer;
- SplitText;
- DrawSVG;
- Vara with local Satisfy stroke data.

The fixed announcement, header, and mobile order bar remain outside `#smooth-wrapper`. Only `main` and `footer` live inside `#smooth-content`. This prevents fixed controls from inheriting ScrollSmoother's content transform.

## Startup order

1. Load the animation modules and construct Vara.
2. Check `prefers-reduced-motion`. In reduced motion, show the complete `Hot` paths and stop without creating ScrollSmoother or ScrollTriggers.
3. Add `.motion-ready` and initialize ScrollSmoother immediately. General scene motion must not wait for Vara's JSON callback.
4. Create section, heading, parallax, menu, gallery, navigation, and Remi timelines inside one GSAP context.
5. Await Vara separately, configure its generated SVG, and attach the independent DrawSVG ScrollTrigger.
6. On cleanup, revert the handwriting context, responsive match-media context, main GSAP context, splits, Observer, and ScrollSmoother.

The local Vara JSON is preloaded in `app/layout.tsx`. Keep that path routed through the shared `asset()` helper.

## Scene inventory

Scene identity is declared in `app/page.tsx` with `data-scene` and `data-transition`. The central dispatcher in `ScrollChoreography.tsx` reads those attributes.

| View | Selector | Transition | Behavior |
| --- | --- | --- | --- |
| Hero | `.hero-shell` | load entrance | Artwork and red copy arrive from opposite sides; both share `hero-paper-texture.png` so the paper surface is continuous. |
| Hot Pizza | `.drive-sequence` | pinned Remi handoff | Vara/DrawSVG writes `Hot`; SplitText brings in `PIZZA`; Remi bounces across and tows a full red editorial scene from left to right. |
| 01 / What we're about | `[data-scene="story"]` | `paper-left` | A red paper curtain clears to the right while the cream story content follows from the left. |
| 02 / The important bit | `[data-scene="menu-portal"]` | `iris` | A cream curtain collapses into a central circle while copy assembles laterally and pizza cutouts float independently. |
| Pizza menu | `[data-scene="pizza-menu"]` | `shutter-left` | A pink shutter clears to the right, then the three-column menu rows alternately enter from the left and right. |
| Coffee and dolci | `[data-scene="small-menu"]` | `cards-up` | A red shutter clears right while the label and split menu board enter from opposite sides. |
| 03 / Built different | `[data-scene="ingredients"]` | `split` | A cream curtain splits from its centre as photography enters from the left and the red copy panel enters from the right. |
| Meet Remi / Big Bertha | `[data-scene="characters"]` | `columns` | A red curtain exits left while the copy, Remi artwork, and oven note arrive from left, bottom, and right. |
| 04 / Inside | `[data-scene="gallery"]` | `deck` | A grey diagonal shutter exits right; the header and filmstrip arrive laterally before four venue cards deal into their overlapping stack. |
| 05 / Find the fire | `[data-scene="visit"]` | `shutter-right` | A pink shutter exits left while the red ordering content enters from the right. |

Every scene uses only the approved orange, red, pink, grey, and established cream paper neutral. Avoid introducing transitional white or browser-background flashes.

## Grid menu choreography

The pizza menu is deliberately a natural-flow grid at every breakpoint: three columns above `760px` and two columns at or below it. The earlier pinned horizontal rail was removed because it made prices and toppings slower to compare.

`gsap.matchMedia()` supplies the correct column count to one row-entrance helper. The helper calculates each card's row and alternates the starting direction by row: left, right, left, right. Each card scrubs into its final grid position over a short local range. The large red `PIZZA` marquee keeps an independent horizontal ScrollTrigger, so the chapter still has lateral energy without changing the menu's reading order.

All menu photographs are below the initial viewport and load lazily. The sauce badge remains after the complete grid in normal document flow; do not put it inside a fixed-height or pinned stage.

## Section entrance rules

- Scenes have a minimum height of `100svh`; content may extend beyond one viewport when readability requires it.
- Every enhanced scene contains one direct-child `.scene-curtain`. It is absent visually until `.motion-ready` is applied and sits above the fully readable base layout.
- Curtains move beyond `±104%`, collapse from the centre, or close to a `0%` circle; scene containers stay in normal document flow.
- The entrance window normally runs from `top 98%` to `top 26%` with scrubbed progress.
- Split and column scenes animate their children behind the clearing curtain rather than translating the scene container.
- Scroll-scrubbed entrances remain reversible. Do not replace them with one-time intersection animations.
- Heading SplitText is additional detail, not the section transition itself.
- Curtain colors intentionally echo the preceding chapter so the new view appears to be pulled or uncovered rather than simply faded in.
- Do not animate a ScrollTrigger's pinned element. The Hot Pizza road stage remains the only pinned story stage.

## Hero paper seam

`hero-logo-mascot.png` is an opaque RGB image with a peach paper background baked into it. The repository also contains `hero-paper-texture.png`, derived from the same surface. The hero passes that texture through the CSS custom property `--hero-paper-image` and uses it on `.hero-shell`, `.hero-art`, and beneath the translucent red layer on `.hero-copy`.

The hero image must use normal blending and no color filter. `mix-blend-mode: multiply` or a contrast filter darkens the image's baked paper and recreates a visible rectangle. Keep the CSS background color only as a fast fallback while the texture loads.

## Responsive and reduced motion behavior

- Desktop (`>760px`): ScrollSmoother, all scene transitions, and a natural-flow three-column pizza grid with alternating lateral row entrances.
- Tablet/phone (`<=760px`): short touch smoothing, scene curtains, a natural-flow two-column pizza grid with alternating lateral row entrances, and stacked layouts.
- Phone (`<=520px`): full-height portal, compact typography, sticky order bar, and normal-flow content long enough to remain legible.
- Reduced motion: no ScrollSmoother, pinning, parallax, marquee, scene transforms, or pulled red Remi panel. The complete static content remains in DOM order.

The `motion-ready` class is progressive enhancement. Base CSS must remain readable before JavaScript runs and when it fails. Curtains are hidden in base and reduced-motion CSS; the menu is always a normal grid.

## GSAP choices

The current system intentionally uses:

- [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) for scrub, pin, velocity, and scene timing;
- [ScrollSmoother](https://gsap.com/docs/v3/Plugins/ScrollSmoother/) because it retains native document scrolling;
- [gsap.matchMedia()](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/) for automatic desktop/mobile setup and cleanup;
- [Observer](https://gsap.com/docs/v3/Plugins/Observer/) only for direction-aware header intent, not for hijacking section navigation;
- ScrollToPlugin for accessible anchor navigation;
- SplitText and DrawSVG for authored typography.

Flip is not used because this page does not move the same semantic element between two DOM layouts. Snap is also not enabled: the long scenes and scan-friendly menu need free scrolling, and forced snapping would compete with anchor navigation and touch intent.

## Editing checklist

When adding or changing a scene:

1. Give the semantic container `data-scene` and a supported `data-transition`.
2. Ensure its default CSS is complete without `.motion-ready`.
3. Add a specific transition branch only when the existing presets cannot express the idea.
4. Keep scene backgrounds in the approved palette and ensure no body-color gap appears while transformed.
5. Test the entrance forward and backward at 2560×1318 and 390×844.
6. Verify `document.documentElement.scrollWidth === window.innerWidth` throughout the transition.
7. Confirm fixed chrome and the mobile order bar do not cover essential copy or actions.
8. Test reduced motion and cleanup after responsive resizing.
9. Run lint, typecheck, tests, the normal build, and the Pages build.

## Known constraints

- The gallery collage and the mobile coffee/menu content may exceed one viewport because preserving readable text takes priority over forcing every pixel into a screen.
- ScrollSmoother and pinning both depend on correct wrapper structure. Do not move fixed controls inside `#smooth-content`.
- Curtains temporarily cover each incoming scene, so new transition presets must always clear fully at progress `1` and stay above content without obscuring fixed chrome.
- The opaque hero artwork cannot inherit a CSS background. Its seamless appearance depends on the matching paper texture and neutral image blending.
