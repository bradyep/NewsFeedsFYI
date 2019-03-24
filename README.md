# NewsFeeds.fyi

These two projects make up the newsfeeds.fyi website. 

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
