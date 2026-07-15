# Pizza Ratto

The production website for Pizza Ratto, an independent wood-fired pizza shop in Salt River, Cape Town. The visual direction translates the shop's printed flyer into a responsive, accessible web experience without losing its rough, hand-made poster character.

- Live site: <https://zmaqutu.github.io/pizza-ratto/>
- Repository: <https://github.com/zmaqutu/pizza-ratto>
- Agent handoff: [`AGENTS.md`](AGENTS.md)
- Documentation index: [`docs/README.md`](docs/README.md)

## Local development

Node.js 22 or newer is recommended.

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run lint
npm run typecheck
npm run build
npm test
npm run build:pages
```

`npm run build` produces the vinext/Cloudflare-compatible build used by Sites. `npm run build:pages` produces the GitHub Pages static export in `dist/client`.

## Project map

- `app/` — page markup, metadata and the complete visual system
- `data/` — typed business and menu content
- `public/images/` — production artwork and photography
- `scripts/` — GitHub Pages post-processing
- `tests/` — rendered-output and content-source checks
- `docs/` — architecture, design, content, operations and decisions

## Publishing

Pushes to `main` publish to GitHub Pages through `.github/workflows/deploy-pages.yml`. The project also retains its OpenAI Sites/Cloudflare build target. Do not run a deployment or push changes unless the project owner explicitly asks for it; see [`docs/deployment.md`](docs/deployment.md).

Business facts and menu data are centralized in `data/`. Treat unverified content as a launch risk and review [`docs/content-todo.md`](docs/content-todo.md) before changing claims, prices, hours or order links.
