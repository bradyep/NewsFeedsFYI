// var express = require('express');
import * as express from "express";
var router = express.Router();
import * as logModule from "debug";
  const log = logModule('nffyi-rest:router-index');
// import errorModule = require('debug');
  const error = logModule('nffyi-rest:error');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/logout', function(req, res, next) {
/*
  req.session.destroy(function(err) {
    if (err) {
      error(err);
    } else {
      res.clearCookie('connect.sid');
      res.redirect('/');
    }
  });
  */
  // req.session.destroy(function (err) {
  //   // res.clearCookie('connect.sid');
  //   res.redirect('/'); //Inside a callback… bulletproof!
  // });

  req.logout();
  res.redirect('/');
});

// module.exports = router;
export = router;
