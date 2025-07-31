import util = require('util');
import express = require("express");
export var router = express.Router();
import usersModel = require('server/models/users-sequelize');
import logModule = require('debug');
const debug = logModule('nffyi-rest:router-authenticate');
const error = debug('nffyi-rest:error');
import passport = require('passport');
import LocalStrategyModule = require('passport-local');
const LocalStrategy = LocalStrategyModule.Strategy;

// Define the User type to match Express.User interface
type User = {
  userID: number;
  username: string;
  [key: string]: any;
};

export function initPassport(app: any) {
  app.use(passport.initialize());
  app.use(passport.session());
};

export function ensureAuthenticated(req: any, res: any, next: any) {
  debug('*****Attempting Authentication with: ' + req.user);
  // req.user is set by Passport in the deserialize function
  if (req.user) next();
  else {
    // If not authenticated, redirect to login
    res.redirect('/users/login');
  }
};

router.post('/',
  passport.authenticate('local'),
  function (req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    // res.redirect('/users/' + req.user.id);
    res.redirect('/users/' + req.user?.userID);
  });

passport.use(new LocalStrategy(
  function (username, password, done) {
    debug('passport used: ' + username + '/' + password);
    usersModel.userPasswordCheck(username, password)
      .then(check => {
        if (check.check) {
          debug('******Supplied Credentials are Valid*********');
          const user: User = { userID: check.userid, username: check.username };
          done(null, user);
        } else {
          done(null, false, { message: check.message ?? "Authentication failed" });
        }
        return check;
      })
      .catch(err => done(err));
  }
));

passport.serializeUser(function (user, done) {
  debug('serializeUser: ' + util.inspect(user));
  done(null, user);
});

// passport.deserializeUser(function(id, done) {
passport.deserializeUser(function (user: any, done) {
  debug('deserializeUser: ' + util.inspect(user));
  usersModel.read(user.userID)
    .then(user => {
      debug('... found user ' + util.inspect(user));
      done(null, user);
    })
    .catch(err => done(err, user));
});
// export var router = express.Router();
