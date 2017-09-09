"use strict";
const express = require("express");
var router = express.Router();
const util = require("util");
const userFeedsModel = require("../models/userFeeds-sequelize");
const cachedNewsItemsModel = require("../models/cached-newsitems-sequelize");
const feedSourcesModel = require("../models/feedsources-sequelize");
const logModule = require("debug");
const log = logModule('nffyi-rest:router-userFeeds');
// import errorModule = require('debug');
const error = logModule('nffyi-rest:error');
const authRouter = require("./authenticate");
// import UserFeedModel = require('../models/UserFeed');
const models_1 = require("../../nffyi-common/models");
const pagesModel = require("../models/pages-sequelize");
const FeedSourceModel = require("../models/FeedSourceModel");
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
    // authorizeRequest(req, res, next, false);
    getUserFeeds(req.params.pageid)
        .then(userFeedList => {
        const feedSourceIDs = userFeedList.map(ufl => ufl.feedSourceID);
        getCachedNewsItems([...feedSourceIDs])
            .then(cnis => {
            // Place all cnis with their userFeeds
            userFeedList.map(uf => {
                cnis.map(cni => {
                    if (uf.feedSourceID === cni.feedSourceID) {
                        uf.newsItems.push(cni);
                    }
                });
            });
            getFeedSources([...feedSourceIDs])
                .then(fss => {
                // Place FeedSource's CachedWebsiteURL onto the UserFeed's getFeedSources titleURL
                userFeedList.map(uf => {
                    fss.map(fs => {
                        if (uf.feedSourceID === fs.feedSourceID) {
                            uf.titleURL = fs.cachedWebsiteURL;
                        }
                    });
                });
                res.json(userFeedList);
            });
        });
    })
        .catch(err => { error('router-userFeeds ' + err); next(err); });
});
// We are returning as type 'any', but this actually returns an array of UserFeedModel
var getUserFeeds = function (pageID) {
    return userFeedsModel.keylist(pageID)
        .then(keylist => {
        var keyPromises = keylist.map(key => {
            return userFeedsModel.read(key, pageID)
                .then(userFeed => {
                var usfm = new models_1.UserFeedModel(userFeed.column, userFeed.displayOrder, userFeed.name, userFeed.itemDisplayCount, userFeed.pageID, userFeed.feedSourceID, userFeed.titleURL);
                return usfm;
            });
        });
        return Promise.all(keyPromises);
    });
};
var getCachedNewsItems = function (feedSourceIDs) {
    return cachedNewsItemsModel.getKeysForMultipleFeedSourceID(feedSourceIDs)
        .then(keylist => {
        var keyPromises = keylist.map(key => {
            return cachedNewsItemsModel.read(key)
                .then(cni => {
                var cnim = new models_1.CachedNewsItemModel(cni.title, cni.link, cni.description, cni.feedSourceID, cni.cachedNewsItemID);
                return cnim;
            });
        });
        return Promise.all(keyPromises);
    });
};
var getFeedSources = function (feedSourceIDs) {
    var keyPromises = feedSourceIDs.map(key => {
        return feedSourcesModel.read(key)
            .then(fs => {
            var fsm = new FeedSourceModel(fs.url, fs.cachedTitle, fs.cachedWebsiteURL, fs.lastCachedDate, fs.feedSourceID);
            return fsm;
        });
    });
    return Promise.all(keyPromises);
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
    let updateUserFeed = new models_1.UserFeedModel(req.body.column, req.body.displayOrder, req.body.name, req.body.itemDisplayCount, req.params.pageid, req.params.feedsourceid);
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
    userFeedsModel.create(new models_1.UserFeedModel(req.body.column, req.body.displayOrder, req.body.name, req.body.itemDisplayCount, req.body.pageID, req.body.feedSourceID))
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