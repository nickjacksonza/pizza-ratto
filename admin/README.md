# Menu editor (admin/)

A small password-protected web app for the shop owner. It edits `site-references/for-sale/menu.json`,
`deli.json` and `merchandise.json` from a phone, checks that the site still builds, and commits the JSON and the rebuilt `docs/` to GitHub `main` in one commit.
GitHub Pages serves `main` `/docs`, so a save goes live in a few minutes.
It runs in Docker on the VPS (`/docker/pizza-ratto-admin/`). It is not part of the built site: `build.py` only copies
`js`, `images`, `fonts` and `videos` into `docs/`.

Python standard library only. Files:

- `app.py`: web server, login, save pipeline. `python3 app.py hash` prints a password hash.
- `menu_ops.py`: checks and applies the owner's changes to the JSON.
- `jsonfmt.py`: writes the JSON in the repo's own style (one-line short items, inline option lists).
- `static/`: page script and styles. Colours and fonts come from the site's `css/tokens.css`.
- `askpass.sh`: hands the GitHub token to git from the environment.
- `test_jsonfmt.py`: `python3 admin/test_jsonfmt.py` round-trips the three files and tests the change rules.

## What a save does

1. Takes a lock, so only one save runs at a time.
2. In the app's own clone (Docker volume, never `/srv/projects/pizza-ratto`): `git fetch`, hard reset to `origin/$TARGET_BRANCH`, clean.
3. Applies the owner's changes (update fields, add, delete, reorder) to the fresh files. Fields the editor does not know about are kept.
4. Writes the JSON, then runs `python3 build.py` and `python3 tools/check.py` locally as a pre-flight. If either fails,
   nothing is committed and the owner sees the error in plain words (check.py also confirms every price appears on the page).
5. Commits the changed JSON files and the rebuilt `docs/` (including `docs/CNAME`) together as "Menu update via editor: ...",
   then pushes to `$TARGET_BRANCH`.
   If GitHub rejects the push, it refetches, reapplies the same changes and tries once more.
   With `DRY_RUN=1` it commits inside the container only and never pushes.

Ids of existing items never change (photos are named by id). A new item gets an id from its name and the
image path `images/<same folder as its group>/<id>.webp`, so it shows the "photo coming hot" tile until that photo is added.
Sections and groups can't be added or renamed here, because `build.py` and `site.json` refer to them by id.

## Security

- One password, stored only as an scrypt hash (`ADMIN_PASSWORD_HASH`), compared in constant time.
- The app answers only under `/<ADMIN_PATH>/`. Every other path is 404. All responses send `X-Robots-Tag: noindex, nofollow`.
- Session cookie: `HttpOnly; Secure; SameSite=Strict`, 8 hours. New session id at login.
- CSRF token on every POST, plus a same-site check.
- 5 wrong passwords from one IP lock that IP for 15 minutes. 20 wrong passwords in 15 minutes lock login for everyone for 15 minutes.
- Request bodies over 64 KB are refused. Text is length-limited and may not contain `<`, `>` or control characters. Prices must be numbers.
- The token lives only in the container environment. Git gets it through `askpass.sh`, so it is never in a URL, `.git/config`, the process list or a log.
  Logs replace the secret path with `/<admin>`.

## Before you go live

Merge PR #8 (`main-catch-up`, which adds `docs/CNAME`, the `rebuild-docs.yml` workflow and the price check) to `main` first,
then the editor PR. The editor no longer needs a workflow on the target branch, because it commits `docs/` itself.
The `rebuild-docs.yml` workflow still matters for edits made directly on GitHub; after an editor save it finds `docs/`
already current and commits nothing.

Prices are whole rand (the site prints the number as is). `main` has no branch protection (private repo on a free plan),
so the token's pushes are not blocked. If protection is ever added, the editor's pushes will be refused.

The compose file uses `expose` (no host port at all), so the editor is reachable only through Traefik once
`traefik.enable=true`. Don't switch it to `ports: - "8080"`: that publishes a random public host port over plain HTTP
and lets callers forge `X-Real-Ip`.

## Setup steps

1. **Set up GitHub Pages.** In github.com/nickjacksonza/pizza-ratto, go to Settings, then Pages.
   Source "Deploy from a branch", branch `main`, folder `/docs`. Custom domain `pizzaratto.com`. Tick Enforce HTTPS
   once GitHub allows it (after DNS is set). `docs/CNAME` already holds the domain.
2. **Create the token.** github.com, Settings, Developer settings, Personal access tokens, Fine-grained tokens, Generate new token.
   - Name: `pizza-ratto-menu-editor`. Expiration: your choice (a calendar reminder to renew it helps).
   - Resource owner: `nickjacksonza`. Repository access: Only select repositories, `nickjacksonza/pizza-ratto`.
   - Repository permissions: Contents, Read and write. Leave everything else at No access (Metadata read-only is added automatically).
   - Generate, and copy the token. You can't see it again.
3. **Copy the editor code to the VPS deploy folder** (after the PRs are merged):

       git -C /srv/projects/pizza-ratto fetch origin
       git -C /srv/projects/pizza-ratto archive origin/main admin | tar -x -C /docker/pizza-ratto-admin

4. **Make the .env file:**

       cd /docker/pizza-ratto-admin
       cp .env.example .env
       chmod 600 .env

5. **Make the password hash.** Pick a password of 12 or more characters for the owner. Run:

       cd /docker/pizza-ratto-admin
       docker compose build
       docker compose run --rm -it --no-deps editor python3 /app/app.py hash

   Type the password twice. Copy the `scrypt:...` line it prints.
6. **Fill in `/docker/pizza-ratto-admin/.env`:**
   - `ADMIN_PASSWORD_HASH=` the `scrypt:...` line from step 5.
   - `ADMIN_PATH=` the output of `openssl rand -hex 16`.
   - `GITHUB_TOKEN=` the token from step 2.
   - `GIT_USER_NAME=` and `GIT_USER_EMAIL=` the name and email the commits should carry (your GitHub noreply address is fine).
   - `TARGET_BRANCH=main`. `SITE_URL=` the live site address (`https://pizzaratto.com`).
   - Keep `DRY_RUN=1` for the first test.
7. **Pick the hostname.** Choose a name such as `menu.<your-domain>` and set `ADMIN_HOST=` to it.
   Point a DNS A record for that name at this VPS. Traefik gets the certificate from Let's Encrypt.
8. **Turn on the route.** In `/docker/pizza-ratto-admin/compose.yaml` change `traefik.enable=false` to `traefik.enable=true`.
9. **Start it:**

       cd /docker/pizza-ratto-admin
       docker compose up -d --build
       docker compose logs -f editor     # wait for "repo ready on main"

10. **Test, then go live.** Open `https://<ADMIN_HOST>/<ADMIN_PATH>/`, sign in, change a price and save.
    You should see "Test save worked (not published)". Then set `DRY_RUN=0` in `.env`, run `docker compose up -d`, and save a real change.
    Check the commit on GitHub and the live site.
11. Give the owner the full URL (with the path) and the password. Bookmark it on their phone.

To update the editor later, repeat step 3 and run `docker compose up -d --build`.
To change the password, repeat steps 5 and 6 and run `docker compose up -d`.
