"use strict";
const express = require("express");
var router = express.Router();
const util = require("util");
const userFeedsModel = require("../models/userFeeds-sequelize");
const logModule = require("debug");
const log = logModule('nffyi-rest:router-userFeeds');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
const authRouter = require("./authenticate");
const UserFeed = require("../models/UserFeed");
const pagesModel = require("../models/pages-sequelize");
/* GET all UserFeeds for requesting User */
// NOTE: We probably do not need this
/*
router.get('/', function(req, res, next) {
  let userID:number = req.user ? req.user.userID : 1;
  getKeyList(userID)
  .then(userFeedList => {
      res.json(userFeedList);
  })
  .catch(err => { error('router-userFeeds ' + err); next(err); });
});
*/
// GET UserFeeds By PageID
router.get('/page/:pageid', function (req, res, next) {
    authorizeRequest(req, res, next, false);
    getKeyList(req.params.pageid)
        .then(userFeedList => {
        res.json(userFeedList);
    })
        .catch(err => { error('router-userFeeds ' + err); next(err); });
});
var getKeyList = function (pageID) {
    return userFeedsModel.keylist(pageID)
        .then(keylist => {
        var keyPromises = keylist.map(key => {
            return userFeedsModel.read(key, pageID).then(userFeed => {
                return new UserFeed(userFeed.column, userFeed.displayOrder, userFeed.name, userFeed.itemDisplayCount, userFeed.pageID, userFeed.feedSourceID);
            });
        });
        return Promise.all(keyPromises);
    });
};
var authorizeRequest = function (req, res, next, isPost) {
    // Authorize - Page should be associated with current User
    let userID = req.user ? req.user.userID : 1;
    let pageKeys;
    let pageIDToUse = isPost ? req.body.pageid : req.params.pageid;
    pagesModel.keylist(userID)
        .then(keylist => {
        pageKeys = keylist;
    })
        .catch(err => { error('router-user-feeds/authorization ' + err); next(err); });
    if (pageKeys.indexOf(pageIDToUse) < 0) {
        let err = new Error('Not Authorized');
        err.status = 403;
        next(err);
    }
    // /Authorize
};
// GET single UserFeed
router.get('/:feedsourceid/:pageid', (req, res, next) => {
    authorizeRequest(req, res, next, false);
    userFeedsModel.read(req.params.feedsourceid, req.params.pageid)
        .then(userFeed => {
        if (!userFeed)
            next();
        else {
            res.json(userFeed);
        }
    })
        .catch(err => { next(err); });
});
// Update existing UserFeed
router.put('/:feedsourceid/:pageid', authRouter.ensureAuthenticated, (req, res, next) => {
    authorizeRequest(req, res, next, false);
    let updateUserFeed = new UserFeed(req.body.column, req.body.displayOrder, req.body.name, req.body.itemDisplayCount, req.params.pageid, req.params.feedsourceid);
    userFeedsModel.update(updateUserFeed)
        .then(userFeed => {
        if (!userFeed)
            next();
        else
            res.json(userFeed);
    })
        .catch(err => { next(err); });
});
// POST new UserFeed
router.post('/', authRouter.ensureAuthenticated, function (req, res, next) {
    authorizeRequest(req, res, next, true);
    userFeedsModel.create(new UserFeed(req.body.column, req.body.displayOrder, req.body.name, req.body.itemDisplayCount, req.body.pageID, req.body.feedSourceID))
        .then(userFeed => {
        log('Attempted to create UserFeed: ' + util.inspect(userFeed));
        res.json(userFeed);
    })
        .catch(err => { next(err); });
});
// DELETE existing UserFeed
router.delete('/:feedsourceid/:pageid', authRouter.ensureAuthenticated, (req, res, next) => {
    authorizeRequest(req, res, next, false);
    userFeedsModel.destroy(req.params.feedsourceid, req.params.pageid)
        .then(userFeed => {
        if (!userFeed)
            next();
        else
            res.json(userFeed);
    })
        .catch(err => { next(err); });
});
module.exports = router;
//# sourceMappingURL=user-feeds.js.map