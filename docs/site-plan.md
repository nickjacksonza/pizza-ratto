# Pizza Ratto site plan

## Release one

A focused, mobile-first homepage with announcement, accessible navigation, asymmetric hero, manifesto, structured HTML menu, ingredient story, Remi/Big Bertha story, editorial gallery, visit/order section, footer and mobile ordering bar.

## Technical decisions

- Next.js-compatible vinext starter, TypeScript, App Router and Tailwind available.
- Server-rendered page; client JavaScript is limited to the mobile menu.
- Menu and business facts live in typed central data files.
- Supplied imagery is copied unchanged into `public/images`; originals remain untouched.
- No backend, database, CMS, cart or external UI/animation framework.
- A future `/menu` route can reuse `data/menu.ts`.

## Conversion path

Menu and WhatsApp are primary. Phone is always available on mobile. Uber Eats and directions are intentionally withheld until real URLs are supplied.
