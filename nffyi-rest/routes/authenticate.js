"use strict";
const express = require("express");
exports.router = express.Router();
const usersModel = require("../models/users-sequelize");
const logModule = require("debug");
const log = logModule('nffyi-rest:router-authenticate');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
const passport = require('passport');
const LocalStrategyModule = require("passport-local");
const LocalStrategy = LocalStrategyModule.Strategy;
function initPassport(app) {
    app.use(passport.initialize());
    app.use(passport.session());
}
exports.initPassport = initPassport;
;
exports.router.post('/', passport.authenticate('local'), function (req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.redirect('/users/' + req.user.username);
});
var getKeyTitlesList = function () {
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
//# sourceMappingURL=authenticate.js.map