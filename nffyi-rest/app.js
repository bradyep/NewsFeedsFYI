/*
interface Error {
    status?: number;
}
*/
"use strict";
// var express = require('express');
const express = require("express");
// var path = require('path');
const path = require("path");
// var logger = require('morgan');
const logger = require("morgan");
// var cookieParser = require('cookie-parser');
const cookieParser = require("cookie-parser");
// var bodyParser = require('body-parser');
const bodyParser = require("body-parser");
// Define Routes
// TODO: Convert to TS Module syntax once these are defined
// var index = require('./routes/index');
const index = require("./routes/index");
// var users = require('./routes/users');
const users = require("./routes/users");
const test = require("./routes/test");
var app = express();
// var thing = 'whee';
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
// Use Routes
app.use('/', index);
app.use('/users', users);
app.use('/test', test);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err;
    err = new Error('Not Found');
    err.status = 404;
    // err[status] = 404;
    // res.status(404);
    next(err);
});
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    // res.status(err[status] || 500);
    res.status(err.status || 500);
    // res.status(res.status || 500);
    res.render('error');
});
module.exports = app;
//# sourceMappingURL=app.js.map