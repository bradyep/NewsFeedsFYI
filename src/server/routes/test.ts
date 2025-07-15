// IMPORTANT: This route should no longer be needed!


// var express = require('express');
import express = require("express");
var router = express.Router();
import usersModel = require('../models/users-sequelize');
import logModule = require('debug');
  const log = logModule('nffyi-rest:router-test');
import errorModule = require('debug');
  const error = errorModule('nffyi-rest:error');

/* GET home page. */
router.get('/', function(req, res, next) {
/*
    // var userlist;
    getKeyTitlesList()
    .then(userlist => {
        // var user = req.user ? req.user : undefined;
        res.render('test', {
            title: 'User List',
            userlist,
            // user: user
        });
    })
    .catch(err => { error('test page '+ err); next(err); });
    */
    if (req.user) res.json(req.user);
    else res.json({ reqDotUser: null });
});

var getKeyTitlesList = function() {
    return usersModel.keylist()
    .then(keylist => {
        var keyPromises = keylist.map((key: any) => {
            return usersModel.read(key).then(user => {
                return { userID: user.userID, username: user.username };
            });
        });
        return Promise.all(keyPromises);
    });
};

// module.exports = router;
export = router;
