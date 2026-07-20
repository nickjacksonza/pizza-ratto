# AGENTS.md

This file is the primary operating guide for agents working on Pizza Ratto. Read it before making changes, then follow the linked documents in `docs/` for the relevant area.

## Project purpose

Pizza Ratto is a one-page, mobile-first restaurant website for an independent wood-fired pizza shop in Salt River, Cape Town. The site should feel like the restaurant's printed flyer: warm, handmade, irreverent, slightly rough, and highly legible.

The production GitHub Pages site is:

- `https://zmaqutu.github.io/pizza-ratto/`
- Repository: `https://github.com/zmaqutu/pizza-ratto`

An OpenAI Sites project also exists, but it is not the default deployment target. Do not deploy to OpenAI Sites or GitHub Pages unless the user explicitly asks for a deployment.

## Read these next

- `docs/README.md` — documentation map and current status
- `docs/architecture.md` — application structure and runtime model
- `docs/design-system.md` — visual language, layout rules, and responsive decisions
- `docs/motion-system.md` — GSAP scene architecture, transition inventory, responsive fallbacks, and editing guardrails
- `docs/content-and-assets.md` — content sources, asset provenance, and image mapping
- `docs/development.md` — local workflows and editing guidance
- `docs/deployment.md` — GitHub Pages and OpenAI Sites strategies
- `docs/testing.md` — validation expectations
- `docs/decisions.md` — why the current implementation looks and behaves this way
- `docs/roadmap.md` — known gaps and recommended next work

## Non-negotiable project rules

1. Preserve the flyer-derived aesthetic. Do not turn this into a generic restaurant template.
2. Keep the page static-export compatible. GitHub Pages cannot run server handlers, API routes, middleware, dynamic authentication, D1, R2, or image-optimization endpoints.
3. Keep business details and menu data centralized in `data/business.ts` and `data/menu.ts`.
4. Use semantic HTML and preserve keyboard, focus, reduced-motion, and touch-target behavior.
5. Do not invent business facts. Read `docs/content-todo.md` before changing menu claims, halal wording, opening hours, people, suppliers, or delivery information.
6. Do not deploy unless the user explicitly asks. A request to edit is not permission to publish.
7. Do not replace supplied or generated brand assets without documenting the new source and updating `docs/content-and-assets.md`.
8. Preserve unrelated user changes. Inspect `git status` and the diff before staging or committing.

## Source-of-truth map

| Concern | Source |
| --- | --- |
| Page structure and copy composition | `app/page.tsx` |
| Global styling and responsive rules | `app/globals.css` |
| Metadata, fonts, social cards | `app/layout.tsx` |
| Mobile navigation state | `components/MobileNavigation.tsx` |
| Business facts and outbound URLs | `data/business.ts` |
| Menu names, descriptions, and prices | `data/menu.ts` |
| GitHub Pages export config | `next.config.ts`, `vite.config.ts` |
| GitHub Pages artifact cleanup | `scripts/prepare-pages.mjs` |
| GitHub Pages CI/CD | `.github/workflows/deploy-pages.yml` |
| OpenAI Sites project binding | `.openai/hosting.json` |
| Rendered output tests | `tests/rendered-html.test.mjs` |

## Technology snapshot

- Node.js `>=22.13.0`
- React 19
- Next.js-compatible App Router surface through vinext
- vinext 0.0.50 and Vite 8
- TypeScript
- Tailwind CSS is installed and imported, but the site is primarily custom CSS
- Cloudflare Vite plugin remains available for OpenAI Sites/Worker builds
- GitHub Actions + GitHub Pages for the current public deployment
- No active database, CMS, cart, analytics, or authentication
- Client JavaScript is intentionally limited to the mobile navigation component

## Commands

```bash
npm install
npm run dev
npm run build
npm run build:pages
npm run deploy:pages
npm test
npm run lint
npm run typecheck
```

Important distinctions:

- `npm run build` validates the normal vinext/Worker-compatible build.
- `npm run build:pages` performs the static GitHub Pages export into `dist/client` and rewrites vinext font paths.
- `npm run deploy:pages` triggers the existing GitHub Actions workflow through authenticated `gh`. It does not commit or push local changes.

## Required validation

For styling or content changes, run:

```bash
npm run build
npm run lint
npm run typecheck
```

For changes that may affect rendering or data contracts, also run:

```bash
npm test
```

For GitHub Pages changes, additionally run:

```bash
npm run build:pages
```

Then verify:

- `dist/client/index.html` exists.
- `dist/client/.nojekyll` exists.
- asset and image URLs use `/pizza-ratto/`.
- no `/_vinext/image` URLs are present.
- generated font URLs do not point to unprefixed `/assets/_vinext_fonts/`.

## Static-export constraints

The homepage exports `dynamic = "force-static"`. Keep it that way while GitHub Pages is supported.

Public images use native `<img>` elements rather than `next/image`. This is deliberate: GitHub Pages cannot serve vinext's `/_vinext/image` optimizer. All public asset paths must pass through the `asset()` helper in `app/page.tsx` or use repository-safe relative CSS paths.

GitHub Pages uses:

- `GITHUB_PAGES=true`
- `NEXT_PUBLIC_BASE_PATH=/pizza-ratto`
- `NEXT_PUBLIC_SITE_URL=https://zmaqutu.github.io/pizza-ratto`

If the repository name changes, update all three of these places:

- `package.json`
- `next.config.ts` and `vite.config.ts`
- deployment and metadata documentation

## Design guardrails

- Palette tokens live in `:root` in `app/globals.css`.
- Display type is Anton; body type is Space Grotesk.
- Checkerboards must span the full viewport width.
- The hero uses separate logo/mascot artwork, live HTML copy, and live CTA details over a generated paper texture.
- The hero CTA must share the hero background and read as part of the poster, not as a floating card.
- The hero footnote belongs above the lower checkerboard, never inside it.
- Section labels use the numbered format `01 / ...` through `05 / ...` and must remain legible.
- Slight rotations, dashed rules, rough borders, stickers, and circular pizza crops are intentional.
- Avoid excessive section height. Current spacing was deliberately reduced after review.
- On mobile, keep touch targets at least 44px; the sticky order bar uses 64px targets and safe-area padding.

## Content guardrails

- Current ordering priority: WhatsApp first, then phone, then Uber Eats.
- Collection-only wording is intentional.
- The safe halal wording is: “Our meat toppings are halal and sourced from Mubarak Food Emporium.” Do not claim the restaurant itself is halal certified.
- The pizza grid intentionally contains twelve cards: eight use enhanced owner photography and four use generated concept photography. Bianca Pollo, Sole, Bosco, Bandito, Verde and Tramonto have provisional demo names or prices; do not remove their confirmation notes until the owner approves them.
- Do not infer menu availability or new prices from generic pizza imagery.

## Deployment rules

### GitHub Pages

The public site deploys from `main` via `.github/workflows/deploy-pages.yml`. Pushes to `main` deploy automatically. `npm run deploy:pages` can manually retrigger the workflow.

### OpenAI Sites

The Sites project ID is stored in `.openai/hosting.json`. Use the Sites workflow only when the user explicitly asks for a Sites deployment. Do not overwrite the GitHub Pages strategy when doing so.

## When changing the hero

Check all of the following together:

- the full “PIZZA RATTO” lettering is visible;
- the rat's helmet, pizza slice, full scooter, and wheels are not cropped;
- the paper texture covers the entire hero;
- the phone number stays inside the CTA region;
- the CTA is separated by a simple divider rather than a floating-card shadow;
- both checkerboards span the full width;
- the footnote stays above the lower checkerboard;
- mobile order actions remain unobstructed.

## When changing the menu

Update `data/menu.ts` first. Only edit layout code if the content shape changes. If adding a pizza photograph, add it to `public/images`, map it in `pizzaPhotos` in `app/page.tsx`, and add its provenance and alt text to `docs/content-and-assets.md`.

## Documentation maintenance

Documentation is part of the deliverable. Update the relevant files in `docs/` whenever you change:

- the visual system or breakpoints;
- asset generation or provenance;
- data structures or content ownership;
- build or deployment behavior;
- public URLs;
- validation commands;
- known limitations or roadmap priorities.
