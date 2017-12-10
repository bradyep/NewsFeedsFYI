"use strict";
// import express = require("express");
const express = require("express");
var router = express.Router();
const util = require("util");
// import User = require('../models/User');
const usersModel = require("../models/users-sequelize");
const logModule = require("debug");
const log = logModule('nffyi-rest:router-users');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
const authRouter = require("./authenticate");
// import UserModel = require('../models/User');
// import { UserModel } from '../../nffyi-common/models';
// import { UserModel } from '../models/common';
const nffyi_common_1 = require("nffyi-common");
const users_1 = require("../constants/users");
/* GET users listing. */
// router.get('/', authRouter.ensureAuthenticated, function(req, res, next) {
router.get('/', function (req, res, next) {
    // Must be an admin for full User listing, otherwise display 
    // User data for requesting User
    if (!req.user) {
        // Return guest user
        usersModel.read(users_1.GUEST_ID)
            .then(user => {
            if (!user)
                next();
            else
                res.json(user);
        })
            .catch(err => { next(err); });
    }
    else {
        if (req.user.userID === users_1.ADMIN_ID) {
            getKeyList()
                .then(userlist => {
                res.json(userlist);
            })
                .catch(err => { error('test page ' + err); next(err); });
        }
        else {
            // Normal user
            res.redirect('/users/' + req.user.userID);
        }
    }
});
var getKeyList = function () {
    return usersModel.keylist()
        .then(keylist => {
        var keyPromises = keylist.map(key => {
            return usersModel.read(key).then(user => {
                return {
                    userID: user.userID,
                    username: user.username,
                    password: user.password,
                    email: user.email,
                    lastAccessDate: user.lastAccessDate,
                    role: user.role
                };
            });
        });
        return Promise.all(keyPromises);
    });
};
// GET single User
router.get('/:userid', authRouter.ensureAuthenticated, (req, res, next) => {
    // Must be Admin to see another User's data
    usersModel.read(req.params.userid)
        .then((user) => {
        if (!user)
            next();
        else
            res.json(user);
    })
        .catch(err => { next(err); });
});
// Update existing User
router.put('/:userid', authRouter.ensureAuthenticated, (req, res, next) => {
    // Must be admin to update any User than oneself
    usersModel.update(req.params.userid, req.body.username, req.body.password, req.body.email)
        .then(user => {
        if (!user)
            next();
        else
            res.json(user);
    })
        .catch(err => { next(err); });
});
// POST new users
router.post('/', authRouter.ensureAuthenticated, function (req, res, next) {
    // We should authorize this action in order to prevent new
    // User spam
    // usersModel.create(req.body.username, req.body.password, req.body.email)
    usersModel.create(new nffyi_common_1.UserModel(req.body.username, req.body.password, req.body.email, 3))
        .then(user => {
        log('Attempted to create User: ' + util.inspect(user));
        res.json(user);
    })
        .catch(err => { next(err); });
});
// DELETE existing User
router.delete('/:userid', authRouter.ensureAuthenticated, (req, res, next) => {
    // Must be Admin to delete Users other than oneself
    usersModel.destroy(req.params.userid)
        .then(user => {
        if (!user)
            next();
        else
            res.json(user);
    })
        .catch(err => { next(err); });
});
module.exports = router;
//# sourceMappingURL=users.js.map