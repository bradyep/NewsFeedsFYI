# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

newsfeeds.fyi is a web-based, customizable news aggregation platform (RSS feeds currently, with plans for other source types). TypeScript throughout: Express/Node backend, React + MobX frontend, Sequelize/sqlite database.

## Commands

### Build
```bash
npm run build              # tsc build of everything (uses tsconfig.json)
npm run build-server       # server + common only, to dist/ (tsconfig.server.json)
npm run buildclient        # webpack build of client
npm run build:prod         # build-server + production webpack bundle
```

### Run (development)
```bash
npm run startbackendwindows          # sets SEQUELIZE_CONNECT and runs dist/server/server.js
npm run startbackendwindowsdebug     # same, plus DEBUG=nffyi-rest:*
npm run startclient                  # webpack-dev-server on port 3030, opens browser
npm run startclient:debug-layout     # client with DEBUG_LAYOUT=true
```
The backend must be built (`npm run build-server`) before `startbackend*` will find `dist/server/server.js`. Backend runs on port 3000 (`REST_DOMAIN` in `src/client/constants/network.ts` points here in dev); client dev server runs on 3030 and proxies API calls to it.

### Tests
```bash
npm test                   # all Jest projects (client/server/common)
npm run test:watch
npm run test:coverage
npm run test:client        # jest --selectProjects client
npm run test:server        # jest --selectProjects server
npm run test:common        # jest --selectProjects common
npm run test:e2e           # Playwright — requires client running on localhost:3030 first
npm run test:e2e:ui
npm run test:e2e:headed
npm run test:all           # jest + playwright
```
Run a single test file: `npx jest path/to/file.test.ts` (or `npx jest -t "test name"` to filter by name). Jest is configured as three separate projects in `jest.config.js` — client tests live under `src/test/client/`, server under `src/test/server/`, common under `src/test/common/`, each with its own environment (jsdom vs node) and module-alias mapping. There is no linter configured in this repo (see README "Future Plans" — linting is not yet set up).

## Architecture

### Source layout: server / client / common
`src` is split into three trees that map to three separate TS builds:
- `src/server` — Express app, routes, Sequelize models/config. Compiled via `tsconfig.server.json` to `dist/`.
- `src/client` — React components, MobX stores, API service layer. Bundled via webpack (`webpack.config.js`) to `dist/`.
- `src/common` — Model interfaces/types shared by both server and client (e.g. `UserModel`, `PageModel`, `LinkModel`, `UserFeedModel`, `CachedNewsItemModel`).

Cross-tree imports use module aliases rather than relative paths: `common/...`, `server/...`, `client/...`. These are wired up three separate ways depending on context — keep all three in sync if adding a new alias:
- Runtime (compiled server): `module-alias` package, configured via `_moduleAliases` in `package.json` (points at `dist/server`, `dist/common`, `dist/client`), registered at the top of `src/server/server.ts` via `import 'module-alias/register'`.
- Webpack (client bundle): `resolve.alias` in `webpack.config.js`.
- Jest: `moduleNameMapper` per-project in `jest.config.js`.
- TypeScript path resolution: `paths` in `tsconfig.server.json`.

### Server entry point
`src/server/server.ts` is the actual entry point run in production/dev (`npm run startbackend*` → `dist/server/server.js`). It sets up Express middleware, CORS (allowing `http://localhost:3030`), sessions, Passport auth, and routes, then serves the built client as static files with a catch-all that returns `index.html` (client-side routing).

`src/server/app.ts` and `src/server/index.ts` are legacy express-generator boilerplate (EJS views, no longer wired into any npm script) — not the live code path. Prefer `server.ts` when making backend changes; don't assume `app.ts`/`index.ts` reflect current behavior.

### Routes and data layer
Routes live in `src/server/routes/` (`users`, `links`, `pages`, `user-feeds`, `authenticate`, `index`) and are mounted in `server.ts` under `/users`, `/links`, `/pages`, `/userfeeds`, `/authenticate`. Each route module pairs with a Sequelize model in `src/server/sequelize/` (e.g. `users-sequelize.ts`, `links-sequelize.ts`) that defines the DB schema/queries. `src/server/models/FeedHandler.ts` handles fetching and parsing RSS feeds (via `feedparser`) for news content.

Database connection config is environment-driven via `SEQUELIZE_CONNECT`, pointing to a YAML file (`src/server/sequelize/sequelize-sqlite.yaml` for local dev, `sequelize-sqlite-docker.yaml` for the Docker deployment) that specifies the sqlite storage file and dialect.

### Client architecture
React app rooted at `src/client/containers/Root` → `NewsFeedsFYIApp`, composed of components under `src/client/components/` split into `TopHeaderComponents`, `LowerHeaderComponents`, `BodyComponents`, `FooterComponents`. State is managed with MobX stores in `src/client/stores/` (`UserStore`, `LinkStore`, `PageStore`), exposed via `src/client/stores/index.ts`. All server communication goes through `src/client/services/api.ts`, which fetches against `REST_DOMAIN` (`src/client/constants/network.ts`) and returns typed data using the `common/models` interfaces — this is the layer to extend when adding new API calls rather than calling `fetch` directly from components/stores.

CSS is per-component via CSS Modules (`styles.css` next to each component's `index.tsx`), bundled by webpack with `postcss-loader`.

### Duplicate `.js`/`.js.map` files under `src/`
Many directories under `src/` (e.g. `src/common/models/*.js`, `src/server/**/*.js.map`) contain compiled JS/sourcemaps checked in alongside the `.ts` sources — leftovers from a prior build configuration. Always edit the `.ts` source files; ignore the `.js`/`.js.map` siblings.

## Deployment

Dockerized: `docker build -t bradyep/nffyi .` then push to Docker Hub, pull and run on the remote host, mounting a persistent volume at `/var/lib/nffyi-data` (host: `/var/lib/docker/volumes/nffyi-data`). See README.md for the full step-by-step production deploy sequence — it involves manually stopping/removing the old container on the remote server, so don't run any of those steps without explicit confirmation.

## Environment Variables

- `SEQUELIZE_CONNECT` — path to the YAML file initializing the sqlite3 database
- `DEBUG` — controls which debug-namespaced log statements are printed (e.g. `nffyi-rest:*` server-side, `webapp:*` client-side via `localStorage.debug` in the browser console)
- `PORT` — port the REST server listens on
