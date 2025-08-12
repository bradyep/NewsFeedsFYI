# General

newsfeeds.fyi - All Your News, at a Glance!

## Deployment

1. `npm run build-server`
2. `npm run buildclient`
3. Put together the new container with `docker build -t bradyep/nffyi .`
4. Push the new container to docker hub with: `docker push bradyep/nffyi`
5. Log on to the remove server: `ssh bradyep@66.228.49.247`
6. Get the newly updated image: `sudo docker pull bradyep/nffyi`
7. Stop the currently running nffyi container: `sudo docker stop [pid]`
8. Start up the the new container: `sudo docker run -d -p 127.0.0.1:3000:3000 -it --mount source=nffyi-data,target=/var/lib/nffyi-data bradyep/nffyi`

## Environmental Variables

* `SEQUELIZE_CONNECT`: Points to the yaml file needed to initialize the sqlite3 database
* `DEBUG`: Declares which debugging statements should show up in the log
* `PORT`: This is the port that the REST services will run on

## Server

* The data directory in the docker image is /var/lib/nffyi-data
* The transpiled entry point is `dist/server/server.js`

## Client

* Building transpiles, bundles and minifies the JavaScript into `main.bundle.js` (our code) and `vendor.bundle.js` (vendor code) and places them in the `dist` directory. 
* It also puts together our `styles.css` file and place it in `dist`.
* It will also copy every thing from `src/assets` to `dist/assets`.

## Logging

You can enable all of this application's logs by typing this in the browser's console: `localStorage.debug = 'webapp:*'`
