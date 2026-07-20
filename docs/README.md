# Pizza Ratto documentation

This folder explains the current product, its design logic, implementation, and operating workflows. `AGENTS.md` is the entry point for agents; this index is the broader project map.

## Current status

- One-page restaurant website implemented and responsive.
- Scroll-led editorial redesign implemented with GSAP timelines, true handwritten stroke drawing, split-letter entrances, a pinned Remi/Vespa sequence, directional scene wipes, and an overlapping venue collage.
- Publicly deployed to GitHub Pages at `https://zmaqutu.github.io/pizza-ratto/`.
- OpenAI Sites project retained as an optional second deployment target.
- Menu, business details, structured metadata, mobile navigation, motion fallbacks, and ordering links are implemented.
- The menu uses a deliberate twelve-card grid: eight enhanced owner photographs and four generated concept photographs. Six specials remain provisional pending owner approval.
- No database, CMS, cart, analytics, user accounts, or custom domain.

## Documentation map

| Document | Purpose |
| --- | --- |
| `architecture.md` | Application shape, routing, data flow, rendering, and optional starter surfaces |
| `design-system.md` | Brand translation, tokens, typography, layout, responsive behavior, and accessibility |
| `content-and-assets.md` | Business content, menu ownership, image inventory, generation history, and alt-text rules |
| `development.md` | Local setup, commands, common editing workflows, and static-export caveats |
| `deployment.md` | GitHub Pages and OpenAI Sites deployment strategies and troubleshooting |
| `testing.md` | Build, lint, type, render, Pages artifact, and manual QA expectations |
| `decisions.md` | Chronological design and technical decisions with rationale |
| `roadmap.md` | Known limitations and prioritized next work |
| `brand-profile.md` | Brand positioning, tone, and visual character |
| `content-todo.md` | Facts and permissions that still require owner confirmation |
| `site-plan.md` | Product goals and current information architecture |

## Canonical public locations

- GitHub repository: `https://github.com/zmaqutu/pizza-ratto`
- GitHub Pages: `https://zmaqutu.github.io/pizza-ratto/`
- Uber Eats: `https://www.ubereats.com/za/store/pizza-ratto/c2X95IU_SWaBTX_qeHpCng`
- Instagram: `https://www.instagram.com/pizza_ratto/`

## Maintenance expectation

When behavior changes, update code and documentation together. In particular, deployment, asset, menu, breakpoint, and content changes should never land without corresponding documentation updates.
