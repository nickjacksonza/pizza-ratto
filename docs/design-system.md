# Design system

## Design origin

The visual direction comes from a photographed Pizza Ratto flyer. The website is not intended to reproduce the flyer literally; it translates the flyer into a responsive editorial poster system.

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
| `--paper` | `#f1d9d1` | Main blush paper surface |
| `--paper-light` | `#f8e8df` | Lighter panels and readable contrast |
| `--pink` | `#dfa2a3` | Gallery and character accents |
| `--rose` | `#c87578` | Secondary warm accent |
| `--wine` | `#8e4f57` | Primary brand ink, borders, checkerboards |
| `--coral` | `#d46f5d` | CTA and slogan accent |
| `--ink` | `#332c2b` | Main text and hard outlines |
| `--sage` | `#71806b` | Reserved secondary accent |
| `--white` | `#fff8ee` | Warm near-white text |

Do not replace these with pure white, pure black, or bright primary red without a deliberate redesign.

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

There are two texture layers:

1. A subtle fixed CSS noise layer on `body::before`.
2. `public/images/hero-paper-texture.png` behind the hero.

The hero texture was generated from the visual character of the extracted flyer paper. It contains only paper grain and no text or objects.

Imperfection is created through:

- dashed rules;
- checkerboards;
- offset or rotated cards;
- rough circular borders around pizza photography;
- imperfect alignment within controlled grids;
- poster stickers and stamps.

Do not add arbitrary rotation to every element. Readability and hierarchy take priority.

## Hero composition

The hero deliberately separates concerns:

- `hero-logo-mascot.png` contains the Pizza Ratto wordmark and complete mascot/scooter illustration.
- The slogan is live HTML so it remains responsive and accessible.
- Phone, hours, location, and WhatsApp CTA are live HTML.
- The paper texture covers the full hero.
- Checkerboard bands span the full viewport width.

The CTA is integrated using a transparent background and a simple divider. It must not regain the floating-card border and drop shadow used in an earlier iteration.

The lower footnote is positioned above the checkerboard using `bottom: calc(42px + 1rem)` on desktop. This spacing is intentional.

## Section rhythm

The first version felt too tall. The current system was compacted deliberately:

- hero minimum height: `620px`;
- global section padding: up to `6rem` rather than `8rem`;
- ingredients section: `600px` minimum;
- Remi artwork: `460px`;
- gallery fixed rows: `220px` and `190px` on desktop.

Do not reintroduce large empty vertical bands unless the content requires them.

## Menu composition

Pizza uses a three-column desktop collage and two-column mobile grid. Photography is circular with wine-coloured borders. Selected cards are slightly offset or rotated to preserve the flyer character.

Sprint and Veloce intentionally show designed placeholders until approved photographs exist. The placeholders should look deliberate, not broken.

Coffee and dolci use structured lists rather than photographed menu boards. The original board remains visible as a supporting provenance image.

## Responsive behavior

### At or below 1000px

- hero CTA column narrows;
- manifesto becomes two columns;
- characters and visit sections simplify.

### At or below 760px

- main content grids collapse to one column;
- desktop navigation hides;
- mobile navigation appears;
- hero CTA becomes left-aligned with a top divider;
- pizza grid becomes two columns;
- gallery removes secondary decorative content;
- Remi artwork moves above its text.

### At or below 520px

- the fixed quick-order bar appears;
- body receives bottom safe-area spacing;
- section padding tightens;
- headings scale down and allow emergency wrapping;
- pizza descriptions and prices stack for readability;
- menu lists become one column;
- WhatsApp is highlighted as the primary quick action.

### At or below 390px

- hero phone size reduces;
- pizza-grid gaps tighten;
- original-board layout narrows.

## Interaction and accessibility

- Skip link becomes visible on focus.
- All interactive elements receive a high-contrast focus ring.
- Buttons are at least 48px high; mobile menu is 46px; sticky actions are 64px.
- Mobile safe-area insets are respected.
- WhatsApp actions include a recognizable brand mark without replacing their visible text; the footer Instagram control is icon-only with an accessible label.
- The ticker uses two identical long text runs so one enters from the right while the other exits left. Keep both runs identical: the `translateX(-50%)` loop depends on equal widths.
- Its standard loop duration is 14 seconds. If the copy length changes, visually recheck the perceived speed instead of changing the duration blindly.
- The ticker stops under `prefers-reduced-motion: reduce`.
- Images require descriptive, content-specific alt text.
- The hidden `h1` supplies the page's semantic top-level heading while the visual logo remains an image.

## Common visual regressions

Before approving a visual change, check for:

- cropped logo, helmet, pizza slice, scooter, or wheels;
- checkerboards that stop before the viewport edge;
- phone number overflow;
- footnote text inside the lower checkerboard;
- CTA background that looks like a separate card;
- mismatched hero texture and artwork background;
- excessively tall sections;
- section labels becoming too small;
- mobile pizza text below roughly 13px;
- sticky bar covering footer content.
