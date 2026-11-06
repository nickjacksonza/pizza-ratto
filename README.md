# Pizza Ratto website

This is the source code for [pizzaratto.com](https://pizzaratto.com), the website of Pizza Ratto. Pizza Ratto is a wood-fired pizza shop at 20 Brickfield Road, Salt River, Cape Town. It is open Monday to Saturday, 12:00 to 21:00.

Looking for the menu, the opening hours or a way to order? Go to [pizzaratto.com](https://pizzaratto.com). This repository is how the website is built.

## How the site works

- The site is plain HTML, CSS and a little JavaScript. There is no framework and no npm.
- `build.py` is a small Python script that uses only the standard library. It turns the page templates and data files into finished pages in `docs/`.
- GitHub Pages publishes the `docs/` folder from the `main` branch.
- Menu items and prices are kept in three JSON files in `site-references/for-sale/`: `menu.json`, `deli.json` and `merchandise.json`. Shop details such as the address, opening hours and links are kept in `src/data/site.json`.
- When a change reaches `main`, a GitHub Actions workflow rebuilds `docs/`, checks the result and publishes it. The check stops the update if any price is missing from the built pages.

## Folders

| Folder | What it holds |
|--------|---------------|
| `src/pages/` | One template per page: home, deli, merchandise and the 404 page |
| `src/partials/` | The shared head, header, footer and mobile bar |
| `src/data/site.json` | Shop details, navigation and section content |
| `site-references/for-sale/` | Menu, deli and merchandise items with their prices |
| `css/` | Styles. `tokens.css` holds the brand colours and fonts. The build minifies the CSS and puts it inside each page. |
| `js/` | The small script for the mobile menu, cookie banner and other page behaviour |
| `images/`, `videos/`, `fonts/` | Media, copied to `docs/` as they are |
| `tools/` | Build helpers: the minifier, the post-build checks and the image resizer |
| `docs/` | The built site. Don't edit it by hand. |

## Build and preview

You need Python 3. The workflow uses Python 3.12.

    python3 build.py                        # build docs/ from the source
    python3 tools/check.py                  # check structured data, headings, image sizes, links and prices
    cd docs && python3 -m http.server 3056  # preview at http://localhost:3056

Commit `docs/` together with the source change. The live site shows whatever is committed in `docs/`.

## Fonts

Headland One (Sorkin Type) and Shrikhand (Jonny Pinhorn) are used under the SIL Open Font License. Their licence files are in `fonts/`.

## Content

The photos, artwork, logo and text belong to Pizza Ratto. Please ask before you reuse them.
