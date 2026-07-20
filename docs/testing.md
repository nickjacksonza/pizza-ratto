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
- `Hot` draws as individual strokes rather than a rectangular reveal, `PIZZA` letters arrive separately, then Remi crosses the complete viewport before the section ends;
- Remi's body visibly bobs and pitches while its shadow stays grounded;
- the road-scene color wipe reaches the ticker without a white or broken-image flash;
- major sections wipe in from alternating directions without exposing non-palette color flashes;
- floating menu pizzas and gallery cards enter from different directions without exposing empty image edges;
- pizza labels align with photographs and prices;
- all twelve pizza photographs load without fallback placeholders;
- section labels are readable;
- Remi art is not cropped;
- the moving Remi asset blends into the orange background without a visible white rectangle;
- visit buttons and footer are balanced.

### Mobile

- menu button is easy to tap and menu closes after navigation;
- announcement text loops continuously without a blank gap, clipping or compressed lettering;
- hero art preserves its aspect ratio;
- phone number does not overflow at 390px and below;
- pizza names, prices, descriptions, and notes remain readable in two columns;
- long headings wrap without horizontal scrolling;
- sticky bar highlights WhatsApp and respects the bottom safe area;
- sticky bar does not cover footer content;
- touch targets are at least 44px;
- page has no horizontal scroll.
- Remi enters from the left, remains fully recognizable mid-route, and exits to the right without creating horizontal scroll.
- pizza images in each mobile row share the same top edge;
- pizza labels start below their images with no overlap;
- the mobile gallery keeps its intended overlap without horizontal scroll or unreadable cropping.
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
- Confirm the redundant Instagram text action is absent from section 05 while the footer icon remains.
- Confirm Remi's helmet and both Vespa wheels remain visible at desktop and phone widths.
- Confirm reduced motion converts the road scene to a static composition, shows the complete `Hot` lettering, and removes parallax, wipe, split-text and marquee motion.
- Maintain one semantic `h1` and logical section headings.

## Performance checklist

- Preserve `loading="eager"` only for the hero art.
- Lazy-load below-the-fold photographs.
- Keep photographs in WebP where practical.
- Reassess the three multi-megabyte PNGs before a performance-focused release.
- Do not reintroduce a runtime image endpoint while GitHub Pages remains a target.
