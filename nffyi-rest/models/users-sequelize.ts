import util = require('util');
import fs = require('fs-extra');
import jsyaml = require('js-yaml');
import Sequelize = require("sequelize");

import logModule = require('debug');
  const log = logModule('users:users-model');
import errorModule = require('debug');
  const error = errorModule('users:error');

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
            userName: Sequelize.STRING,
            password: Sequelize.STRING,
            email: Sequelize.STRING,
            lastAccessDate: Sequelize.DATE
        });
        return SQUser.sync();
    });
}; // /function connectDB

export function create(userName, password, email) {
    return connectDB()
    .then(SQUser => {
        return SQUser.create({
            userName,
            password,
            email
        });
    });
};

export function update(userID, userName, password, email) {
    return connectDB()
    .then(SQUser => {
        return SQUser.find({ where: { userID } })
        .then(user => {
            if (!user) {
                throw new Error("No User found for userID " + userID);
            } else {
                return user.updateAttributes({
                    userName,
                    password,
                    email,
                    lastAccessDate: Date()
                });
            }
        });
    });
};

export function read(userID) {
    return connectDB()
    .then(SQUser => {
        return SQUser.find({ where: { userID } })
        .then(user => {
            if (!user) {
                throw new Error("No user found for " + userID);
            } else {
                return new User(user.userID, user.userName, user.password, user.email, user.lastAccessDate);
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
            return user.destroy();
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
