"use strict";
// var express = require('express');
const express = require("express");
var router = express.Router();
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});
router.get('/logout', function (req, res, next) {
    req.session.destroy(function (err) {
        // res.clearCookie('connect.sid');
        res.redirect('/'); //Inside a callback… bulletproof!
    });
    /*
      req.logout();
      res.redirect('/');
      */
});
module.exports = router;
//# sourceMappingURL=index.js.map