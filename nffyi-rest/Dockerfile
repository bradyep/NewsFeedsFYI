# Derive image from official Node 6 image
FROM node:6.12

# Set environment values
ENV SEQUELIZE_CONNECT="models/sequelize-sqlite.yaml"
ENV DEBUG="nffyi-rest:*"
ENV PORT="3000"
ENV REST_LISTEN="0.0.0.0"

# App code copied to /usr/src/app
RUN mkdir -p /usr/src/app
COPY . /usr/src/app
WORKDIR /usr/src/app

# Install vim and sqlite3
RUN ["apt-get", "update"]
RUN ["apt-get", "install", "-y", "vim"]
RUN ["apt-get", "install", "-y", "sqlite3", "libsqlite3-dev"]
RUN ["npm", "install", "--unsafe-perm"]

EXPOSE 3000
CMD npm run start
