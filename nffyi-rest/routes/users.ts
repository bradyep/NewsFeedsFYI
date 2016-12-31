import express = require("express");
var router = express.Router();
import util = require('util');
// import User = require('../models/User');
import usersModel = require('../models/users-sequelize');
import logModule = require('debug');
  const log = logModule('nffyi-rest:users');
import errorModule = require('debug');
  const error = errorModule('nffyi-rest:error');

/* GET users listing. */
router.get('/', function(req, res, next) {
  // res.send('respond with a resource');
  res.json({ message: 'welcome to the users API'});
});

// POST new users
router.post('/', function(req, res, next) {
  /*
  let user = new User();
  user.userName = req.body.userName;
  user.password = req.body.password;
  user.email = req.body.email;
*/
  usersModel.create(req.body.userName, req.body.password, req.body.email)
  .then(user => {
    log('Attempted to create User: ' + util.inspect(user));
    res.json(user);
  })
  .catch(err => { next(err); });
});

// module.exports = router;
export = router;
