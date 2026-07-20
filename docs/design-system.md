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

The active texture is a subtle fixed CSS paper/noise layer on `body::before`. The original `public/images/hero-paper-texture.png` remains in the asset archive but is not rendered by the current split hero.

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
- Pink paper, checkerboards, and the original artwork occupy one shared full-height poster.
- Checkerboard bands span the full viewport width.

The full logo, helmet, pizza slice, Vespa, and both wheels must remain visible. The CTA uses the rounded, hard-shadow button language shared across the redesign.

## Scroll choreography

The orange `Hot / PIZZA` sequence is intentionally taller than one viewport. Its inner stage is pinned by ScrollTrigger while a scrubbed GSAP timeline drives four phases:

1. Vara creates real handwriting strokes and DrawSVG progressively draws `Hot`;
2. SplitText brings the oversized `PIZZA` letters in independently with back easing;
3. Remi travels from off-screen left to off-screen right while a nested body timeline adds suspension bob, pitch, shadow compression and speed-line motion; scroll velocity adds a small elastic tilt and lift to the raster so fast and slow input feel different;
4. a full red editorial panel travels in from the left behind Remi, visually tethered to the scooter, until it replaces the orange scene before the ticker.

The pulled panel reuses the approved venue-table photograph with a red editorial composition, pink display copy, an orange `PULLING UP` badge, a checker road and a short tow line that expands as the scene catches Remi. It replaces the previously unused red tail of the pinned section; it is decorative and hidden in the reduced-motion fallback.

The same client component applies masked SplitText entrances to major headings, scroll-scrubbed full-viewport translations and directional child entrances to marked sections, image parallax, a scrubbed menu marquee and staggered gallery/card motion. Left and right panels begin just beyond the viewport (`±102%`) so their directional arrival is unmistakable instead of reading as a local reveal. ScrollSmoother supplies native-scroll-backed interpolation and restrained lag effects, ScrollToPlugin handles anchor navigation, and Observer hides or restores the fixed header according to scroll intent. Fixed chrome remains outside the transformed smooth-content wrapper.

The `PIZZA` title deliberately uses visible overflow plus top and bottom padding; do not reintroduce an overflow mask on the full word. Character masks belong on the individual SplitText entrance wrappers only. `Hot` is generated as real Vara paths with a heavier rounded stroke and a small red print-registration shadow.

Core motion initializes before the optional Vara font fetch completes. The font data is also preloaded from `app/layout.tsx`; only the handwritten stroke timeline waits for its path data. Reduced-motion mode turns the pinned sequence into a static composition, hides the pulled editorial panel, disables marquees, and removes parallax transforms.

## Section rhythm

The regular content sections remain compact; the road scene is the one deliberate long-scroll exception:

- hero height: approximately one viewport on desktop, content-height on mobile;
- road scene: `280svh` desktop and `235svh` below `760px`;
- global section padding: up to `7.5rem` for major editorial pauses;
- ingredients section: `720px` minimum on desktop;
- character artwork: `620px` minimum on desktop;
- gallery stack: fluid `620px`–`940px` stage on desktop and `710px`–`850px` on narrow screens.

Do not reintroduce large empty vertical bands unless the content requires them.

## Menu composition

Pizza uses a strict three-column desktop grid and two-column mobile grid. The menu portal uses circular cutouts with grey outlines and red offset shadows; the full menu switches to equal rectangular photography with hard grey borders. Labels begin below the images with positive spacing.

Eight cards use enhanced owner-supplied photography and four use generated concept photography. The placeholder component remains as a deliberate fallback for future menu additions without a photo.

Coffee and dolci use structured lists in orange and pink split panels rather than photographed menu boards.

The expanded pizza menu contains twelve photo cards: four rows of three on desktop and six rows of two on phones. Card transforms are disabled at every breakpoint to protect image baselines and label clearance. Provisional specials use a small red confirmation label beneath their ingredient descriptions.

The Rat Hole gallery uses a bounded editorial header followed by a four-card stack. The room, Vespa table, feast and lemon-dessert photographs enter from different sides and settle into a deliberately overlapping collage with hard borders, orange shadows and small rotations. Narrow screens preserve the overlap with controlled absolute positions instead of flattening the photographs into a generic vertical list.

## Responsive behavior

### At or below 1000px

- hero CTA column narrows;
- manifesto becomes two columns;
- characters and visit sections simplify.

### At or below 760px

- main content grids collapse to one column;
- desktop navigation hides;
- mobile navigation appears;
- hero artwork and CTA panel become one vertical reading sequence;
- pizza grid becomes two columns;
- gallery keeps a compact, controlled collage with smaller overlaps;
- the character panels become a single-column sequence.

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
- Remi's portrait source has asymmetric blank canvas around the visible drawing. The road scene uses a bounded overflow crop plus `mix-blend-mode: multiply`; the character scene optically centers the source with a slight left correction. Keep the helmet, pizza, complete scooter and both wheels inside the visible crop.
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
