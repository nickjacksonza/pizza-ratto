# Design system

## Design origin

The visual direction comes from a photographed Pizza Ratto flyer, now arranged with the bold section changes and pinned scroll pacing of a contemporary food-brand editorial site. The website does not reproduce either reference literally; it translates them into a responsive Pizza Ratto poster system.

The most important source characteristics are:

- blush-pink paper;
- dark wine-red hand lettering;
- checkerboard racing/Vespa references;
- oversized compressed headlines;
- circular pizza photography;
- rough, imperfect alignment;
- playful copy paired with serious food information;
- the rat mascot riding a Vespa while eating pizza.

## Brand character

The site should feel handmade, local, warm, confident, and lightly chaotic. It should never feel corporate, luxury-minimal, glossy, or like a generic food-delivery landing page.

## Colour tokens

The canonical tokens are defined in `:root` in `app/globals.css`:

| Token | Value | Role |
| --- | --- | --- |
| `--orange` | `#FF8513` | Heat, CTA, road scene, and high-energy panels |
| `--red` | `#CC2832` | Primary brand field and Pizza Ratto emphasis |
| `--pink` | `#FFC0C1` | Main playful paper field and headline fill |
| `--grey` | `#373737` | Ink, outlines, footer, and checkerboards |
| `--cream` | `#FFF4DF` | Supporting warm reading surface |
| `--white` | `#FFFAF2` | High-contrast light text |

The first four values are the user-approved core palette. Cream and warm white support legibility but should not displace the core colors. Avoid pure black and pure white.

## Typography

- Display: Anton, loaded through `next/font/google` and exposed as `--font-display`.
- Body: Space Grotesk, exposed as `--font-body`.
- Hero telephone: Georgia for a flyer-like, utilitarian contrast.
- Fallback display: Impact.
- Fallback body: Arial/sans-serif.

Typography principles:

- headlines are uppercase, condensed, and tightly line-spaced;
- body copy remains readable and comparatively calm;
- kicker labels use uppercase, bold weight, and tracked lettering;
- section labels use the exact numbered sequence `01` through `05`;
- rotations are small and purposeful, generally between one and three degrees.

## Texture and imperfection

The global texture is a subtle fixed CSS paper/noise layer on `body::before`. The split hero also renders `public/images/hero-paper-texture.png` through an asset-prefixed CSS custom property so its opaque artwork and red copy panel sit on one continuous paper surface.

Imperfection is created through:

- dashed rules;
- checkerboards;
- offset or rotated cards;
- rough circular borders around pizza photography;
- imperfect alignment within controlled grids;
- poster stickers and stamps.

Do not add arbitrary rotation to every element. Readability and hierarchy take priority.

## Hero composition

The hero deliberately separates concerns in a full-height split composition:

- `hero-logo-mascot.png` contains the Pizza Ratto wordmark and complete mascot/scooter illustration.
- The main promise is live HTML in a red editorial panel so it remains responsive and accessible.
- Phone, hours, location, opening stamp, and WhatsApp CTA are live HTML.
- The matching peach paper texture, checkerboards, and original artwork occupy one shared full-height poster; the same texture sits beneath the red copy layer so the opaque illustration never reads as a separate rectangle.
- Checkerboard bands span the full viewport width.

The full logo, helmet, pizza slice, Vespa, and both wheels must remain visible. The CTA uses the rounded, hard-shadow button language shared across the redesign.

## Scroll choreography

The orange `Hot / PIZZA` sequence is intentionally taller than one viewport. Its inner stage is pinned by ScrollTrigger while a scrubbed GSAP timeline drives four phases:

1. Vara creates real handwriting strokes and DrawSVG progressively draws `Hot`;
2. SplitText brings the oversized `PIZZA` letters in independently with back easing;
3. Remi travels from off-screen left to off-screen right while a nested body timeline adds suspension bob, pitch, shadow compression and speed-line motion; scroll velocity adds a small elastic tilt and lift to the raster so fast and slow input feel different;
4. a full red editorial panel travels in from the left behind Remi, visually tethered to the scooter, until it replaces the orange scene before the ticker.

The pulled panel reuses the approved venue-table photograph with a red editorial composition, pink display copy, an orange `PULLING UP` badge, a checker road and a short tow line that expands as the scene catches Remi. It replaces the previously unused red tail of the pinned section; it is decorative and hidden in the reduced-motion fallback.

The same client component treats every major story section as a viewport-scale scene. Palette-colored curtains bridge the chapters: they clear left or right, collapse as an iris, split from the centre, or skew like a paper shutter while the incoming composition assembles behind them. On large desktop viewports the story, menu portal, ingredients, character, social and visit chapters then lock at the top of the viewport and spend scroll progress on a bespoke internal sequence before releasing the next chapter. Ingredients change crop and color, Remi disintegrates through pixel-distributed canvas layers while his poster stays fixed, the portal pizzas orbit, the social cards deal into a mural, and the visit actions assemble in order. Shutters straighten and finish at `±120%`, which prevents a diagonal wedge lingering beside tall scenes. ScrollSmoother supplies native-scroll-backed interpolation and restrained lag effects, ScrollToPlugin handles nearby anchor navigation, and Observer hides or restores the fixed header according to scroll intent. Long anchor jumps use a fixed red route card with checker, wheel and speed-line details; the document position changes only while that card fully covers the viewport, so locked timelines never appear to fast-forward. Fixed chrome and the route card remain outside the transformed smooth-content wrapper.

The pizza menu stays in natural reading order: four rows of three on desktop and six rows of two below `760px`. GSAP alternates whole rows from the left and right as they approach the viewport, while the oversized `PIZZA` marquee travels horizontally on its own scroll range. The menu never pins or becomes a horizontal carousel.

The `PIZZA` title deliberately uses visible overflow plus top and bottom padding; do not reintroduce an overflow mask on the full word. Character masks belong on the individual SplitText entrance wrappers only. `Hot` is generated as real Vara paths with a heavier rounded stroke and a small red print-registration shadow.

Core motion initializes before the optional Vara font fetch completes. The font data is also preloaded from `app/layout.tsx`; only the handwritten stroke timeline waits for its path data. Chapter locks activate only at `1001px` and wider with at least `720px` of viewport height. Smaller or shorter screens retain natural document flow. Reduced-motion mode turns every pinned sequence into a static composition, hides the pulled editorial panel, disables marquees, and removes parallax transforms.

## Section rhythm

The page uses a sequence of deliberate full-view scenes:

- hero height: approximately one viewport on desktop, content-height on mobile;
- road scene: `280svh` desktop and `235svh` below `760px`;
- story, portal, ingredients, characters, social and visit: exactly one stage-height while desktop motion is active, with pin spacing supplying their internal scroll budget;
- the same chapters: content-height or at least `100svh` when pins are not active;
- coffee/dolci: natural document flow at every size;
- pizza menu: natural document flow at every size, with four desktop rows of three and six mobile rows of two;
- global section padding: up to `7.5rem` for major editorial pauses;
- ingredients section: one viewport minimum on desktop;
- Meet Remi poster artwork: up to `620px` wide inside the locked desktop composition, with a complete natural-flow poster on smaller screens;
- social collage: one pinned desktop poster; `780px`–`870px` of controlled collage space below `1001px`.

Do not reintroduce large empty vertical bands unless the content requires them.

## Menu composition

Pizza uses a strict twelve-card grid: three columns on desktop and two columns on mobile. Motion changes only how rows enter, never the final geometry or reading order. The menu portal uses circular cutouts with grey outlines and red offset shadows; the full menu switches to equal rectangular photography with hard grey borders. Labels begin below the images with positive spacing, and the hot-honey/rat-sauce badge sits after the grid with enough padding to keep its rotated border fully visible.

Eight cards use enhanced owner-supplied photography and four use generated concept photography. The placeholder component remains as a deliberate fallback for future menu additions without a photo.

## Counter tapes

The coffee/dolci board now hands off to a compact horizontal owner-media strip rather than another tall grid. Seven short, muted portrait videos document the oven, pass, espresso, doughnuts and hand-lettered boxes. The Figma and dated owner archive cards are intentionally not rendered.

- Cards use warm cream borders, red offset shadows and restrained one-degree rotations.
- On large desktop screens all seven videos remain in one static line while the chapter is visible. The chapter locks only to perform its exit: the exact-red sheet begins fully above the scene, then seven restrained lobes pass through an animated fractal displacement plus blur/threshold field over the heading, supplied Pizza Ratto banner and footage together. On smaller or shorter screens the videos remain horizontally scrollable and snap-assisted and the gooey overlay is omitted.
- Video poster frames are always present. Under reduced motion the loops are hidden and the same frames remain visible.
- The counter lock is presentation-only; it must never spread to the pizza or coffee/dolci menus.

Figma-derived red pizza, cup and ice-cream marks punctuate the menu headers. Each mark occupies a dedicated header slot with its label beneath it rather than hanging outside a circular badge. Their exact supplied paths are rendered inline so MorphSVG can scrub each main silhouette from a compact ink shape into the finished mark; toppings, steam, cup details and cone arrive in a short secondary beat. Reduced motion renders the completed vectors without an intermediate state. The supplied stacked wordmark is the primary header mark; the black pizza-slice outline and wide banner remain supporting brand assets. The counter banner is recoloured directly in its SVG paths: red letterforms keep contrasting interior counters, avoiding both the earlier green filter and the solid silhouettes produced by a CSS mask.

Coffee and dolci use structured lists in orange and pink split panels rather than photographed menu boards. The board's curtain and label may enter together, but each category owns a separate `top 90%` ScrollTrigger for its header and rows. In the stacked layout this prevents Dolci from completing while only Coffee is on screen.

The expanded pizza menu contains twelve photo cards: four rows of three on desktop and six rows of two on phones, in both enhanced and reduced-motion modes. Provisional specials use a small red confirmation label beneath their ingredient descriptions.

The `Never pizza solo.` Ratto Social Club view uses a large editorial heading followed by four irregular venue/food cards. The room, Vespa table, feast and lemon-dessert photographs arrive from four directions and settle over a code-native abstract mural made from the approved palette, checker stripes, a Vespa-like wheel, pizza slice and curling rat tail. A second Vara instance writes a restrained background `Ratto` in one clean red ink as the chapter enters. Its generated strokes draw sequentially in DOM/pen order rather than all appearing as concurrent dashed fragments; the complete word remains static under reduced motion. Hard grey borders, red shadows and restrained rotations keep the collage in the flyer language. A red `Follow @pizza_ratto` badge trails the cursor on precise desktop pointers; it becomes a fixed, ordinary Instagram action on touch and narrow layouts. This is a social poster, not an image carousel.

## Responsive behavior

### At or below 1000px

- hero CTA column narrows;
- manifesto becomes two columns;
- characters and visit sections simplify.
- narrative chapter locks turn off and the social collage becomes a tall natural-flow composition.

### At or below 760px

- main content grids collapse to one column;
- desktop navigation hides;
- mobile navigation appears;
- hero artwork and CTA panel become one vertical reading sequence;
- pizza grid becomes two columns;
- social cards keep a compact, controlled collage with smaller overlaps and a fixed follow action;
- the Meet Remi poster becomes a single-column static composition with no fragment generation; Big Bertha's two fire frames remain prominent without overwhelming the poster and the Remi cutout overlaps them without a white rectangle.

### At or below 520px

- the fixed quick-order bar appears;
- body receives bottom safe-area spacing;
- section padding tightens;
- headings scale down and allow emergency wrapping;
- pizza descriptions and prices stack for readability;
- provisional menu badges wrap within their own grid track so they cannot widen neighbouring pizza cards;
- menu lists become one column;
- WhatsApp is highlighted as the primary quick action.

### At or below 390px

- hero phone size reduces;
- pizza-grid gaps tighten;
- owner-table editorial layout narrows.

## Interaction and accessibility

- Skip link becomes visible on focus.
- All interactive elements receive a high-contrast focus ring.
- Buttons are at least 48px high; mobile menu is 46px; sticky actions are 64px.
- Mobile safe-area insets are respected.
- WhatsApp actions include a recognizable brand mark without replacing their visible text; the footer Instagram control is icon-only with an accessible label.
- The ticker uses two identical long text runs so one enters from the right while the other exits left. Keep both runs identical: the `translateX(-50%)` loop depends on equal widths.
- Its standard loop duration is 14 seconds. If the copy length changes, visually recheck the perceived speed instead of changing the duration blindly.
- The top announcement remains static and centered when it fits. At phone widths it switches to two identical 18-second runs so the complete business message remains legible without compression or clipping. Reduced-motion mode disables that loop and wraps one copy instead.
- The three long editorial headings in sections 01, 03, and 05 use the targeted `.spaced-heading` word spacing. Do not apply it globally to every condensed heading.
- Remi's original generated portrait has asymmetric blank canvas around the visible drawing and remains active in the road scene with a bounded upper crop and `mix-blend-mode: multiply`. The character poster uses a dedicated alpha cutout derived from that established artwork so its cream paper texture remains visible around the complete figure. Keep the helmet, pizza, complete scooter and both wheels inside both compositions. Big Bertha uses a compact side-by-side crop of the oven and flames, preserving its cultural importance without enlarging the low-resolution footage beyond usefulness.
- The ticker stops under `prefers-reduced-motion: reduce`.
- The road scene becomes static, every handwriting stroke is shown, section wipes are disabled, and marked parallax elements return to their natural position under `prefers-reduced-motion: reduce`.
- Images require descriptive, content-specific alt text.
- The live hero promise supplies the single visible semantic `h1`; the artwork remains a descriptive image.

## Common visual regressions

Before approving a visual change, check for:

- cropped logo, helmet, pizza slice, scooter, or wheels;
- checkerboards that stop before the viewport edge;
- phone number overflow;
- footnote text inside the lower checkerboard;
- hero CTA panel losing its deliberate red full-height field;
- a visible white rectangle around Remi in the orange road scene;
- excessively tall sections;
- section labels becoming too small;
- mobile pizza text below roughly 13px;
- sticky bar covering footer content.
