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
var sequlz;

// exports.connectDB = function() {
export function connectDB() {
    
    if (SQUser) return SQUser.sync();
    
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
        sequlz = new Sequelize(params.dbname, params.username, params.password, params.params);
        SQUser = sequlz.define('User', {
            userID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            username: Sequelize.STRING,
            password: Sequelize.STRING,
            email: Sequelize.STRING,
            lastAccessDate: Sequelize.DATE,
            role: Sequelize.STRING
        });
        return SQUser.sync();
    });
}; // /function connectDB

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

/*
export function create(username, password, email) {
    return connectDB()
    .then(SQUser => {
        return SQUser.create({
            username,
            password,
            email,
            lastAccessDate: Date()
        });
    });
};
*/

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
                return new User(user.userID, user.username, user.password, user.email, user.lastAccessDate);
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
