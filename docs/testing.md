# Testing and quality

## Quality gates

The project uses four primary automated checks:

```bash
npm run build
npm test
npm run lint
npm run typecheck
```

GitHub Pages-related work also requires:

```bash
npm run build:pages
```

## Build check

`npm run build` verifies the vinext application across client, RSC, SSR, and Worker-related environments. It is the minimum check for every implementation change.

## Rendered output tests

`tests/rendered-html.test.mjs` imports the built Worker and requests the homepage. It verifies:

- HTTP success and HTML content type;
- title and primary content;
- menu output and price formatting;
- all twelve pizza cards, their photographs, and provisional-item notes;
- the static seven-video owner-media strip, branded wordmark, inline pizza/cup/ice-cream morph marks, gooey red transition and restored generated Remi art;
- WhatsApp, phone, and Uber Eats destinations;
- Restaurant JSON-LD;
- absence of starter-preview remnants;
- centralization of business and menu data;
- absence of fake destination links.

Because the test imports `dist/server/index.js`, `npm test` builds first.

## Lint and type checking

- `npm run lint` runs ESLint while ignoring generated build directories.
- `npm run typecheck` runs TypeScript without emitting files.

Native `<img>` is deliberately allowed in `app/page.tsx` because GitHub Pages cannot host vinext's image optimizer.

## Pages artifact checks

After `npm run build:pages`, verify:

```bash
test -f dist/client/index.html
test -f dist/client/404.html
test -f dist/client/.nojekyll
```

Check generated paths:

```bash
rg '/pizza-ratto/' dist/client/index.html
rg '/_vinext/image' dist/client/index.html
rg '(href=|src=|url\()/assets/' dist/client/index.html dist/client/404.html
```

The second and third checks should return no invalid unprefixed runtime dependencies.

## Manual visual checklist

### Desktop

- complete logo and mascot visible;
- CTA visually integrated into hero;
- phone number contained;
- checkerboards full width;
- footnote above lower checkerboard;
- hero and later sections not excessively tall;
- `Hot` draws as individual, rounded heavy strokes rather than a rectangular reveal; `PIZZA` letters arrive separately and no glyph is clipped at its cap height or baseline; then Remi crosses the complete viewport before the section ends;
- Remi's body visibly bobs and pitches, reacts subtly to scroll velocity, and compresses its shadow without detaching from the road;
- the smooth wrapper is fixed only when normal motion is active and the road stage is pinned by ScrollTrigger;
- as Remi crosses the road, the red editorial scene enters from completely off-screen left, follows the scooter across the viewport, and fills the stage without leaving the former blank red tail;
- the pulled photograph, `FIRE / TIME / TOMATOES` copy, badge and checker road remain contained at desktop width, 390px and narrower;
- nearby About, Menu and Visit links animate to the correct section through ScrollToPlugin; long jumps show the fixed red route card, change position only while fully covered, land with the correct hash and focus, and never visibly fast-forward intermediate pins; scrolling down hides the header and scrolling up restores it;
- the road-scene color wipe reaches the ticker without a white or broken-image flash;
- the story, portal, pizza, coffee/dolci, ingredients, character, social and visit scenes each occupy a deliberate view and use their documented paper, iris, shutter, split, columns and deck transitions;
- at widths of at least `1001px` and heights of at least `720px`, story, portal, ingredients, character, social and visit pin at `top top`, spend scroll on their internal choreography, then release without a document jump;
- each pinned narrative stage fills its progress rail from top to bottom, remains reversible when scrolling upward, and never animates the pin container itself;
- at `1000px` wide, below `720px` high, and under reduced motion, no narrative pin spacers are created and all content stays in semantic natural flow;
- palette-colored curtains fully cover incoming chapters, then clear left, right, centrally, or as an iris without exposing browser background or remaining over content at the end of their range;
- the pizza menu remains a four-row, three-column grid; rows alternately enter from the left and right without changing DOM reading order, colliding, or creating horizontal overflow;
- Coffee and Dolci headers and rows begin only when their own category top reaches the viewport; in the stacked layout Dolci must still be at its untouched start state while Coffee occupies the screen;
- the hero illustration, surrounding surface and red copy panel share continuous paper grain without a pink strip or darker image rectangle;
- floating menu pizzas and social cards enter from different directions without exposing empty image edges;
- the `Never pizza solo.` mural uses only the approved palette, the single-red-ink `Ratto` paths draw one clean pen stroke at a time without dotted concurrent fragments or a duplicate shadow word, all four cards settle into a deliberate collage, and the Instagram badge trails a precise desktop pointer before returning to centre on pointer leave;
- keyboard focus on the full social collage exposes a visible focus ring around the follow badge and the link opens the documented Instagram URL;
- pizza labels align with photographs and prices;
- the complete `Hot honey & rat sauce · R15 each` badge, including its rotated border, remains visible below the pizza grid;
- all twelve pizza photographs load without fallback placeholders;
- section labels are readable;
- Remi art is not cropped;
- the moving Remi asset blends into the orange background without a visible white rectangle;
- the visit title, address block and action stack share one aligned top edge after the entrance completes; the WhatsApp, Uber Eats and call buttons retain their DOM order and equal spacing;

### Mobile

- menu button is easy to tap and menu closes after navigation;
- announcement text loops continuously without a blank gap, clipping or compressed lettering;
- hero art preserves its aspect ratio;
- phone number does not overflow at 390px and below;
- pizza names, prices, descriptions, and notes remain readable in two columns;
- all twelve menu cards remain in normal two-column document flow, with alternating row entrances that settle precisely onto the CSS grid;
- long headings wrap without horizontal scrolling;
- sticky bar highlights WhatsApp and respects the bottom safe area;
- sticky bar does not cover footer content;
- counter-tape horizontal overflow stays inside its own reel rather than widening the page;
- reduced motion swaps every moving counter tape for its poster frame;
- touch targets are at least 44px;
- page has no horizontal scroll.
- `PIZZA` remains fully visible above and below at 390px without adding horizontal overflow.
- Remi enters from the left, remains fully recognizable mid-route, and exits to the right without creating horizontal scroll.
- the red pulled scene remains visually connected to Remi during the handoff, settles edge-to-edge, and does not hide behind the mobile order bar;
- pizza images in each mobile row share the same top edge;
- pizza labels start below their images with no overlap;
- the mobile social collage keeps its intended overlap without horizontal scroll or unreadable cropping, and its follow button stays fixed rather than chasing touch input.
- all twelve pizza photographs load without broken-image indicators.

## Accessibility checklist

- Tab through the full page.
- Confirm the skip link appears on focus.
- Confirm focus rings remain visible on every background.
- Confirm the mobile menu reports `aria-expanded` correctly.
- Check image alt text after asset changes.
- Confirm decorative checkerboards are `aria-hidden`.
- Enable reduced motion and confirm the ticker stops.
- At phone width with reduced motion enabled, confirm the announcement wraps and remains complete.
- At normal motion, confirm ticker copy covers the full banner and replacement text continuously enters from the right.
- Confirm every WhatsApp link retains visible text and a decorative icon.
- Confirm the icon-only Instagram footer link has an accessible name.
- Confirm the Ratto Social Club Instagram overlay has a descriptive accessible name and visible `Follow @pizza_ratto` text.
- Confirm the redundant Instagram text action is absent from section 05 while the footer icon remains.
- Confirm Remi's helmet and both Vespa wheels remain visible at desktop and phone widths.
- Confirm reduced motion converts the road scene to a static composition, shows the complete `Hot` lettering, and removes parallax, wipe, split-text and marquee motion.
- Maintain one semantic `h1` and logical section headings.

## Performance checklist

- Preserve `loading="eager"` for the hero art and the pinned pull-transition photograph; lazy-load the below-the-fold menu and venue photographs.
- Keep photographs in WebP where practical.
- Reassess the three multi-megabyte PNGs before a performance-focused release.
- Do not reintroduce a runtime image endpoint while GitHub Pages remains a target.
