/*
interface Error {
    status?: number;
}
*/

// var express = require('express');
import express = require("express");
// var path = require('path');
import path = require("path");
// var favicon = require('serve-favicon');
import favicon = require("serve-favicon");
// var logger = require('morgan');
import logger = require("morgan");
// var cookieParser = require('cookie-parser');
import cookieParser = require("cookie-parser");
// var bodyParser = require('body-parser');
import bodyParser = require("body-parser");

// Define Routes
// TODO: Convert to TS Module syntax once these are defined
// var index = require('./routes/index');
import index = require('./routes/index');
// var users = require('./routes/users');
import users = require('./routes/users');
import test = require('./routes/test');
import authenticate = require('./routes/authenticate');

var app = express();
// var thing = 'whee - this is a thino! here is some more text. I feel I am being watched!';
// console.log(thing);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

authenticate.initPassport(app);

// Use Routes
app.use('/', index);
app.use('/users', users);
app.use('/test', test);
app.use('/authenticate', authenticate.router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err:any;
  err = new Error('Not Found');
  err.status = 404;
  // err[status] = 404;
  // res.status(404);
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  // res.status(err[status] || 500);
  res.status(err.status || 500);
  // res.status(res.status || 500);
  res.render('error');
});

// module.exports = app;
export = app;
