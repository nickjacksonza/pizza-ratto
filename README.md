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

## Menu editor (`editor/`, live at `/editor/`)

A static page for the owner to edit items and prices from a phone. It needs no server: it runs on GitHub Pages with the site.

- The owner signs in with a password. The password decrypts a GitHub token stored encrypted in `editor/sealed.json` (PBKDF2-SHA256, 1,000,000 rounds, then AES-GCM). The repo and site are public, so anyone can download that file and guess passwords offline: use a long password (16 characters minimum, enforced).
- A save fetches the latest JSON from `main`, applies the changes with the same rules as before (`editor/editor-lib.js`, ported from `admin/menu_ops.py` and `admin/jsonfmt.py`), and commits the changed files in one commit. The `rebuild-docs.yml` workflow then rebuilds and checks the site. The page follows that run and says "Published" or "the website was not updated".
- `?branch=<name>` points the editor at another branch for a test that doesn't go live (the workflow only runs on `main`).
- Tests: `node tools/test_editor.js` (round-trips the three JSON files and checks the rules).

### Set-up (Nick, once, and again when the token expires)

1. github.com, Settings, Developer settings, Fine-grained tokens, Generate new token. Name `pizza-ratto-menu-editor`. Repository access: only `nickjacksonza/pizza-ratto`. Permissions: Contents read and write, Actions read-only. Pick an expiry and put a renewal reminder in your calendar.
2. Open `https://pizzaratto.com/editor/#setup`. Paste the token, choose the owner's password, press "Encrypt and save". The page tests the token by committing the new `editor/sealed.json` itself.
3. Wait for the "Rebuild docs" run, then sign in at `https://pizzaratto.com/editor/` and make a small change to check it.
4. Give the owner the address and the password.

To change the password or renew the token, repeat steps 1 to 3. The old password stops working.

