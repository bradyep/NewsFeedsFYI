# General

newsfeeds.fyi is a web-based, flexible, easily customizable, open source, news aggregation platform. Stay up to date on everything that interests you by having it in one place. Organize your information however you see fit. Currently supports RSS feeds with the intention of adding screen scraping and additional news source types later.

## Setup

```bash
git clone https://github.com/bradyep/NewsFeedsFYI.git
npm install
```

## Building

#### Build everything

```bash
npm run build
```

### Server

Express app, routes, Sequelize models/config. Compiled via `tsconfig.server.json` to `dist/`.

```bash
npm run build-server
```

### Client

React components, MobX stores, API service layer. Bundled via webpack (`webpack.config.js`) to `dist/`.

```bash
npm run buildclient
npm run build:prod  # build-server + production webpack bundle
```

## Running

### Server

`startbackend*` initiates the backend entry point of `dist/server/server.js` which runs on port 3000 (declared as `REST_DOMAIN` in `src/client/constants/network.ts`).

```bash
npm run startbackend
npm run startbackendwindows
npm run startbackendwindowsdebug
```

### Client

webpack-dev-server on port 3030, opens browser

```bash
npm run startclient
npm run startclient:debug-layout
```

# Technical Overview

Built on TypeScript using node on the backend and react on the frontend with MobX for state management. Currently using sqlite as the database. Easily deployable using Docker. Module bundling via webpack. Tests handled by Jest. CSS modules via PostCSS. 

## Source Code Organization

Source code is broken up by server, client and common (used by both server and client) in the `src` folder. Assets such as fonts and images that get bundled and sent out with the app can be found at `src/assets`.

### Server

`src/server/server.ts` is the actual entry point run in production/dev (`npm run startbackend*` → `dist/server/server.js`). It sets up Express middleware, CORS (allowing `http://localhost:3030`), sessions, Passport auth, and routes, then serves the built client as static files with a catch-all that returns `index.html` (client-side routing).

Routes live in `src/server/routes/` (`users`, `links`, `pages`, `user-feeds`, `authenticate`, `index`) and are mounted in `server.ts` under `/users`, `/links`, `/pages`, `/userfeeds`, `/authenticate`. Each route module pairs with a Sequelize model in `src/server/sequelize/` (e.g. `users-sequelize.ts`, `links-sequelize.ts`) that defines the DB schema/queries. `src/server/models/FeedHandler.ts` handles fetching and parsing RSS feeds (via `feedparser`) for news content.

Database connection config is environment-driven via `SEQUELIZE_CONNECT`, pointing to a YAML file (`src/server/sequelize/sequelize-sqlite.yaml` for local dev, `sequelize-sqlite-docker.yaml` for the Docker deployment) that specifies the sqlite storage file and dialect.

* The transpiled entry point is `dist/server/server.js`
* The data directory on the doker host is: `/var/lib/docker/volumes/nffyi-data`
* The data directory in the docker image is `/var/lib/nffyi-data`

### Client

React app rooted at `src/client/containers/Root` → `NewsFeedsFYIApp`, composed of components under `src/client/components/`. State is managed with MobX stores in `src/client/stores/` (`UserStore`, `LinkStore`, `PageStore`), exposed via `src/client/stores/index.ts`. All server communication goes through `src/client/services/api.ts`, which fetches against `REST_DOMAIN` (`src/client/constants/network.ts`) and returns typed data using the `common/models` interfaces — this is the layer to extend when adding new API calls rather than calling `fetch` directly from components/stores.

CSS is per-component via CSS Modules (`styles.css` next to each component's `index.tsx`), bundled by webpack with `postcss-loader`.

* Building transpiles, bundles and minifies the JavaScript into `main.bundle.js` (our code) and `vendor.bundle.js` (vendor code) and places them in the `dist` directory. 
* It also puts together our `styles.css` file and place it in `dist`.
* It will also copy every thing from `src/assets` to `dist/assets`.

## Production Deployment

1. Put together the new container with `docker build -t bradyep/nffyi .`
2. Push the new container to docker hub with: `docker push bradyep/nffyi`
3. Log on to the remove server: `ssh bradyep@66.228.49.247`
4. Stop the currently running nffyi container: `sudo docker stop [id]`
5. Remove the old docker container: `sudo docker rm [id]`
6. Remove the old docker image to save space: `sudo docker rmi [id]`
7. Get the newly updated image: `sudo docker pull bradyep/nffyi`
8. Start up the the new container: `sudo docker run -d -p 127.0.0.1:3000:3000 -it --mount source=nffyi-data,target=/var/lib/nffyi-data bradyep/nffyi`

## Tests

See the [testing documentation](docs/testing.md) for an overview on the testing setup. 

## Environmental Variables

* `SEQUELIZE_CONNECT`: Points to the yaml file needed to initialize the sqlite3 database
* `DEBUG`: Declares which debugging statements should show up in the log
* `PORT`: This is the port that the REST services will run on

## Logging

You can enable all of this application's logs by typing this in the browser's console: `localStorage.debug = 'webapp:*'`

## Key Dependencies

* Express
* Bootstrap
* Feedparser
* MobX
* React
* Sequelize

# Future Plans

* Upgrade to TypeScript 7
* newsfeeds.fyi app available on mobile platforms
* Additional sources of news: Discord, screen scraping, email, etc.
* PostgreSQL as the database instead of sqlite
* Linting/style guides for source code
* Redux Toolkit instead of MobX for state management
* OpenAPI/Swagger page

# Known Issues

* Needs better logging and error handling
* Header does not scroll correctly on mobile devices and can overlap newsfeeds
