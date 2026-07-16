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
| `public/images/hero-paper-texture.png` | 1698×926 | Full hero background | Generated background-only paper texture derived from the hero visual |
| `public/images/ratto-vespa-red.png` | 1096×1435 | Meet Remi artwork | Generated edit: red scooter, white helmet, pepperoni pizza |
| `public/images/pizza-ratto-logo-art.png` | 1283×1279 | Icon/logo art | Transparent PNG |
| `public/images/interior.webp` | 291×510 | Venue gallery | Supplied photo |
| `public/images/menu-pizza.webp` | 376×510 | Original pizza menu board | Supplied photo |
| `public/images/menu-coffee.webp` | 381×510 | Reference menu board | Supplied photo, currently not rendered |
| `public/images/menu-dolci.webp` | 377×510 | Reference menu board | Supplied photo, currently not rendered |
| `public/images/pizza-bianca.webp` | 528×510 | Bianca/menu and ingredient story | Supplied photo |
| `public/images/pizza-primavera.webp` | 455×510 | Primavera menu item | Supplied photo |
| `public/images/pizza-arcobaleno.webp` | 469×510 | Arcobaleno menu and gallery | Supplied photo |
| `public/images/pizza-rally.webp` | 481×510 | Rally menu and gallery | Supplied photo |

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

### Meet Remi artwork

The rat/Vespa drawing was edited for the character section. The scooter is bright red, the helmet is white, and the pizza is pepperoni. It intentionally retains a printed illustration character rather than photorealistic rendering.

## Image mapping

`pizzaPhotos` in `app/page.tsx` maps exact menu item names to images. The mapping is name-sensitive.

Currently mapped:

- Bianca & Dip
- Primavera
- Arcobaleno
- Rally

Currently placeholders:

- Veloce
- Sprint

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

CSS public assets should use repository-safe relative paths. The hero texture currently uses:

```css
background-image: url("../images/hero-paper-texture.png");
```

## Performance notes

The three largest assets are approximately:

- `og.png`: 2.9MB
- `hero-logo-mascot.png`: 2.6MB
- `hero-paper-texture.png`: 2.0MB

These are candidates for future WebP/AVIF or optimized PNG work. Do not degrade line-art edges, paper texture, or social-card legibility when compressing them.
