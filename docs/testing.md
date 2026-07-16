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
- pizza labels align with photographs and prices;
- section labels are readable;
- Remi art is not cropped;
- visit buttons and footer are balanced.

### Mobile

- menu button is easy to tap and menu closes after navigation;
- hero art preserves its aspect ratio;
- phone number does not overflow at 390px and below;
- pizza names, prices, descriptions, and notes remain readable in two columns;
- long headings wrap without horizontal scrolling;
- sticky bar highlights WhatsApp and respects the bottom safe area;
- sticky bar does not cover footer content;
- touch targets are at least 44px;
- page has no horizontal scroll.
- pizza images in each mobile row share the same top edge;
- pizza labels start below their images with no overlap;
- all mobile collage transforms resolve to `none`.

## Accessibility checklist

- Tab through the full page.
- Confirm the skip link appears on focus.
- Confirm focus rings remain visible on every background.
- Confirm the mobile menu reports `aria-expanded` correctly.
- Check image alt text after asset changes.
- Confirm decorative checkerboards are `aria-hidden`.
- Enable reduced motion and confirm the ticker stops.
- At normal motion, confirm ticker copy covers the full banner and replacement text continuously enters from the right.
- Confirm every WhatsApp link retains visible text and a decorative icon.
- Confirm the icon-only Instagram footer link has an accessible name.
- Confirm the redundant Instagram text action is absent from section 05 while the footer icon remains.
- Confirm Remi's helmet and both Vespa wheels remain visible at desktop and phone widths.
- Maintain one semantic `h1` and logical section headings.

## Performance checklist

- Preserve `loading="eager"` only for the hero art.
- Lazy-load below-the-fold photographs.
- Keep photographs in WebP where practical.
- Reassess the three multi-megabyte PNGs before a performance-focused release.
- Do not reintroduce a runtime image endpoint while GitHub Pages remains a target.
