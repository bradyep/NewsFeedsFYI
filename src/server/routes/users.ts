import * as express from "express";
var router = express.Router();
import * as util from 'util';
import * as usersModel from 'server/sequelize/users-sequelize';
import pagesModel = require('../sequelize/pages-sequelize');
import debug = require('debug');
const log = debug('nffyi-rest:router-users');
const error = debug('nffyi-rest:error');
import authenticateJwt = require('server/middleware/authenticate-jwt');
import { isOwnerOrAdmin } from 'server/middleware/authorize';
import { signupRateLimiter } from 'server/middleware/rate-limit';
import { UserModel, PageModel } from 'common/models';
import { DBUsers, Roles, MIN_PASSWORD_LENGTH } from 'common/constants';

/* GET users listing. */
router.get('/', authenticateJwt.populateUserIfPresent, function (req, res, next) {
  // Must be an admin for full User listing, otherwise display User data for requesting User
  if (!req.user) {
    // Return guest user
    usersModel.read(DBUsers.GUEST)
      .then(user => {
        if (!user) next();
        else res.json(user.toSafeObject());
      })
      .catch(err => { next(err); });
  } else {
    if (req.user.roleID === DBUsers.ADMIN) {
      // Just treat admin as a normal user for now
      res.redirect('/users/' + req.user.userID);
    } else {
      // Normal user
      res.redirect('/users/' + req.user.userID);
    }
  }
});

// GET single User
router.get('/:userid', authenticateJwt.ensureAuthenticated,
  isOwnerOrAdmin((req) => +req.params.userid),
  (req, res, next) => {
    usersModel.read(+req.params.userid)
      .then((user: UserModel) => {
        if (!user) next();
        else res.json(user.toSafeObject());
      })
      .catch(err => { next(err); });
  });

// Update existing User
router.put('/:userid', authenticateJwt.ensureAuthenticated,
  isOwnerOrAdmin((req) => +req.params.userid),
  (req, res, next) => {
    usersModel.update(+req.params.userid, req.body.username, req.body.password, req.body.email)
      .then(user => {
        if (!user) next();
        else res.json(new UserModel(user.username, '', user.email, user.roleID, user.userID, user.lastAccessDate).toSafeObject());
      })
      .catch(err => { next(err); });
  });

// POST new users
router.post('/', signupRateLimiter, function (req, res, next) {
  // This isn't authenticated since new users will use this to sign up.
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Username, password, and email are required.' });
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
  }
  return usersModel.create(new UserModel(username, password, email, Roles.USER))
    .then(user => {
      log('Attempted to create User: ' + util.inspect(user));
      const safeUser = new UserModel(user.username, '', user.email, user.roleID, user.userID, user.lastAccessDate).toSafeObject();
      // Create the first page for the new user in the database
      return pagesModel.create(new PageModel("My First Page", 1, user.userID))
        .then(page => {
          log('Attempted to create Page: ' + util.inspect(page));
          res.json(safeUser);
        })
        .catch(err => {
          error('Failed to create initial page for user: ' + err);
          res.json(safeUser);
        });
    })
    .catch(err => { next(err); });
});

// DELETE existing User
router.delete('/:userid', authenticateJwt.ensureAuthenticated,
  isOwnerOrAdmin((req) => +req.params.userid),
  (req, res, next) => {
    usersModel.destroy(+req.params.userid)
      .then(user => {
        if (!user) next();
        else res.json(new UserModel(user.username, '', user.email, user.roleID, user.userID, user.lastAccessDate).toSafeObject());
      })
      .catch(err => { next(err); });
  });

export = router;
