# Pizza Ratto website

Static site for [Pizza Ratto](https://pizzaratto.com), Salt River, Cape Town. See `CLAUDE.md` for build steps.

- `src/` page templates, partials, data. `js/`, `images/`, `fonts/`, `videos/` are copied to `docs/`. `css/` is minified and inlined into each page.
- `docs/` is the built site (committed).
- `site-references/for-sale/menu.json`, `deli.json` and `merchandise.json` are the single source for menu items and prices. `build.py` reads them directly; there are no copies in `src/data/`.
- `site-references/` also holds other owner files (logo, fonts, posters). `Pizza Ratto Website Update.zip` is the Claude Design handoff.

## Deploy

`.github/workflows/pages.yml` builds the site (`python3 build.py`, then `python3 tools/check.py`) and deploys `docs/` to GitHub Pages on every push to `main`. Merging a PR, or editing `site-references/for-sale/menu.json` on `main`, goes live within a minute or two. Prices are always read from `site-references/for-sale/`; the check step fails if a price is missing from the built page.
