# General

newsfeeds.fyi - All Your News, at a Glance!

## Production Deployment

1. Put together the new container with `docker build -t bradyep/nffyi .`
2. Push the new container to docker hub with: `docker push bradyep/nffyi`
3. Log on to the remove server: `ssh bradyep@66.228.49.247`
4. Stop the currently running nffyi container: `sudo docker stop [id]`
5. Remove the old docker container: `sudo docker rm [id]`
6. Remove the old docker image to save space: `sudo docker rmi [id]`
7. Get the newly updated image: `sudo docker pull bradyep/nffyi`
8. Start up the the new container: `sudo docker run -d -p 127.0.0.1:3000:3000 -it --mount source=nffyi-data,target=/var/lib/nffyi-data bradyep/nffyi`

## Environmental Variables

* `SEQUELIZE_CONNECT`: Points to the yaml file needed to initialize the sqlite3 database
* `DEBUG`: Declares which debugging statements should show up in the log
* `PORT`: This is the port that the REST services will run on

## Server

* The transpiled entry point is `dist/server/server.js`
* The data directory on the doker host is: `/var/lib/docker/volumes/nffyi-data`
* The data directory in the docker image is `/var/lib/nffyi-data`

## Client

* Building transpiles, bundles and minifies the JavaScript into `main.bundle.js` (our code) and `vendor.bundle.js` (vendor code) and places them in the `dist` directory. 
* It also puts together our `styles.css` file and place it in `dist`.
* It will also copy every thing from `src/assets` to `dist/assets`.

## Logging

You can enable all of this application's logs by typing this in the browser's console: `localStorage.debug = 'webapp:*'`
