import express = require("express");
var router = express.Router();
import util = require('util');
import pagesModel = require('../sequelize/pages-sequelize');
import debug = require('debug');
const log = debug('nffyi-rest:router-pages');
const error = debug('nffyi-rest:error');
import authRouter = require('./authenticate');
import { PageModel, UserModel } from '../../common/models';

/* GET all Pages for requesting User */
router.get('/', function(req, res, next) {
  let userID: number = req.user ? req.user.userID : 1;
  getKeyList(userID)
  .then(pageList => {
      res.json(pageList);
  })
  .catch(err => { error('router-pages ' + err); next(err); });
});

var getKeyList = function(userID: number) {
    return pagesModel.keylist(userID)
    .then(keylist => {
        var keyPromises = keylist.map((key: any) => {
            return pagesModel.read(key).then(page => {
                return new PageModel ( 
                  page.name,
                  page.displayOrder,
                  page.userID,
                  page.pageID
                );
            });
        });
        return Promise.all(keyPromises);
    });
};

// GET single Page
router.get('/:pageid', (req, res, next) => {
  let userID: number = req.user ? req.user.userID : 1;
  pagesModel.read(req.params.pageid)
  .then(page => {
    if (!page) next();
    else { 
      // Authorize
        if (userID === page.userID || req.user && req.user.userID === 2) {
          res.json(page);
        } else {
            let err:any = new Error('Not Authenticated');
            err.status = 403;
            next(err);
        }
    }
  })
  .catch(err => { next(err); });
});

// Update existing Page
router.put('/:pageid', authRouter.ensureAuthenticated, (req, res, next) => {
  let userID: number = req.user ? req.user.userID : 1;
  // Authorize
  if (userID === req.body.userID || req.user && req.user.userID === 2) {
    let updatePage = new PageModel(req.body.name, req.body.displayOrder, req.body.userID, +req.params.pageid);
    pagesModel.update(updatePage)
    .then(page => {
      if (!page) next();
      else res.json(page);
  })
  .catch(err => { next(err); });
  } else {
    let err:any = new Error('Not Authenticated');
    err.status = 403;
    next(err);
  }
});

// POST new Page
router.post('/', authRouter.ensureAuthenticated, function(req, res, next) {
  let userID: number = req.user ? req.user.userID : 1;
  // Authorize
  if (userID === req.body.userID || req.user && req.user.userID === 2) {
    pagesModel.create(new PageModel(req.body.name, req.body.displayOrder, userID))
    .then(page => {
      log('Attempted to create Page: ' + util.inspect(page));
      res.json(page);
    })
    .catch(err => { next(err); });
  } else {
    let err:any = new Error('Not Authenticated');
    err.status = 403;
    next(err);
  }
});

// DELETE existing Page
router.delete('/:pageid', authRouter.ensureAuthenticated, (req, res, next) => {
  let userID:number = req.user ? req.user.userID : 1;
  // Authorize
  if (userID === req.body.userID || req.user && req.user.userID === 2) {
    pagesModel.destroy(req.params.pageid)
    .then(page => {
      if (!page) next();
      else res.json(page);
    })
    .catch(err => { next(err); });
  } else {
    let err:any = new Error('Not Authenticated');
    err.status = 403;
    next(err);
  }
});

export = router;
