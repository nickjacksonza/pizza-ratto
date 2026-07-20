# Development

## Prerequisites

- Node.js 22.13 or newer
- npm
- Git
- GitHub CLI only for Pages deployment operations

## Install

```bash
npm install
```

Use the existing npm lockfile. Do not switch package managers without a deliberate migration.

## Local development

```bash
npm run dev
```

vinext and the Cloudflare Vite plugin start the local development surface. The config uses polling when `CODEX_SANDBOX=seatbelt` because macOS sandboxing blocks FSEvents.

If the development server reports that port 3000 is occupied, use the exact alternate URL it prints. Do not scan or kill unrelated processes unless the user asks.

## Core validation

```bash
npm run build
npm run lint
npm run typecheck
```

Use `npm test` when page structure, content data, metadata, links, or rendering changes.

Use `npm run build:pages` when deployment paths, images, fonts, configuration, or GitHub workflows change.

## Common editing workflows

### Change business details

1. Edit `data/business.ts`.
2. Check JSON-LD in `app/page.tsx` for address/hours duplication.
3. Check metadata in `app/layout.tsx`.
4. Update `docs/content-and-assets.md` and `docs/content-todo.md`.
5. Run build, tests, lint, and typecheck.

### Change menu items or prices

1. Edit `data/menu.ts`.
2. If an item name changes, update `pizzaPhotos` in `app/page.tsx`.
3. Check labels and wrapping at desktop and phone widths.
4. Update content documentation if the change resolves a pending confirmation.
5. Run `npm test`.

### Add a pizza image

1. Add the optimized asset to `public/images/`.
2. Add its mapping and alt text in `pizzaPhotos`.
3. Add it to the asset table in `docs/content-and-assets.md`.
4. Confirm that the new photograph replaces only the intended item and that every menu card still has a valid image mapping.
5. Run both normal and Pages builds.

### Change styling

1. Edit `app/globals.css`.
2. Preserve the token system and breakpoint hierarchy.
3. Check hero crops, phone overflow, checkerboard width, footnote position, section height, pizza readability, and sticky bar clearance.
4. Respect reduced motion and focus styles.
5. Run build, lint, and typecheck.

### Add interactivity

Keep new client components isolated. The default page is a server component. Add `"use client"` only to the smallest component that needs browser state.

Before adding any server-dependent behavior, decide whether GitHub Pages remains a required target. Static Pages cannot support server actions, API routes, request headers, cookies, or dynamic authentication.

### Change scroll scenes

1. Read `docs/motion-system.md` completely.
2. Keep `ScrollChoreography.tsx` as the single motion coordinator.
3. Preserve readable base CSS without `.motion-ready`.
4. Use `data-scene` and `data-transition` for section-level behavior.
5. Give every enhanced scene a direct-child `.scene-curtain`; keep it hidden in base and reduced-motion CSS.
6. Check forward and reverse curtain clearance, menu grid reading order, mobile natural flow, reduced motion, and horizontal overflow.
7. Run the full normal and Pages validation matrix.

## Asset handling

- Keep project assets under `public/images/`.
- Prefer WebP for photographs.
- Use PNG when transparency or crisp illustrated edges require it.
- Preserve originals outside destructive workflows.
- Record generated-image prompts and roles in `docs/content-and-assets.md`.

## CSS conventions

- Prefer semantic class names tied to the poster composition.
- Reuse root tokens rather than scattering new hex colours.
- Use `clamp()` for responsive typography and spacing where appropriate.
- Keep media queries ordered from widest to narrowest: 1000, 760, 520, 390.
- Do not move phone-only overrides above tablet overrides.
- Keep decorative elements out of the DOM when CSS can express them.

## Environment variables

The normal local build needs no application environment variables.

The Pages build sets:

```text
GITHUB_PAGES=true
NEXT_PUBLIC_BASE_PATH=/pizza-ratto
NEXT_PUBLIC_SITE_URL=https://zmaqutu.github.io/pizza-ratto
```

Do not store secrets in `NEXT_PUBLIC_*` variables. They are embedded in client output.

## Optional database and auth surfaces

Database and ChatGPT authentication files are starter capabilities, not product features. If activated:

- document the user-facing requirement;
- update `.openai/hosting.json` for D1/R2 as needed;
- add migrations and tests;
- acknowledge that GitHub Pages will no longer host those server features.
