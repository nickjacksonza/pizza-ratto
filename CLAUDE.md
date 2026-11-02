# Pizza Ratto

Static site for a wood-fired pizza shop in Salt River, Cape Town. Custom Python generator, no npm.
Modelled on `wellness-by-physiatry` (same `src/` + `docs/` layout, same head/schema approach).

## Build

    python3 build.py                       # renders src/ -> docs/ (standard library only)
    python3 tools/check.py                 # post-build checks: JSON-LD, one h1, img sizes, links
    cd docs && python3 -m http.server 3056 # preview

Assets come from the design handoff zip. Pillow and fonttools are not on the host, so run the asset tool in Docker:

    docker run --rm -v "$PWD":/app -w /app python:3.12-slim sh -c \
      'pip install -q pillow fonttools brotli && python tools/optimize_images.py'

## Deploy

Served by GitHub Pages "Deploy from a branch": `main`, folder `/docs`, custom domain `pizzaratto.com`, Enforce HTTPS. Same setup as `wellness-by-physiatry`.
`build.py` writes `docs/CNAME` from the domain in `src/data/site.json`.
**Merging to `main` is a live deploy.** Only Nick merges.

- `docs/` must stay committed and current. Run `python3 build.py` and `python3 tools/check.py`, then commit `docs/` with the source change.
- `.github/workflows/rebuild-docs.yml` covers edits made on GitHub (for example Nick editing `site-references/for-sale/menu.json`). On a push to `main` that touches source paths it runs `build.py` and `tools/check.py`, and if `docs/` changed it commits "Rebuild docs" as github-actions[bot] and requests a Pages build. If `check.py` fails, nothing is pushed.
- GitHub does not start a Pages build for commits pushed with `GITHUB_TOKEN`, so the workflow's last step calls the Pages build API.
- `tools/check.py` fails if any available item's price text is missing from the built page. Prices always come from `site-references/for-sale/`.

## Rules

- `docs/` is generated **and** git-tracked (for the dev preview and review diffs). Rebuild and commit it with every `src/`, `css/`, `js/` or `site-references/` change: the live site is whatever is committed in `docs/`.
- Business details live in `src/data/site.json` (domain, phone, address, hours, links, nav, side cards, `tapes` reel,
  `side_tapes` under the drinks cards, `google_site_verification`).
- `site-references/for-sale/menu.json`, `deli.json`, `merchandise.json` are the **single source** for items and prices.
  `build.py` reads them directly. Don't make copies in `src/data/`.
  Read the JSON; don't invent field names. Skip `available: false`. Price text: `price`, else `price_label`.
- The home page footer omits the Ubi/Quando/Voca columns (the Visit section already shows them). Other pages keep them (`footer_contact` in `build.py`).
- Pizza cards use `images/pizza/<id>.webp` only when that exact file exists; otherwise the "photo coming hot"
  tile shows and `build.py` lists the gap. Never put another pizza's photo on an item.
- Each page's JSON-LD is generated in `build.py` (`graph()`): `Restaurant` + `WebSite` + `WebPage` linked by `@id`,
  plus a `Menu` on the home page and an `ItemList` of `Product`s on deli and merchandise. The `Menu` holds the pizzas only (the `pizza` / `pizzas` group; no drinks, desserts or extra toppings), and `Restaurant.priceRange` is computed from those pizza prices (min–max, e.g. `R85–R195`). The visible menu is unchanged. Change data, not the schema.
- `google_site_verification` in `site.json` renders the Search Console `<meta>` in every page head, only when set.
- `ga4_id` in `site.json` is `G-LSQ5R505H6`. The consent defaults, gtag loader, cookie banner and footer "Cookie settings" button render only when it is set. `gtag.js` loads on first interaction (or 8 s after load).
- `build.py` minifies CSS and `js/scripts.js` (`tools/minify.py`) and writes `sitemap.xml` with `lastmod` from each page's last git commit. Edit `css/` and `js/`, never `docs/`.
- Card and hero images get `srcset` from `-<w>w.webp` variants on disk. Regenerate with `tools/make_responsive_images.py` (Docker, like `optimize_images.py`).
- Design tokens in `css/tokens.css` are copied verbatim from the handoff. Keep `css/styles.css` on `var(--*)`.
