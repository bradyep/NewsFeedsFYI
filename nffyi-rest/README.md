# Newsfeeds.fyi REST Backend

This is the REST application that makes up the backend. 

## Installation

* The `sqlite3` may have to be manually installed by itself.

## Usage

The build task is defined in tasks.json and can be invoked with `shift + ctrl + B`. This runs tsc on 'watch' mode.

Currently it must be run from VS Code so that the required environmental variable are set.

## Environmental Variables

* `SEQUELIZE_CONNECT`: Points to the yaml file needed to initialize the sqlite3 database
* `DEBUG`: Declares which debugging statements should show up in the log
* `PORT`: This is the port that the REST services will run on
