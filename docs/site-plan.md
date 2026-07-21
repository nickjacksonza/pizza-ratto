# Pizza Ratto site plan and implemented scope

This began as the release-one plan and now describes the shipped homepage.

## Product goal

Create a focused, mobile-first storefront that turns the Pizza Ratto flyer aesthetic into a usable website. The visitor should be able to understand the personality, inspect the menu and reach an ordering channel without navigating through multiple pages.

## Implemented homepage

- Announcement strip and accessible navigation
- Flyer-derived hero with separated logo/mascot artwork, live copy and integrated order CTA
- Full-viewport checkerboard framing and poster footnote
- Short manifesto and house rules
- Structured HTML Pizza, Caffè, Bevande and Dolci menu
- Enhanced owner-supplied pizza photography for every current menu card
- Ingredient story
- Meet Remi and Big Bertha section
- Editorial interior/food gallery
- Visit, WhatsApp, Uber Eats, telephone and Instagram actions
- Mobile sticky order bar

## Technical shape

- React + TypeScript through the Next-compatible vinext App Router
- Mostly server-rendered/static markup; client JavaScript is limited to the mobile menu and one coordinated motion component
- Business facts and menu items in typed central data files
- No backend, database, CMS or cart; GSAP and Vara are used only for the authored scroll choreography
- Native image markup for compatibility with the GitHub Pages static target
- A dual-build strategy for OpenAI Sites/Cloudflare and GitHub Pages

See [`architecture.md`](architecture.md) for implementation boundaries and [`deployment.md`](deployment.md) for the two hosting paths.

## Conversion hierarchy

1. WhatsApp is the primary direct action.
2. Menu browsing supports the decision.
3. Telephone and Uber Eats are secondary ordering routes.
4. Instagram is a social proof/discovery route.

Directions are intentionally absent until the owner supplies an official destination URL.

## Explicit non-goals for the current release

- On-site checkout or payment
- User accounts
- Inventory or live menu availability
- CMS editing
- Table booking
- Delivery radius calculation
- Heavy animation or app-like navigation

A future `/menu` route can reuse `data/menu.ts`, but it should only be introduced when the homepage menu becomes materially difficult to use or maintain.
