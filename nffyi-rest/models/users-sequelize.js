"use strict";
const logModule = require("debug");
const log = logModule('nffyi-rest:users-model');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
const modelDef = require("./nffyi-sequelize");
const User = require("./User");
function create(user) {
    return modelDef.connectDB('SQUser')
        .then(SQUser => {
        return SQUser['create']({
            username: user.username,
            password: user.password,
            email: user.email,
            lastAccessDate: Date(),
            role: user.role
        });
    });
}
exports.create = create;
;
function update(userID, username, password, email) {
    return modelDef.connectDB('SQUser')
        .then(SQUser => {
        return SQUser['find']({ where: { userID } })
            .then(user => {
            if (!user) {
                // throw new Error("No User found for userID " + userID);
                return null;
            }
            else {
                return user.updateAttributes({
                    username,
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
    return modelDef.connectDB('SQUser')
        .then(SQUser => {
        return SQUser['find']({ where: { userID } })
            .then(user => {
            if (!user) {
                // throw new Error("No user found for " + userID);
                return null;
            }
            else {
                return new User(user.username, user.password, user.email, user.role, user.userID, user.lastAccessDate);
            }
        });
    });
}
exports.read = read;
;
function destroy(userID) {
    return modelDef.connectDB('SQUser')
        .then(SQUser => {
        return SQUser['find']({ where: { userID } })
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
    return modelDef.connectDB('SQUser')
        .then(SQUser => {
        return SQUser['findAll']({ attributes: ['userID'] })
            .then(users => {
            return users.map(user => user.userID);
        });
    });
}
exports.keylist = keylist;
;
function count() {
    return modelDef.connectDB('SQUser')
        .then(SQUser => {
        return SQUser['count']()
            .then(count => {
            log('COUNT ' + count);
            return count;
        });
    });
}
exports.count = count;
;
/** Check if supplied credentials are valid */
function userPasswordCheck(username, password) {
    return modelDef.connectDB('SQUser').then(SQUser => {
        return SQUser['find']({ where: { username } });
    })
        .then(user => {
        // log('userPasswordCheck query:'+ username +'/'+ password +'|user:'+ user.username +', password:'+ user.password);
        log('userPasswordCheck query: ' + username + '/' + password);
        if (!user) {
            return { check: false, userid: 0, username, message: "Could not find user" };
        }
        else if (user.username === username && user.password === password) {
            return { check: true, userid: user.userID, username: user.username };
        }
        else {
            return { check: false, userid: 0, username: username, message: "Incorrect password" };
        }
    });
}
exports.userPasswordCheck = userPasswordCheck;
;
//# sourceMappingURL=users-sequelize.js.map