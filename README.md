# General

newsfeeds.fyi - All Your News, at a Glance!

## Deployment

1. Build the backend app in `\nffyi-rest` with: `tsc -p .`
2. Build the frontend app in `\webapp` with: `npm run build`
3. copy the built client files from `webapp\dist` to `nffyi-rest\public`. 
    * Note that you may not have to copy the `assets` folder
4. Put together the new container in `\nffyi-rest` with `docker build -t bradyep/nffyi .`
    * Note that you may have to run this twice because of `apt-get update`
5. Push the new container to docker hub with: `docker push bradyep/nffyi`
6. Log on to the remove server: `ssh bradyep@66.228.49.247`
7. Get the newly updated image: `sudo docker pull bradyep/nffyi`
8. Stop the currently running nffyi container: `sudo docker stop cocky_goodall`
9. Start up the the new container: `sudo docker run -d -p 127.0.0.1:3000:3000 -it --mount source=nffyi-data,target=/var/lib/nffyi-data bradyep/nffyi`

**TODO**: Create real build scripts for everything

## Misc

* The data directory is /var/lib/nffyi-data

# Server

The newsfeeds.fyi backend consists of a RESTful express api. 

## Installation

* The `sqlite3` may have to be manually installed by itself.

## Usage

The build task is defined in tasks.json and can be invoked with `shift + ctrl + B`. This runs tsc on 'watch' mode.

Currently it must be run from VS Code so that the required environmental variable are set.

## Environmental Variables

* `SEQUELIZE_CONNECT`: Points to the yaml file needed to initialize the sqlite3 database
* `DEBUG`: Declares which debugging statements should show up in the log
* `PORT`: This is the port that the REST services will run on


# Client

The front-end web application for newsfeeds.fyi consists of a React app that uses MobX for state management.

## Usage

To run in local development mode: `npm run start`

To build the files needed to deploy to production: `npm run build`

* This will transpile, bundle and minify the JavaScript into bundle.js (our code) and vendor.bundle.js (vendor code) and place them in the `dist` directory. 
* It also puts together our `styles.css` file and place it in `dist`.
* It will also copy every thing from `src/assets` to `dist/assets`.

## Logging

You can enable all of this application's logs by typing this in the browser's console: `localStorage.debug = 'webapp:*'`

### Logging Categories


