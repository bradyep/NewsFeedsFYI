import express = require("express");
export var router = express.Router();
import usersModel = require('../models/users-sequelize');
import logModule = require('debug');
  const log = logModule('nffyi-rest:router-authenticate');
import errorModule = require('debug');
  const error = errorModule('nffyi-rest:error');
const passport = require('passport');
import LocalStrategyModule = require('passport-local');
  const LocalStrategy = LocalStrategyModule.Strategy;

export function initPassport(app) {
  app.use(passport.initialize());
  app.use(passport.session());
};

router.post('/',
  passport.authenticate('local'),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.redirect('/users/' + req.user.username);
  });

var getKeyTitlesList = function() {
    return usersModel.keylist()
    .then(keylist => {
        var keyPromises = keylist.map(key => {
            return usersModel.read(key).then(user => {
                return { userID: user.userID, userName: user.userName };
            });
        });
        return Promise.all(keyPromises);
    });
};

// exports.router = router;
// export.router = router;
// export router;
// export = router;