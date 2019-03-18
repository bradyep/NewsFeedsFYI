# Web Application for newsfeeds.fyi

This is the front-end web application for newsfeeds.fyi. 

## Usage

To run in local development mode: `npm run start`

To build the files needed to deploy to production: `npm run build`

* This will transpile, bundle and minify the JavaScript into bundle.js (our code) and vendor.bundle.js (vendor code) and place them in the `dist` directory. 
* It also puts together our `styles.css` file and place it in `dist`.
* It will also copy every thing from `src/assets` to `dist/assets`.

## Logging

You can enable all of this application's logs by typing this in the browser's console: `localStorage.debug = 'webapp:*'`

### Logging Categories


