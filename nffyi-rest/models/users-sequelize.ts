import logModule = require('debug');
  const log = logModule('nffyi-rest:users-model');
import errorModule = require('debug');
  const error = errorModule('nffyi-rest:error');

import modelDef = require('./nffyi-sequelize');
// import { UserModel } from '../../nffyi-common/models';
// import { UserModel } from './common';
import { UserModel } from 'nffyi-common';

export function create(user:UserModel) {
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
};

export function update(userID, username, password, email) {
    return modelDef.connectDB('SQUser')
    .then(SQUser => {
        return SQUser['find']({ where: { userID } })
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
    return modelDef.connectDB('SQUser')
    .then(SQUser => {
        return SQUser['find']({ where: { userID } })
        .then(user => {
            if (!user) {
                // throw new Error("No user found for " + userID);
                return null;
            } else {
                return new UserModel(user.username, user.password, user.email, user.roleID, user.userID, user.lastAccessDate);
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
    return modelDef.connectDB('SQUser')
    .then(SQUser => {
        return SQUser['find']({ where: { userID } })
        .then(user => {
            if (!user) return null;
            else return user.destroy();
        });
    });
};

export function keylist() {
    return modelDef.connectDB('SQUser')
    .then(SQUser => {
        return SQUser['findAll']({ attributes: [ 'userID' ] })
        .then(users => {
            return users.map(user => user.userID);
        });
    });
};

export function count() {
    return modelDef.connectDB('SQUser')
    .then(SQUser => {
        return SQUser['count']()
        .then(count => {
            log('COUNT ' + count);
            return count;
        });
    });
};

/** Check if supplied credentials are valid */
export function userPasswordCheck(username, password) {
    return modelDef.connectDB('SQUser').then(SQUser => {
        return SQUser['find']({ where: { username } })
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
