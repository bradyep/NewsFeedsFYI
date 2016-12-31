"use strict";
const express = require("express");
var router = express.Router();
const util = require("util");
// import User = require('../models/User');
const usersModel = require("../models/users-sequelize");
const logModule = require("debug");
const log = logModule('nffyi-rest:users');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
/* GET users listing. */
router.get('/', function (req, res, next) {
    // var userlist;
    getKeyList()
        .then(userlist => {
        // var user = req.user ? req.user : undefined;
        // res.render('test', {
        // title: 'User List',
        // userlist,
        // user: user
        // });
        res.json(userlist);
    })
        .catch(err => { error('test page ' + err); next(err); });
});
var getKeyList = function () {
    return usersModel.keylist()
        .then(keylist => {
        var keyPromises = keylist.map(key => {
            return usersModel.read(key).then(user => {
                return {
                    userID: user.userID,
                    userName: user.userName,
                    password: user.password,
                    email: user.email,
                    lastAccessDate: user.lastAccessDate
                };
            });
        });
        return Promise.all(keyPromises);
    });
};
/*
router.get('/', function(req, res, next) {
  // res.send('respond with a resource');
  res.json({ message: 'welcome to the users API'});
});
*/
// POST new users
router.post('/', function (req, res, next) {
    /*
    let user = new User();
    user.userName = req.body.userName;
    user.password = req.body.password;
    user.email = req.body.email;
  */
    usersModel.create(req.body.userName, req.body.password, req.body.email)
        .then(user => {
        log('Attempted to create User: ' + util.inspect(user));
        res.json(user);
    })
        .catch(err => { next(err); });
});
module.exports = router;
//# sourceMappingURL=users.js.map