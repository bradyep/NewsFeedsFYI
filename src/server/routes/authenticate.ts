import util = require('util');
import express = require("express");
export var router = express.Router();
import usersModel = require('../models/users-sequelize');
import logModule = require('debug');
const log = logModule('nffyi-rest:router-authenticate');
import errorModule = require('debug');
const error = errorModule('nffyi-rest:error');
import passport = require('passport');
import LocalStrategyModule = require('passport-local');
const LocalStrategy = LocalStrategyModule.Strategy;

// Define the User type to include 'id'
type User = {
  id: number;
  username: string;
  [key: string]: any;
};

export function initPassport(app: any) {
  app.use(passport.initialize());
  app.use(passport.session());
};

export function ensureAuthenticated(req: any, res: any, next: any) {
  log('*****Attempting Authentication with: ' + req.user);
  // req.user is set by Passport in the deserialize function
  if (req.user) next();
  else {
    // If not authenticated, redirect to login
    res.redirect('/users/login');
  }

  /*
  router.get('/logout', function(req, res, next) {
    req.logout();
    res.redirect('/');
  });
  */

  passport.use(new LocalStrategy(
    function (username, password, done) {
      log('passport used: ' + username + '/' + password);
      usersModel.userPasswordCheck(username, password)
        .then(check => {
          if (check.check) {
            log('******Supplied Credentials are Valid*********');
            done(null, { id: check.userid, username: check.username });
          } else {
            done(null, false, { message: check.message ?? "Authentication failed" });
          }
          return check;
        })
        .catch(err => done(err));
    }
  ));

  passport.serializeUser(function (user, done) {
    log('serializeUser: ' + util.inspect(user));
    done(null, user);
  });

  // passport.deserializeUser(function(id, done) {
  passport.deserializeUser(function (user: any, done) {
    log('deserializeUser: ' + util.inspect(user));
    usersModel.read(user.id)
      .then(user => {
        log('... found user ' + util.inspect(user));
        done(null, user);
      })
      .catch(err => done(err, user));
  });

}
// export var router = express.Router();
