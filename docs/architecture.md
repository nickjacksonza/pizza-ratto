# Architecture

## Overview

Pizza Ratto is intentionally a small, static-first web application. It uses a Next.js-compatible App Router API through vinext, but the product itself is a single server-rendered page with two small client components.

The current architecture favors:

- static output;
- centralized content;
- focused client JavaScript for navigation and authored motion;
- no backend dependency;
- dual build compatibility for GitHub Pages and OpenAI Sites.

## Runtime shape

```text
app/layout.tsx
  └── app/page.tsx
        ├── data/business.ts
        ├── data/menu.ts
        ├── components/MobileNavigation.tsx (client component)
        ├── components/ScrollChoreography.tsx (client component)
        └── components/BrandIcon.tsx (presentational service icons)
```

`app/page.tsx` is statically rendered. Client behavior is isolated to the open/closed mobile navigation and the motion system in `ScrollChoreography.tsx`. That component dynamically loads GSAP 3.13, ScrollSmoother, ScrollTrigger, ScrollToPlugin, Observer, SplitText and DrawSVG. ScrollSmoother owns the native-scroll-backed page wrapper; ScrollTrigger coordinates the pinned road scene, headline entrances, full off-canvas panel translations, parallax and gallery stacking; ScrollToPlugin powers in-page navigation; and Observer makes the fixed header respond to scroll direction. Vara generates the actual `Hot` handwriting strokes from a preloaded local font-data file; no runtime CDN or third-party API is required. Core GSAP setup does not wait for Vara, so panels, parallax and the Remi timeline become ready independently while the handwriting paths initialize. `BrandIcon.tsx` renders server-safe WhatsApp and Instagram marks and introduces no runtime state.

The fixed announcement/header chrome and mobile order bar live outside `#smooth-wrapper`; `main` and `footer` live inside `#smooth-content`. This is required because fixed UI must not inherit the transform ScrollSmoother applies to the content layer. Likewise, the Remi stage uses ScrollTrigger pinning while motion is active instead of CSS sticky positioning.

## Rendering model

The homepage declares:

```ts
export const dynamic = "force-static";
```

This is required for GitHub Pages. Any future feature that reads request headers, cookies, dynamic route state, a database, or server-only secrets would invalidate the static export and must be evaluated against the deployment strategy first.

The footer year uses `new Date().getFullYear()` during the build. On GitHub Pages, it changes only when the site is rebuilt.

## Data flow

### Business data

`data/business.ts` owns:

- display and international phone formats;
- address;
- opening hours;
- Instagram URL and handle;
- Uber Eats URL;
- prefilled WhatsApp ordering URL;
- collection-only note;
- core tagline.

Components should consume this object instead of duplicating values.

### Menu data

`data/menu.ts` defines typed menu categories and items. Prices can be a single number or a labelled list, allowing espresso single/double pricing without special-case markup.

The `zar()` helper provides the `R` prefix. Pizza-photo availability is deliberately separate from menu content and is mapped by item name in `app/page.tsx`.

## Page sections

The page is composed in this order:

1. Skip link and announcement bar
2. Header and navigation
3. Full-height split hero poster with ordering details
4. Pinned `Hot / PIZZA` road scene where scroll-driven Remi tows a red editorial scene in from the left
5. Moving brand ticker
6. `01 / WHAT WE’RE ABOUT` manifesto
7. `02 / THE IMPORTANT BIT` floating-photo menu portal and full menu
8. `03 / BUILT DIFFERENT` split ingredient story
9. Remi and Big Bertha character section
10. `04 / INSIDE` overlapping venue and food collage
11. `05 / FIND THE FIRE` visit and order section
12. Footer
13. Mobile fixed ordering bar
14. Restaurant JSON-LD

## Metadata and discovery

`app/layout.tsx` provides:

- page title and description;
- icon paths;
- Open Graph metadata;
- X/Twitter card metadata;
- environment-aware site URL and asset prefix.

`app/robots.ts` permits crawling.

`app/page.tsx` embeds `Restaurant` JSON-LD with telephone, address, cuisine, hours, and Instagram.

## Styling architecture

All visual behavior lives in `app/globals.css`. Tailwind is imported but no utility-first component architecture is in use. This is intentional: the poster composition relies on named, section-specific classes, CSS custom properties, and tightly coordinated media queries.

Breakpoints:

- `1000px`: compact desktop/tablet grid changes
- `760px`: primary single-column responsive transition
- `520px`: phone layout, sticky ordering bar, smaller typography
- `390px`: narrow-phone refinements

## Images

Native `<img>` elements are intentional. The previous `next/image` implementation produced `/_vinext/image` URLs, which GitHub Pages cannot serve. Public URLs are prefixed with the environment-aware `asset()` helper.

The hero CSS texture uses a relative URL because it must work both at the root and beneath `/pizza-ratto/`.

## Build targets

### Normal vinext build

`npm run build` creates the Worker-compatible vinext output. This remains useful for OpenAI Sites and local validation.

### GitHub Pages export

`npm run build:pages` sets the static-export environment, builds into `dist/client`, prefixes repository assets, rewrites vinext-generated font URLs, and writes `.nojekyll`.

See `docs/deployment.md` for details.

## Dormant starter capabilities

The repository still contains optional starter infrastructure:

- `app/chatgpt-auth.ts`
- `db/`
- `drizzle/`
- `examples/d1/`
- `worker/index.ts`
- the Cloudflare plugin in `vite.config.ts`

None of these are currently used by the restaurant page. Do not remove them casually because the OpenAI Sites build still depends on the Worker structure. Do not activate them without revisiting GitHub Pages compatibility.
