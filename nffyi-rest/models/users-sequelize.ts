// Will need to rename this to nffyi-sequelize

import util = require('util');
import fs = require('fs-extra');
import jsyaml = require('js-yaml');
import Sequelize = require("sequelize");

import logModule = require('debug');
  const log = logModule('nffyi-rest:users-model');
import errorModule = require('debug');
  const error = errorModule('nffyi-rest:error');

import User = require('./User');

var SQUser;
var SQLink;
var sequelize;

// Need parameter to indicate which model? 
export function connectDB() {
    
    // Maybe have a switch statement here? 

    // See if ANY of our models is defined?
    // Return a made-up Promise with requested model here? 
    if (SQUser) return SQUser.sync();
    // if (SQUser) return SQUser; // doesn't work
    
    return new Promise((resolve, reject) => {
        fs.readFile(process.env.SEQUELIZE_CONNECT, 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    })
    .then(yamltext => {
        return jsyaml.safeLoad(yamltext, 'utf8');
    })
    .then(params => {
        sequelize = new Sequelize(params.dbname, params.username, params.password, params.params);
        SQUser = sequelize.define('User', {
            userID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            username: Sequelize.STRING,
            password: Sequelize.STRING,
            email: Sequelize.STRING,
            lastAccessDate: Sequelize.DATE,
            role: Sequelize.STRING
        }); // /SQUser
/*
        SQLink = sequelize.define('Link', {
            linkID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            url: Sequelize.STRING,
            name: Sequelize.STRING,
            displayOrder: Sequelize.INTEGER
        }); // /SQLink
        */

        // We should call sequelize.sync(), not on individual models

        // Return model that User asked for 
        return SQUser.sync();
        // return SQUser.sync() && SQLink.sync();
    });
}; // /function connectDB

// Move everything below to users-sequelize

export function create(user:User) {
    return connectDB()
    .then(SQUser => {
        return SQUser.create({
            username: user.username,
            password: user.password,
            email: user.email,
            lastAccessDate: Date(),
            role: user.role
        });
    });
};

export function update(userID, username, password, email) {
    return connectDB()
    .then(SQUser => {
        return SQUser.find({ where: { userID } })
        .then(user => {
            if (!user) {
                // throw new Error("No User found for userID " + userID);
                return null;
            } else {
                return user.updateAttributes({
                    username,
                    password,
                    email,
                    lastAccessDate: Date()
                });
            }
        });
    });
};

/** Get one User from the Database */
export function read(userID) {
    return connectDB()
    .then(SQUser => {
        return SQUser.find({ where: { userID } })
        .then(user => {
            if (!user) {
                // throw new Error("No user found for " + userID);
                return null;
            } else {
                return new User(user.username, user.password, user.email, user.role, user.userID, user.lastAccessDate);
                // return new User(7, 'steve', 'go4it', 'steve@steve.com', Date());
                // var test = new User();
/*
            return {
                userID: user.userID, 
                userName: user.userName, 
                password: user.password, 
                email: user.email, 
                lastAccessDate: user.lastAccessDate
            };
            */
            }
        });
    });
};

export function destroy(userID) {
    return connectDB()
    .then(SQUser => {
        return SQUser.find({ where: { userID } })
        .then(user => {
            if (!user) return null;
            else return user.destroy();
        });
    });
};

export function keylist() {
    return connectDB()
    .then(SQUser => {
        return SQUser.findAll({ attributes: [ 'userID' ] })
        .then(users => {
            return users.map(user => user.userID);
        });
    });
};

export function count() {
    return connectDB()
    .then(SQUser => {
        return SQUser.count()
        .then(count => {
            log('COUNT ' + count);
            return count;
        });
    });
};

/** Check if supplied credentials are valid */
export function userPasswordCheck(username, password) {
    return connectDB().then(SQUser => {
        return SQUser.find({ where: { username } })
    })
    .then(user => {
        // log('userPasswordCheck query:'+ username +'/'+ password +'|user:'+ user.username +', password:'+ user.password);
        log('userPasswordCheck query: ' + username + '/' + password);
        if (!user) {
            return { check: false, userid: 0, username, message: "Could not find user" };
        } else if (user.username === username && user.password === password) {
            return { check: true, userid: user.userID, username: user.username };
        } else {
            return { check: false, userid: 0, username: username, message: "Incorrect password" };
        }
    });
};
