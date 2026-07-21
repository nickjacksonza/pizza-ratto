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
- MorphSVG;
- Vara with local Satisfy stroke data.

The fixed announcement, header, and mobile order bar remain outside `#smooth-wrapper`. Only `main` and `footer` live inside `#smooth-content`. This prevents fixed controls from inheriting ScrollSmoother's content transform.

## Startup order

1. Load the animation modules and construct Vara.
2. Check `prefers-reduced-motion`. In reduced motion, show the complete `Hot` paths and stop without creating ScrollSmoother or ScrollTriggers.
3. Add `.motion-ready`. On large desktop only, clone the transparent Remi image into irregular clipped slices before the locked character timeline is attached.
4. Initialize ScrollSmoother. General scene motion must not wait for Vara's JSON callback.
5. Create section, heading, parallax, menu, locked-chapter, social, navigation, and Remi timelines inside one GSAP context.
6. Await both Vara instances separately, configure the generated `Hot` and `Ratto` SVG paths, and attach their independent responsive DrawSVG ScrollTriggers.
7. On cleanup, revert both handwriting contexts, responsive match-media contexts, the main GSAP context, splits, Observer, and ScrollSmoother, remove the generated Remi canvases, then remove Vara's generated SVG children.

The local Vara JSON is preloaded in `app/layout.tsx`. Keep that path routed through the shared `asset()` helper.

## Scene inventory

Scene identity is declared in `app/page.tsx` with `data-scene` and `data-transition`. The central dispatcher in `ScrollChoreography.tsx` reads those attributes.

| View | Selector | Transition | Behavior |
| --- | --- | --- | --- |
| Hero | `.hero-shell` | load entrance | Artwork and red copy arrive from opposite sides; both share `hero-paper-texture.png` so the paper surface is continuous. |
| Hot Pizza | `.drive-sequence` | pinned Remi handoff | Vara/DrawSVG writes `Hot`; SplitText brings in `PIZZA`; Remi bounces across and tows a full red editorial scene from left to right. |
| 01 / What we're about | `[data-scene="story"]` | `paper-left` + locked rules | A red paper curtain clears to the right; the desktop view then pins while house rules arrive one at a time and the poster shifts sideways. |
| 02 / The important bit | `[data-scene="menu-portal"]` | `iris` + locked orbit | A cream curtain collapses into a central circle; the desktop view pins while pizza cutouts fly in, the ring expands and the CTA kicks upward. |
| Pizza menu | `[data-scene="pizza-menu"]` | `shutter-left` + mark morph | A pink shutter clears to the right, then the three-column menu rows alternately enter from the left and right. The supplied pizza silhouette morphs from a compact ink shape before its toppings and crust details appear. |
| Coffee and dolci | `[data-scene="small-menu"]` | `cards-up` + local category triggers + mark morphs | A red shutter clears right with the label; Coffee and Dolci then reveal independently only when each category reaches the viewport. Their supplied cup and ice-cream silhouettes morph into place with delayed detail reveals. |
| Counter tapes | `[data-scene="counter-tapes"]` | `counter-static` + locked gooey exit | A pink paper shutter clears left, leaving seven videos static in one line. The exact-red surface begins at `-155%`, fully clear of the editorial header, then starts descending at timeline progress `.18`. Seven restrained, horizontally overscanned lobes move over the heading, supplied banner and footage together through animated fractal displacement, blur and alpha thresholding, then `BUILT DIFFERENT` appears before release. Smaller and reduced-motion layouts remain native and swipeable without the overlay. |
| 03 / Built different | `[data-scene="ingredients"]` | `split` + locked material change | A cream curtain splits from its centre; the desktop stage then pins while the photograph pushes in, the crop bends and the copy surface changes from red to grey. |
| Meet Remi / Big Bertha | `[data-scene="characters"]` | `remi-poster` + locked disintegration | A red curtain exits left as a cream poster assembles with Remi, fully visible oversized RATTO type and a compact two-frame Big Bertha feature. On large desktop, 75 pixel-distributed canvas layers disperse Remi alone, revealing `Gone for pizza` in the open centre-left field without covering the oven; mobile, short and reduced-motion views keep the complete static poster. |
| 04 / Ratto Social Club | `[data-scene="social"]` | `deck` + locked collage | A grey diagonal shutter exits right; red Vara paths draw the background `Ratto`, four venue/food cards deal in from four directions over an abstract brand mural, then drift while the Instagram badge becomes interactive. |
| 05 / Find the fire | `[data-scene="visit"]` | `shutter-right` + locked action reveal | A pink shutter exits left; the desktop stage pins while visit rows and order actions reveal laterally from one shared top-aligned grid row. |

Every scene uses only the approved orange, red, pink, grey, and established cream paper neutral. Avoid introducing transitional white or browser-background flashes.

## Grid menu choreography

The pizza menu is deliberately a natural-flow grid at every breakpoint: three columns above `760px` and two columns at or below it. The earlier pinned horizontal rail was removed because it made prices and toppings slower to compare.

`gsap.matchMedia()` supplies the correct column count to one row-entrance helper. The helper calculates each card's row and alternates the starting direction by row: left, right, left, right. Each card scrubs into its final grid position over a short local range. The large red `PIZZA` marquee keeps an independent horizontal ScrollTrigger, so the chapter still has lateral energy without changing the menu's reading order.

All menu photographs are below the initial viewport and load lazily. The sauce badge remains after the complete grid in normal document flow; do not put it inside a fixed-height or pinned stage.

Coffee and Dolci deliberately do not inherit the parent `cards-up` child animation. Each `.menu-category` owns a local scrubbed timeline from `top 90%` to `top 44%`, so the stacked Dolci list cannot animate before its own top edge reaches the viewport. Keep `.small-menu-grid` excluded from the central scene-child dispatcher if this area is refactored.

The three supplied menu marks use inline copies of their exact source paths because MorphSVG must address live SVG geometry; the canonical files remain in `public/images/brand`. Each main silhouette morphs from a simple path in the same viewBox, then its detail group scales and fades in. These timelines are reversible and scrubbed locally from `top 92%` to `top 58%`. Do not apply MorphSVG to external `<img>` elements or to the wide counter wordmark. Under reduced motion, setup returns before any morph state is applied, leaving the complete source artwork visible.

## Section entrance rules

- Scenes have a minimum height of `100svh`; content may extend beyond one viewport when readability requires it.
- Every enhanced scene contains one direct-child `.scene-curtain`. It is absent visually until `.motion-ready` is applied and sits above the fully readable base layout.
- Shutter curtains skew while travelling to `±88%`, then straighten and finish at `±120%`; centre-split curtains collapse to zero and iris curtains close to a `0%` circle. Scene containers stay in normal document flow until a desktop-only chapter lock takes over at `top top`.
- The entrance window normally runs from `top 98%` to `top 26%` with scrubbed progress.
- Split and column scenes animate their children behind the clearing curtain rather than translating the scene container.
- Scroll-scrubbed entrances remain reversible. Do not replace them with one-time intersection animations.
- Heading SplitText is additional detail, not the section transition itself.
- Curtain colors intentionally echo the preceding chapter so the new view appears to be pulled or uncovered rather than simply faded in.
- Do not translate or rotate a ScrollTrigger's pinned element. Locked chapter timelines animate descendants and CSS custom properties while the chapter container itself remains the pin target.

## Locked chapter architecture

The reference recordings do not show ordinary long-section scrolling. They stop document travel at a composed viewport, spend wheel/touch progress on an internal timeline, and only release the next chapter after that composition has finished. Pizza Ratto mirrors that pacing on sufficiently large screens.

- A lockable semantic section declares `data-lock-chapter="name"` and `data-lock-scroll="multiplier"` in `app/page.tsx`.
- On viewports at least `1001px` wide and `720px` high, `gsap.matchMedia()` creates one ScrollTrigger per lockable section with `pin: chapter`, `start: "top top"`, and an end distance equal to `innerHeight × data-lock-scroll`.
- Each stage owns a thin `.chapter-progress` rail so users can see how much internal scroll remains.
- Story, menu portal, counter tapes, ingredients, characters, social and visit use different internal timelines. Do not collapse them into one generic stagger.
- The pizza and coffee/dolci menus never pin. Their content density and comparison task require natural document flow. Counter tapes is the only media reel that locks, and only at the established large-desktop threshold.
- Viewports at or below `1000px`, heights below `720px`, touch layouts and reduced-motion mode do not create chapter pins. Portal and social cards retain shorter entrance timelines in normal flow.

Keep the pin trigger on the stable section container and animate only descendants. Pin spacing is required so the following semantic section remains in correct document order.

## Remi disintegration

The Meet Remi effect follows dev_loop's [GSAP ScrollTrigger disintegration demo](https://codepen.io/dev_loop/pen/mdVWRMv). At the large-desktop breakpoint, the runtime draws the transparent Remi image into a `380px` working canvas, creates 75 empty canvases, and assigns each visible pixel to three layers. The layer index uses the demo's `(random + 2x / width) / 3` bias, so Remi dissolves progressively from left to right while the heading, RATTO backdrop, checker, caption and Big Bertha remain stable.

The oversized RATTO word remains inside the poster's safe bounds for the full pinned timeline. The payoff copy occupies the negative space between the editorial introduction and Big Bertha rather than crossing the oven media.

GSAP gives every canvas the demo's independent random direction, modest `40px` drift, random rotation and index-based delay while the character chapter is pinned; reverse scrolling reconstructs Remi. The semantic original remains present until every canvas is ready, then swaps atomically at the start of the breakup. Generated canvases are removed during cleanup. Smaller, short, reduced-motion and canvas-failure layouts use the original complete poster and a simple mascot fade fallback.

## Social-club cursor interaction

The `Never pizza solo.` chapter reuses four documented Pizza Ratto photographs over a code-native mural made only from orange, red, pink, grey and cream. The collage is not a carousel: all four images are visible together and deal into one poster composition while the section is locked.

The full collage is one Instagram link with a visible `.social-follow-badge`. On devices matching `min-width: 1001px`, `hover: hover` and `pointer: fine`, two `gsap.quickTo()` setters make that badge trail pointer movement with easing. It recentres on pointer leave or renewed page scrolling so stale pointer coordinates do not survive a chapter exit. On touch, narrow and reduced-motion layouts the badge stays fixed near the collage bottom and the link uses a normal pointer cursor. Preserve the accessible link label and visible `Follow @pizza_ratto` text.

The background lettering is not CSS text. `#social-ratto-drawing` is populated by a second Vara instance using the same local Satisfy data as `Hot` and styled as one clean `--red` ink layer. DrawSVG animates the generated paths sequentially in their Vara/DOM pen order, with duration weighted by each path's measured length; do not reintroduce a collection tween that draws all paths concurrently or an offset text shadow. Large locked views draw it over the first `0.72 × viewport height` of the social pin; narrow or short views use a normal-flow `top 88%` to `top 34%` trigger. Reduced motion shows every path complete.

## Anchor navigation handoff

Nearby in-page links retain a short ScrollToPlugin tween. Jumps longer than `1.35 × viewport height` use `.nav-transition`, a fixed red route card outside `#smooth-wrapper`. GSAP wipes the cover fully across, calls `ScrollSmoother.scrollTop(targetY)` only while the screen is covered, updates ScrollTrigger, moves keyboard focus to the destination, updates the URL hash, and then wipes the card away. This is intentionally an instant covered state change: tweening the document across several pins makes every intermediate chapter look like it is being fast-forwarded.

The destination sections use `tabIndex={-1}` so programmatic focus does not add them to normal tab order. The transition is decorative and `aria-hidden`; reduced-motion mode does not initialize it and leaves standard hash navigation intact.

## Hero paper seam

`hero-logo-mascot.png` is an opaque RGB image with a peach paper background baked into it. The repository also contains `hero-paper-texture.png`, derived from the same surface. The hero passes that texture through the CSS custom property `--hero-paper-image` and uses it on `.hero-shell`, `.hero-art`, and beneath the translucent red layer on `.hero-copy`.

The hero image must use normal blending and no color filter. `mix-blend-mode: multiply` or a contrast filter darkens the image's baked paper and recreates a visible rectangle. Keep the CSS background color only as a fast fallback while the texture loads.

## Responsive and reduced motion behavior

- Large desktop (`>=1001px` and `>=720px` high): ScrollSmoother, scene curtains, pinned narrative chapters with internal scrubbed timelines, mascot-only Remi slice disintegration, cursor-follow social CTA, and a natural-flow three-column pizza grid.
- Tablet/short desktop (`<=1000px` wide or `<720px` high): no narrative pins; short normal-flow portal/social entrances preserve the story without trapping readable content.
- Tablet/phone (`<=760px`): short touch smoothing, scene curtains, a natural-flow two-column pizza grid with alternating lateral row entrances, and stacked layouts.
- Phone (`<=520px`): full-height portal, compact typography, sticky order bar, and normal-flow content long enough to remain legible.
- Reduced motion: no ScrollSmoother, pinning, parallax, marquee, scene transforms, pulled red Remi panel, or generated Remi canvases. The complete static content remains in DOM order.

The `motion-ready` class is progressive enhancement. Base CSS must remain readable before JavaScript runs and when it fails. Curtains are hidden in base and reduced-motion CSS; the menu is always a normal grid.

## GSAP choices

The current system intentionally uses:

- [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) for scrub, pin, velocity, and scene timing;
- [ScrollSmoother](https://gsap.com/docs/v3/Plugins/ScrollSmoother/) because it retains native document scrolling;
- [gsap.matchMedia()](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/) for automatic desktop/mobile setup and cleanup;
- [Observer](https://gsap.com/docs/v3/Plugins/Observer/) only for direction-aware header intent, not for hijacking section navigation;
- ScrollToPlugin for nearby accessible anchor navigation, with a covered ScrollSmoother position change for long jumps;
- SplitText and DrawSVG for authored typography.

Flip is not used because this page does not move the same semantic element between two DOM layouts. Snap is also not enabled: the long scenes and scan-friendly menu need free scrolling, and forced snapping would compete with anchor navigation and touch intent.

## Editing checklist

When adding or changing a scene:

1. Give the semantic container `data-scene` and a supported `data-transition`.
2. Ensure its default CSS is complete without `.motion-ready`.
3. Add a specific transition branch only when the existing presets cannot express the idea.
4. Add `data-lock-chapter` only for a true single-screen narrative beat; never use it on dense menus or long-form reading content.
5. Keep scene backgrounds in the approved palette and ensure no body-color gap appears while transformed.
6. Test the entrance and lock forward and backward at 2560×1318, a desktop shorter than 720px, and 390×844.
7. Verify `document.documentElement.scrollWidth === window.innerWidth` throughout the transition.
8. Confirm fixed chrome and the mobile order bar do not cover essential copy or actions.
9. Test reduced motion and cleanup after responsive resizing.
10. Run lint, typecheck, tests, the normal build, and the Pages build.

## Known constraints

- The mobile social collage and coffee/menu content may exceed one viewport because preserving readable text takes priority over forcing every pixel into a screen.
- ScrollSmoother and pinning both depend on correct wrapper structure. Do not move fixed controls inside `#smooth-content`.
- Curtains temporarily cover each incoming scene, so new transition presets must straighten and clear fully at progress `1`; a final skew on a tall scene can leave a colored wedge inside the viewport.
- The opaque hero artwork cannot inherit a CSS background. Its seamless appearance depends on the matching paper texture and neutral image blending.
