import util  = require('util');
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

export function initPassport(app) {
  app.use(passport.initialize());
  app.use(passport.session());
};

export function ensureAuthenticated (req, res, next) {
  // req.user is set by Passport in the deserialize function
  if (req.user) next();
  else { 
        // res.redirect('/users/login');
        let err:any;
        err = new Error('Not Authenticated');
        err.status = 403;
        next(err);
   }
};

router.post('/',
  passport.authenticate('local'),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.redirect('/users/' + req.user.id);
  });

/*
router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});
*/

passport.use(new LocalStrategy(
  function(username, password, done) {
    log('pasport used: '+ username +'/'+ password);
    usersModel.userPasswordCheck(username, password)
    .then(check => {
      if (check.check) {
        done(null, { id: check.userid, username: check.username });
      } else {
        done(null, false, check.message);
      }
      return check;
    })
    .catch(err => done(err));
  }
));

passport.serializeUser(function(user, done) {
  log('serializeUser: '+ util.inspect(user));
  done(null, user);
});

// passport.deserializeUser(function(id, done) {
passport.deserializeUser(function(user:any, done) {
  log('deserializeUser: '+ util.inspect(user));
  usersModel.read(user.id)
  .then(user => {
    log('... found user '+ util.inspect(user));
    done(null, user);
  })
  .catch(err => done(err, user));
});

// export var router = express.Router();
