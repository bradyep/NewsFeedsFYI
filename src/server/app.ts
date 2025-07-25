import express = require("express");
import path = require("path");
import favicon = require("serve-favicon");
import logger = require("morgan");
import cookieParser = require("cookie-parser");
import bodyParser = require("body-parser");
import session = require('express-session')
// import FileStoreModule = require('session-file-store');
  // const FileStore = FileStoreModule(session);

// Define Routes
import index = require('./routes/index');
import users = require('./routes/users');
import links = require('./routes/links');
import pages = require('./routes/pages');
import userFeeds = require('./routes/user-feeds');
// import test = require('./routes/test');
import authenticate = require('./routes/authenticate');

var app = express();
// var thing = 'whee - this is a thino! here is some more text. I feel I am being watched!';
// console.log(thing);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// cors
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3030");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*
// session-file-store is garbage!
app.use(session({
  store: new FileStore({
    path: "sessions",
    logFn: function(){}
  }),
  secret: 'this is a picture',
  resave: true,
  saveUninitialized: true,
  name: 'connect.sid'
}));
*/

app.use(session({ 
  secret: 'this is a picture', 
  resave: true,
  saveUninitialized: true
 }));

authenticate.initPassport(app);

// Use Routes
// app.use('/', index);
app.use('/users', users);
app.use('/links', links);
app.use('/pages', pages);
app.use('/userfeeds', userFeeds);
// app.use('/test', test);
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
app.use(function(err: any, req: any, res: any, next: any) {
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
