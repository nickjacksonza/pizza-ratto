# Roadmap and known follow-up work

The current homepage is a strong demo and a usable static storefront. The next work should improve truthfulness, media quality and operational confidence before adding features.

## Priority 1 — Owner verification

- Resolve every open item in [`content-todo.md`](content-todo.md).
- Confirm menu prices and availability immediately before a public campaign.
- Choose the canonical production domain and make metadata consistent with it.
- Obtain explicit image-use approval and credits where required.

## Priority 2 — Complete and optimize imagery

- Confirm, replace or remove all six provisional specials: Bianca Pollo, Sole, Bosco, Bandito, Verde and Tramonto.
- Retain the owner-supplied originals if cleaner unbranded exports become available later.
- Compress the multi-megabyte hero PNGs, testing AVIF/WebP where transparency permits.
- Preserve source artwork outside destructive optimization steps.

## Priority 3 — Production QA

- Run the full validation matrix in [`testing.md`](testing.md).
- Check current Safari, Chrome and Firefox on desktop and mobile.
- Test narrow phones, laptop-height screens and high zoom.
- Confirm all call, WhatsApp, Uber Eats and Instagram links on real devices.
- Check the deployed Pages subpath for missing fonts or images after every build-tool upgrade.

## Priority 4 — Findability and measurement

- Add an owner-approved official directions link.
- Add a sitemap if/when more routes exist and confirm the canonical URL first.
- Consider privacy-conscious analytics only after the owner chooses a provider and policy.
- Review local-business structured data against confirmed facts.

## Conditional enhancements

Only pursue these when a real operational need appears:

- A dedicated `/menu` route for sharing or improved scanning
- A small content editing workflow or CMS
- Live availability/sold-out states
- First-party ordering and payment
- Events, specials or rotating menu content
- A custom domain

Each would change the present static, low-maintenance architecture and should get its own decision entry.

## Known maintenance risks

- The build stack uses a young vinext release; upgrades can affect static rendering and asset paths.
- GitHub Pages is hosted below `/pizza-ratto/`, so root-relative asset regressions are easy to introduce.
- Hero source files are large and may affect slower mobile connections.
- Brand story details are intentionally sparse because owner approval is outstanding.
- The repository still carries optional starter database/auth infrastructure that the homepage does not use. Remove it only after confirming the Sites target will not need it.
