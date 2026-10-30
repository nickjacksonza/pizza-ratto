# Pizza Ratto website

Static site for [Pizza Ratto](https://pizzaratto.com), Salt River, Cape Town. See `CLAUDE.md` for build steps.

- `src/` page templates, partials, data. `js/`, `images/`, `fonts/`, `videos/` are copied to `docs/`. `css/` is minified and inlined into each page.
- `docs/` is the built site (committed).
- `site-references/for-sale/menu.json`, `deli.json` and `merchandise.json` are the single source for menu items and prices. `build.py` reads them directly; there are no copies in `src/data/`.
- `site-references/` also holds other owner files (logo, fonts, posters). `Pizza Ratto Website Update.zip` is the Claude Design handoff.

## Deploy

GitHub Pages serves the site from branch `main`, folder `/docs`, on the custom domain pizzaratto.com (same as wellness-by-physiatry). `build.py` writes `docs/CNAME` from `src/data/site.json`.

- `docs/` must stay committed and current. After changing source, run `python3 build.py` and `python3 tools/check.py`, then commit `docs/` too.
- `.github/workflows/rebuild-docs.yml` rebuilds `docs/` when source files change on `main`, so edits made on GitHub (such as `site-references/for-sale/menu.json`) still reach the live site. The check step fails if a price is missing from the built page, and then nothing is pushed.
- Merging to `main` is a live deploy.
