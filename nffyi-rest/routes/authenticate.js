"use strict";
const util = require("util");
const express = require("express");
exports.router = express.Router();
const usersModel = require("../models/users-sequelize");
const logModule = require("debug");
const log = logModule('nffyi-rest:router-authenticate');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
const passport = require("passport");
const LocalStrategyModule = require("passport-local");
const LocalStrategy = LocalStrategyModule.Strategy;
function initPassport(app) {
    app.use(passport.initialize());
    app.use(passport.session());
}
exports.initPassport = initPassport;
;
function ensureAuthenticated(req, res, next) {
    log('*****Attempting Authentication with: ' + req.user);
    // req.user is set by Passport in the deserialize function
    if (req.user)
        next();
    else {
        // setTimeout(() => {
        // log('Giving it another chance');
        // if (req.user) next();
        // res.redirect('/users/login');
        let err;
        err = new Error('Not Authenticated');
        err.status = 401;
        next(err);
    }
}
exports.ensureAuthenticated = ensureAuthenticated;
;
exports.router.post('/', passport.authenticate('local'), function (req, res) {
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
passport.use(new LocalStrategy(function (username, password, done) {
    log('passport used: ' + username + '/' + password);
    usersModel.userPasswordCheck(username, password)
        .then(check => {
        if (check.check) {
            log('******Supplied Credentials are Valid*********');
            done(null, { id: check.userid, username: check.username });
        }
        else {
            done(null, false, check.message);
        }
        return check;
    })
        .catch(err => done(err));
}));
passport.serializeUser(function (user, done) {
    log('serializeUser: ' + util.inspect(user));
    done(null, user);
});
// passport.deserializeUser(function(id, done) {
passport.deserializeUser(function (user, done) {
    log('deserializeUser: ' + util.inspect(user));
    usersModel.read(user.id)
        .then(user => {
        log('... found user ' + util.inspect(user));
        done(null, user);
    })
        .catch(err => done(err, user));
});
// export var router = express.Router();
//# sourceMappingURL=authenticate.js.map