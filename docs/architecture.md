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

`app/page.tsx` is statically rendered. Client behavior is isolated to the open/closed mobile navigation and the motion system in `ScrollChoreography.tsx`. That component dynamically loads GSAP 3.13, ScrollSmoother, ScrollTrigger, ScrollToPlugin, Observer, SplitText, DrawSVG and MorphSVG. ScrollSmoother owns the native-scroll-backed page wrapper; ScrollTrigger coordinates the pinned road scene, palette-curtain entrances, large-screen locked narrative chapters, menu-row and independently timed coffee/dolci entrances, supplied-mark morphs, parallax, Remi fragment dispersal and social-card assembly; ScrollToPlugin powers short in-page navigation; and Observer makes the fixed header respond to scroll direction. The fragment effect uses only the browser canvas API: it downsamples the local Remi image, creates 42 sparse layers at the large-desktop breakpoint and removes them on cleanup. Long-distance anchor navigation uses a fixed palette cover outside the transformed wrapper, updates ScrollSmoother while fully covered, and reveals the destination without visibly scrubbing every intermediate pin. Vara generates the actual `Hot` and social-club `Ratto` handwriting strokes from one preloaded local font-data file; no runtime CDN or third-party API is required. Core GSAP setup does not wait for Vara, so panels, parallax and the Remi timeline become ready independently while the handwriting paths initialize. `gsap.matchMedia()` owns both menu column awareness and the lock/no-lock breakpoint: narrative pins exist only at `min-width: 1001px` and `min-height: 720px`, while smaller/shorter layouts keep semantic natural flow. The same responsive context owns the precise-pointer Instagram follower cleanup. `BrandIcon.tsx` renders server-safe WhatsApp and Instagram marks and introduces no runtime state. See `docs/motion-system.md` before changing this runtime.

The fixed announcement/header chrome, covered-navigation route card, and mobile order bar live outside `#smooth-wrapper`; `main` and `footer` live inside `#smooth-content`. This is required because fixed UI must not inherit the transform ScrollSmoother applies to the content layer. The Remi stage and eligible narrative chapters use ScrollTrigger pinning while motion is active instead of CSS sticky positioning. Pin targets remain transform-stable; their descendants carry all choreography.

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
6. Full-viewport `01 / WHAT WE’RE ABOUT` paper scene
7. Full-viewport `02 / THE IMPORTANT BIT` iris scene
8. Natural-flow pizza grid with alternating lateral row entrances, followed by a full-view coffee/dolci board
9. Desktop-locked `FROM THE COUNTER` owner-media strip that stays static before an exact-red gooey exit covers the view; natural swipeable flow on smaller and reduced-motion layouts
10. Full-viewport `03 / BUILT DIFFERENT` split ingredient scene
11. Full-viewport Meet Remi poster using the generated red-Vespa cutout, with a large-desktop canvas disintegration and static fallback
12. Full-view `04 / RATTO SOCIAL CLUB` overlapping venue and food deck with scroll-drawn `Ratto` lettering
13. Full-viewport `05 / FIND THE FIRE` visit and order shutter
14. Footer
15. Mobile fixed ordering bar
16. Restaurant JSON-LD

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

The hero CSS texture uses a relative URL because it must work both at the root and beneath `/pizza-ratto/`. Owner video derivatives and their reduced-motion poster frames live under `public/videos/owner-2026/` and `public/images/owner-2026/video-stills/`; all of their JSX URLs also pass through `asset()`.

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
