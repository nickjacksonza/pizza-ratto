# Deployment

## Deployment policy

Never deploy automatically after an edit. Deploy only when the user explicitly asks.

The project currently supports two targets:

1. GitHub Pages — current public site and default public strategy
2. OpenAI Sites — optional retained Worker-compatible deployment

## GitHub Pages

### Public URL

`https://zmaqutu.github.io/pizza-ratto/`

### Repository

`https://github.com/zmaqutu/pizza-ratto`

### Trigger model

`.github/workflows/deploy-pages.yml` deploys on:

- push to `main`;
- manual `workflow_dispatch`.

The workflow:

1. checks out the repository;
2. installs Node 22;
3. runs `npm ci`;
4. configures Pages;
5. runs `npm run build:pages`;
6. ensures `.nojekyll` exists;
7. uploads `dist/client`;
8. deploys the artifact to the `github-pages` environment.

### Manual deployment command

```bash
npm run deploy:pages
```

This expands to:

```bash
gh workflow run deploy-pages.yml --ref main
```

It requires an authenticated GitHub CLI session. Check with:

```bash
gh auth status
```

If authentication has expired:

```bash
gh auth login --hostname github.com --git-protocol https --web
```

### Static export pipeline

`npm run build:pages` sets the repository prefix and enables `output: "export"`.

`vite.config.ts` sets Vite's base to `/pizza-ratto/` so scripts and styles resolve under the project Pages URL.

`app/page.tsx` prefixes public images with `NEXT_PUBLIC_BASE_PATH`.

`scripts/prepare-pages.mjs` works around vinext-generated font paths that otherwise remain rooted at `/assets/_vinext_fonts/`. It rewrites HTML and RSC output and creates `.nojekyll`.

### Why `basePath` is not used

vinext 0.0.50 returned a prerender-time RSC 404 when a Next `basePath` was combined with `output: "export"`. The working solution keeps the generated homepage at the artifact root while using:

- Vite `base` for scripts and styles;
- `assetPrefix` in Next config;
- `NEXT_PUBLIC_BASE_PATH` for public images and metadata;
- a post-build font-path rewrite.

Do not casually replace this with `basePath`. Reproduce the Pages build and verify `dist/client/index.html` first.

### Pages verification

After deployment:

```bash
gh run list --repo zmaqutu/pizza-ratto --workflow deploy-pages.yml --limit 5
curl -I https://zmaqutu.github.io/pizza-ratto/
curl -I https://zmaqutu.github.io/pizza-ratto/images/hero-logo-mascot.png
```

Expected result: HTTP 200 for the page and critical assets.

### GitHub Pages failure modes

#### Site loads without styling

Check that HTML references `/pizza-ratto/assets/...`, not `/assets/...`.

#### Fonts fail

Run `scripts/prepare-pages.mjs` and inspect generated HTML for unprefixed `/assets/_vinext_fonts/`.

#### Images fail

Confirm JSX uses `asset()` and no `/_vinext/image` URLs exist in generated HTML.

#### Workflow says Pages is not enabled

Configure the repository Pages source as GitHub Actions. The Pages REST build type should be `workflow`.

#### Artifact is processed by Jekyll

Ensure `dist/client/.nojekyll` exists and the workflow uploads `dist/client` rather than the repository root.

## OpenAI Sites

### Project binding

`.openai/hosting.json` contains:

```json
{
  "project_id": "appgprj_6a577c819fc48191aa1a1eca5c6dc4ff",
  "d1": null,
  "r2": null
}
```

No database or object storage is active.

### Build compatibility

The normal `npm run build` retains the vinext/Cloudflare Worker structure. The `sites()` Vite plugin and `worker/index.ts` remain for this target.

### Policy

Only use the Sites deployment workflow when the user specifically asks for a Sites deployment. A GitHub Pages request does not imply permission to update Sites, and a Sites request does not imply permission to push GitHub.

## Changing repository or domain

If the GitHub repository name changes, update:

- `NEXT_PUBLIC_BASE_PATH` in `package.json`;
- the Vite base in `vite.config.ts`;
- the Pages URL in `package.json` and metadata;
- this document and `AGENTS.md`.

If a custom domain is added, revisit whether a repository prefix is still needed and update metadata, canonical URLs, Pages settings, and verification checks together.
