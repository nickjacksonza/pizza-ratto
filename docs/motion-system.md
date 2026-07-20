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
| 01 / What we're about | `[data-scene="story"]` | `paper-left` | The complete cream poster travels in from off-screen left with a slight paper skew; its content follows. |
| 02 / The important bit | `[data-scene="menu-portal"]` | `iris` | The pink view opens from a central circle while its copy and pizza cutouts assemble. |
| Pizza menu | `[data-menu-sequence]` | pinned horizontal rail | On desktop, the nested stage pins for one viewport while vertical progress translates the twelve-card rail. Cards enter with alternating pitch. |
| Coffee and dolci | `[data-scene="small-menu"]` | `cards-up` | The complete cream view rises with rounded clipping; the orange and pink menu boards follow. |
| 03 / Built different | `[data-scene="ingredients"]` | `split` | Photography enters from the left while the red copy panel enters from the right. |
| Meet Remi / Big Bertha | `[data-scene="characters"]` | `columns` | The copy, Remi artwork, and oven note arrive from left, bottom, and right. |
| 04 / Inside | `[data-scene="gallery"]` | `deck` | The pink poster tilts upward, then four venue cards deal into their overlapping stack. |
| 05 / Find the fire | `[data-scene="visit"]` | `shutter-right` | The entire red ordering view travels in from the right with a short shutter skew. |

Every scene uses only the approved orange, red, pink, grey, and established cream paper neutral. Avoid introducing transitional white or browser-background flashes.

## Pinned menu architecture

The menu uses a nested structure:

```text
.menu-pizza-sequence     ScrollTrigger trigger and pin-spacing owner
  .menu-pizza-stage      pinned viewport; never animate this element
    .menu-marquee-title  secondary horizontal motion
    .menu-inner
      .menu-rail-window
        [data-menu-rail] translated horizontally
```

The desktop timeline is created inside `gsap.matchMedia("(min-width: 761px)")`. The stage uses `pin`, `anticipatePin: 1`, numeric `scrub`, and an `end` derived from the rail's real overflow width. The pinned element itself is not animated; only descendants are transformed. This follows ScrollTrigger's pinning guidance and avoids measurement drift.

Below 761px, the responsive GSAP context removes the pin and the CSS returns the menu to a two-column document-flow grid. Do not force the long horizontal rail onto small touch screens: twelve cards would create an unnecessarily long pinned interaction and make menu scanning harder.

The first four pizza photographs load eagerly so the first desktop menu viewport does not reveal undecoded images. Remaining cards stay lazy and load as the rail approaches them.

## Section entrance rules

- Scenes have a minimum height of `100svh`; content may extend beyond one viewport when readability requires it.
- Horizontal scenes begin beyond `±102%`, not at a shallow local offset.
- The entrance window normally runs from `top 94%` to `top 34%` with scrubbed progress.
- Split and column scenes animate their children rather than translating the scene container.
- Scroll-scrubbed entrances remain reversible. Do not replace them with one-time intersection animations.
- Heading SplitText is additional detail, not the section transition itself.
- Do not animate a ScrollTrigger's pinned element. Add a nested stage or animate descendants.

## Hero paper seam

`hero-logo-mascot.png` is an opaque RGB image with a peach paper background baked into it. The repository also contains `hero-paper-texture.png`, derived from the same surface. The hero passes that texture through the CSS custom property `--hero-paper-image` and uses it on `.hero-shell`, `.hero-art`, and beneath the translucent red layer on `.hero-copy`.

The hero image must use normal blending and no color filter. `mix-blend-mode: multiply` or a contrast filter darkens the image's baked paper and recreates a visible rectangle. Keep the CSS background color only as a fast fallback while the texture loads.

## Responsive and reduced motion behavior

- Desktop (`>760px`): ScrollSmoother plus all scene transitions and the pinned horizontal menu.
- Tablet/phone (`<=760px`): short touch smoothing, scene entrances, natural-flow two-column pizza grid, and stacked layouts.
- Phone (`<=520px`): full-height portal, compact typography, sticky order bar, and normal-flow content long enough to remain legible.
- Reduced motion: no ScrollSmoother, pinning, parallax, marquee, scene transforms, or pulled red Remi panel. The complete static content remains in DOM order.

The `motion-ready` class is progressive enhancement. Base CSS must remain readable before JavaScript runs and when it fails. Desktop rail styles therefore live below `.motion-ready`; the unenhanced menu is the normal grid.

## GSAP choices

The current system intentionally uses:

- [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) for scrub, pin, velocity, and scene timing;
- [ScrollSmoother](https://gsap.com/docs/v3/Plugins/ScrollSmoother/) because it retains native document scrolling;
- [gsap.matchMedia()](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/) for automatic desktop/mobile setup and cleanup;
- [Observer](https://gsap.com/docs/v3/Plugins/Observer/) only for direction-aware header intent, not for hijacking section navigation;
- ScrollToPlugin for accessible anchor navigation;
- SplitText and DrawSVG for authored typography.

Flip is not used because this page does not move the same semantic element between two DOM layouts. Snap is also not enabled: the menu and long mobile scenes need free scrolling, and forced snapping would compete with anchor navigation and touch intent.

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
- The desktop menu's scroll length is calculated at refresh time. Any card-width or menu-count change requires desktop pin-end QA.
- ScrollSmoother and pinning both depend on correct wrapper structure. Do not move fixed controls inside `#smooth-content`.
- The opaque hero artwork cannot inherit a CSS background. Its seamless appearance depends on the matching paper texture and neutral image blending.
