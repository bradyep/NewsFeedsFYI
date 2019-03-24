"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logModule = require("debug");
const log = logModule('nffyi-rest:users-model');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
const modelDef = require("./nffyi-sequelize");
// import { UserModel } from '../../nffyi-common/models';
// import { UserModel } from './common';
const nffyi_common_1 = require("nffyi-common");
function create(user) {
    return modelDef.connectDB('SQUser')
        .then(SQUser => {
        return SQUser['create']({
            username: user.username,
            password: user.password,
            email: user.email,
            lastAccessDate: Date(),
            roleID: user.roleID
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
                return new nffyi_common_1.UserModel(user.username, user.password, user.email, user.roleID, user.userID, user.lastAccessDate);
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