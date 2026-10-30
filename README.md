# Pizza Ratto website

Static site for [Pizza Ratto](https://pizzaratto.com), Salt River, Cape Town. See `CLAUDE.md` for build steps.

- `src/` page templates, partials, data. `js/`, `images/`, `fonts/`, `videos/` are copied to `docs/`. `css/` is minified and inlined into each page.
- `docs/` is the built site (committed).
- `site-references/for-sale/menu.json`, `deli.json` and `merchandise.json` are the single source for menu items and prices. `build.py` reads them directly; there are no copies in `src/data/`.
- `site-references/` also holds other owner files (logo, fonts, posters). `Pizza Ratto Website Update.zip` is the Claude Design handoff.
