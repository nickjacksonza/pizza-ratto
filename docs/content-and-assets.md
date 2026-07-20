# Content and assets

## Content ownership

Business and menu content are code-managed rather than CMS-managed.

- `data/business.ts` is the source of truth for contact, hours, address, social, and ordering URLs.
- `data/menu.ts` is the source of truth for names, descriptions, and prices.
- `app/page.tsx` composes editorial copy and maps menu items to photography.
- `app/layout.tsx` owns metadata and social-sharing copy.

Avoid duplicating business facts in components. If a fact changes, update the central data file and then check metadata and JSON-LD for parallel hard-coded values.

## Current business content

| Field | Current value |
| --- | --- |
| Name | Pizza Ratto |
| Phone | 082 525 0380 / +27 82 525 0380 |
| Address | 20 Brickfield Road, Salt River, Cape Town |
| Hours | Monday–Saturday, 10:00–18:00 |
| Fulfilment | Collection only |
| Instagram | `@pizza_ratto` |
| Primary order channel | WhatsApp |
| Secondary order channel | Phone |
| Marketplace | Uber Eats |

The prefilled WhatsApp message is stored in `data/business.ts`.

## Menu model

The menu contains three categories:

- Pizza
- Coffee
- Dolci

The pizza menu currently contains Bianca & Dip, Primavera, Veloce, Sprint, Arcobaleno, and Rally.

Prices should remain numbers in `data/menu.ts`; `zar()` formats them for display. Multi-option prices use labelled objects.

## Editorial copy

The copy voice uses short, punchy lines and undercuts food seriousness with humor. Examples include:

- “Made fresh. Taken seriously by no one.”
- “Respect fire, time & tomatoes.”
- “Proper ingredients. Questionable mascot.”
- “Come hungry. Leave slightly happier.”

New copy should be specific, warm, and concise. Avoid generic restaurant claims such as “culinary journey,” “premium dining experience,” or “made with love.”

## Claim safety

The current safe ingredient wording is:

> Our meat toppings are halal and sourced from Mubarak Food Emporium.

This states the status of the meat toppings and does not claim that the entire restaurant is halal certified. Do not broaden this claim without owner confirmation.

See `content-todo.md` for facts that remain unverified.

## Asset inventory

| Asset | Dimensions | Role | Origin/status |
| --- | ---: | --- | --- |
| `public/og.png` | 1731×909 | Social card and original visual reference | Supplied/generated poster composition |
| `public/images/hero-logo-mascot.png` | 1698×926 | Hero wordmark and complete rat/Vespa illustration | Generated extraction from the flyer visual; project-critical |
| `public/images/hero-paper-texture.png` | 1698×926 | Continuous hero paper surface | Generated background-only paper texture derived from the hero visual; rendered behind the opaque hero composite and beneath the red copy panel to remove visible seams |
| `public/images/ratto-vespa-red.png` | 1096×1435 | Scroll-driving Remi and Meet Remi artwork | Generated edit: red scooter, white helmet, pepperoni pizza; white canvas is visually blended with section colors in CSS |
| `public/images/pizza-ratto-logo-art.png` | 1283×1279 | Icon/logo art | Transparent PNG |
| `public/images/interior.webp` | 291×510 | Ratto Social Club room card | Supplied venue photo, actively rendered in the `Never pizza solo.` collage |
| `public/images/menu-pizza.webp` | 376×510 | Original pizza menu board | Supplied photo, retained but no longer rendered |
| `public/images/menu-coffee.webp` | 381×510 | Reference menu board | Supplied photo, currently not rendered |
| `public/images/menu-dolci.webp` | 377×510 | Reference menu board | Supplied photo, currently not rendered |
| `public/images/pizza-bianca.webp` | 528×510 | Legacy Bianca crop | Supplied photo, retained but no longer rendered |
| `public/images/pizza-primavera.webp` | 455×510 | Legacy Primavera crop | Supplied photo, retained but no longer rendered |
| `public/images/pizza-arcobaleno.webp` | 469×510 | Legacy Arcobaleno crop | Supplied photo, retained but no longer rendered |
| `public/images/pizza-rally.webp` | 481×510 | Legacy Rally crop | Supplied photo, retained but no longer rendered |
| `public/fonts/vara/satisfy.json` | 27KB | Stroke geometry for the animated `Hot` word | Bundled from Vara 1.4.0's Satisfy font data; upstream license reference is documented in the Vara package |

### July 2026 owner photography

All files below live in `public/images/owner-2026/`. Twelve branded delivery-platform exports were restored with the built-in image-editing workflow at high fidelity, reconstructing only the obscured corner. The venue-table photograph had no overlay and received the same clarity, color and dynamic-range treatment. Website derivatives were encoded as WebP at quality 84; generated PNG masters remain in the session's Codex generated-image store.

| Asset | Dimensions | Website role | Ingredient/subject inference |
| --- | ---: | --- | --- |
| `pizza-bianca.webp` | 1402×1122 | Bianca & Dip card | Rosemary flatbread, fresh dip, olive oil |
| `pizza-primavera.webp` | 1402×1122 | Primavera card | Tomato, mozzarella, basil |
| `pizza-veloce.webp` | 1402×1122 | Veloce card | Butternut, feta, onion, sunflower seeds |
| `pizza-sprint.webp` | 1402×1122 | Sprint card | Salami, caramelised onion, hot honey |
| `pizza-arcobaleno.webp` | 1402×1122 | Arcobaleno card | Salami, mushroom, feta, rocket |
| `pizza-rally.webp` | 1402×1122 | Rally card | Smoked chicken, mushroom, avocado |
| `pizza-bianca-pollo.webp` | 1402×1122 | Provisional Bianca Pollo card | White base, smoked chicken, mushroom, chives |
| `pizza-sole.webp` | 1402×1122 | Provisional Sole card | White base, yellow pepper, cherry tomato, mint |
| `feast-collage.webp` | 1402×1122 | Ratto Social Club feast card | Mixed pizza and dessert spread |
| `feast-landscape.webp` | 1402×1122 | Ingredient-story photograph | Full table spread with ingredients and desserts |
| `dessert-brownie.webp` | 1402×1122 | Gallery | Chocolate brownie, nuts, chocolate drizzle |
| `dessert-limone.webp` | 1402×1122 | Ratto Social Club sweet card | Lemon-shaped creamy desserts and mint |
| `venue-table.webp` | 1027×1531 | Remi pull-transition and Ratto Social Club table card | Pizza table, desserts, blue Vespa and dining context |

### July 2026 owner/Figma brand package

The second July handoff added one owner mural photograph, seven WhatsApp video clips and several Figma SVG exports. Originals remain in the owner's handoff locations; the repository stores web-ready derivatives and selected clean SVGs. The three supplied black pizza-slice SVG exports were byte-identical, so only one canonical copy is retained.

| Asset | Website role | Origin/status |
| --- | --- | --- |
| `public/images/owner-2026/remi-vespa-mural.webp` | Retained owner-art archive | WebP derivative of the owner-supplied 1600×1582 mural photograph; no longer rendered after the original red-Vespa Remi art was restored |
| `public/images/brand/pizza-ratto-wordmark.svg` | Fixed-header wordmark | Supplied Figma vector; replaces the live-type approximation |
| `public/images/brand/wordmark-banner.svg` | Counter-tapes masthead | Supplied wide Figma banner with its white background removed for transparent use |
| `public/images/brand/pizza-slice-outline.svg` | Retained supporting mark | Canonical copy of three byte-identical supplied Figma exports |
| `public/images/brand/red-pizza-slice.svg` | Pizza-menu header punctuation | Supplied inline SVG from the owner/Figma handoff |
| `public/images/brand/red-cup.svg` | Coffee-menu header punctuation | Supplied inline SVG from the owner/Figma handoff |
| `public/images/brand/chef-hat.webp` | Ingredient-section punctuation | WebP derivative of the embedded-image Figma SVG |
| `public/images/brand/red-ice-cream.svg` | Dolci-menu header punctuation | Supplied inline SVG from the owner/Figma correction handoff |
| `public/images/brand/figma-poster.webp` | Counter-tapes archive card | WebP derivative of the supplied landscape Figma poster composition |
| `public/images/owner-2026/backgammon-tournament.webp` | Counter-tapes archive card | WebP derivative of the owner-supplied poster; dates remain confined to the artwork pending confirmation |
| `public/videos/owner-2026/*.mp4` | Seven-card counter reel | Muted H.264 derivatives of the supplied WhatsApp clips, resized to 480px wide and moved to fast-start layout |
| `public/images/owner-2026/video-stills/*.webp` | Video poster and reduced-motion frames | WebP still extracted from each matching owner video |

Counter video filenames are `oven-close`, `oven-flames`, `pizza-pass`, `espresso-pull`, `sugar-doughnuts`, `box-lettering` and `counter-sweep`. Their visible captions describe only what is shown and do not add menu availability or pricing claims.

### Generated concept pizzas

These four 1254×1254 WebP assets were generated with the built-in image tool using the owner photography as a visual reference. They intentionally complete the twelve-card demo grid and are not evidence of real products or availability.

| Asset | Website role | Concept toppings |
| --- | --- | --- |
| `pizza-bosco.webp` | Provisional Bosco card | Tomato, mozzarella, mushroom, garlic, rosemary, rocket |
| `pizza-bandito.webp` | Provisional Bandito card | Spicy salami, red onion, roasted pepper, chilli, hot honey |
| `pizza-verde.webp` | Provisional Verde card | Pesto, mozzarella, courgette, artichoke, feta, rocket |
| `pizza-tramonto.webp` | Provisional Tramonto card | Tomato, mozzarella, peppers, onion, feta, cherry tomato, basil |

## Generated-asset history

### Hero logo and mascot

The flyer was too dense to use as one hero image. The logo and complete mascot/scooter were extracted into a clean landscape asset. The final requirement was to keep:

- the full “PIZZA RATTO” lettering;
- the complete rat and helmet;
- pizza slice;
- entire Vespa and both wheels;
- the same hand-drawn print style.

Surrounding menu text, checkerboards, pizza photography, phone number, and ordering copy were removed so live HTML could control the layout.

### Hero paper texture

A background-only raster was generated from the flyer paper aesthetic. Its prompt requested a warm dusty blush vintage paper with quiet fibres, mottling, light speckle, no focal point, and no text, mascot, food, checkerboard, or shapes.

### Handwritten `Hot` font data

`public/fonts/vara/satisfy.json` is a repository-local copy of the Satisfy single-line data shipped with Vara 1.4.0. It allows the static export to generate real letter strokes without a CDN request. The source package points to the Google Fonts Satisfy license record. Do not replace this file without updating both the dependency and this provenance note.

### Meet Remi artwork

The rat/Vespa drawing was edited for the character section and is now also reused in the pinned road sequence. The scooter is bright red, the helmet is white, and the pizza is pepperoni. CSS cropping and multiply blending preserve the complete illustration while removing the visual white rectangle against orange and pink fields. It intentionally retains a printed illustration character rather than photorealistic rendering.

## Image mapping

`pizzaPhotos` in `app/page.tsx` maps exact menu item names to images. The mapping is name-sensitive.

Currently mapped:

- Bianca & Dip
- Primavera
- Veloce
- Sprint
- Arcobaleno
- Bianca Pollo — provisional name and price
- Sole — provisional name and price
- Rally
- Bosco — generated concept, provisional name and price
- Bandito — generated concept, provisional name and price
- Verde — generated concept, provisional name and price
- Tramonto — generated concept, provisional name and price

There are no rendered pizza placeholders in the current menu. The fallback placeholder markup remains available for future items that lack owner photography.

If an item name changes in `data/menu.ts`, update the photo mapping in the same change.

## Alt text rules

- Describe the visible subject and meaningful toppings.
- Do not start with “image of” or “photo of.”
- Do not use marketing copy as alt text.
- Decorative CSS shapes and checkerboards should remain hidden from assistive technology.
- Intentional placeholders use `role="img"` with an accessible label.

Brand service icons are code-native interface marks in `components/BrandIcon.tsx`, not content imagery. They inherit the surrounding text color. The icon-only Instagram footer link must retain its explicit accessible label.

## Asset-path rules

GitHub Pages is hosted below `/pizza-ratto/`. JSX image paths must pass through the `asset()` helper. Do not reintroduce `next/image` unless the deployment architecture changes.

CSS public assets should use repository-safe relative paths. When a CSS background depends on the deployment prefix, pass an asset-prefixed custom property from JSX. The hero currently uses:

```tsx
style={{ "--hero-paper-image": `url("${asset("/images/hero-paper-texture.png")}")` }}
```

## Performance notes

The three largest assets are approximately:

- `og.png`: 2.9MB
- `hero-logo-mascot.png`: 2.6MB
- `hero-paper-texture.png`: 2.0MB

These are candidates for future WebP/AVIF or optimized PNG work. Do not degrade line-art edges, paper texture, or social-card legibility when compressing them.
