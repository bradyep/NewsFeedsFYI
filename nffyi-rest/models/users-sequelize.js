"use strict";
const fs = require("fs-extra");
const jsyaml = require("js-yaml");
const Sequelize = require("sequelize");
const logModule = require("debug");
const log = logModule('users:users-model');
const errorModule = require("debug");
const error = errorModule('users:error');
const User = require("./User");
var SQUser;
var sequlz;
// exports.connectDB = function() {
function connectDB() {
    if (SQUser)
        return SQUser.sync();
    return new Promise((resolve, reject) => {
        fs.readFile(process.env.SEQUELIZE_CONNECT, 'utf8', (err, data) => {
            if (err)
                reject(err);
            else
                resolve(data);
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
}
exports.connectDB = connectDB;
; // /function connectDB
function create(userName, password, email) {
    return connectDB()
        .then(SQUser => {
        return SQUser.create({
            userName,
            password,
            email,
            lastAccessDate: Date()
        });
    });
}
exports.create = create;
;
function update(userID, userName, password, email) {
    return connectDB()
        .then(SQUser => {
        return SQUser.find({ where: { userID } })
            .then(user => {
            if (!user) {
                // throw new Error("No User found for userID " + userID);
                return null;
            }
            else {
                return user.updateAttributes({
                    userName,
                    password,
                    email,
                    lastAccessDate: Date()
                });
            }
        });
    });
}
exports.update = update;
;
/** Get one User from the Database */
function read(userID) {
    return connectDB()
        .then(SQUser => {
        return SQUser.find({ where: { userID } })
            .then(user => {
            if (!user) {
                // throw new Error("No user found for " + userID);
                return null;
            }
            else {
                return new User(user.userID, user.userName, user.password, user.email, user.lastAccessDate);
            }
        });
    });
}
exports.read = read;
;
function destroy(userID) {
    return connectDB()
        .then(SQUser => {
        return SQUser.find({ where: { userID } })
            .then(user => {
            if (!user)
                return null;
            else
                return user.destroy();
        });
    });
}
exports.destroy = destroy;
;
function keylist() {
    return connectDB()
        .then(SQUser => {
        return SQUser.findAll({ attributes: ['userID'] })
            .then(users => {
            return users.map(user => user.userID);
        });
    });
}
exports.keylist = keylist;
;
function count() {
    return connectDB()
        .then(SQUser => {
        return SQUser.count()
            .then(count => {
            log('COUNT ' + count);
            return count;
        });
    });
}
exports.count = count;
;
//# sourceMappingURL=users-sequelize.js.map