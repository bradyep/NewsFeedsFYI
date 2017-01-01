"use strict";
// var express = require('express');
const express = require("express");
var router = express.Router();
const usersModel = require("../models/users-sequelize");
const logModule = require("debug");
const log = logModule('nffyi-rest:router-test');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
/* GET home page. */
router.get('/', function (req, res, next) {
    // var userlist;
    getKeyTitlesList()
        .then(userlist => {
        // var user = req.user ? req.user : undefined;
        res.render('test', {
            title: 'User List',
            userlist,
        });
    })
        .catch(err => { error('test page ' + err); next(err); });
});
var getKeyTitlesList = function () {
    return usersModel.keylist()
        .then(keylist => {
        var keyPromises = keylist.map(key => {
            return usersModel.read(key).then(user => {
                return { userID: user.userID, username: user.username };
            });
        });
        return Promise.all(keyPromises);
    });
};
module.exports = router;
//# sourceMappingURL=test.js.map