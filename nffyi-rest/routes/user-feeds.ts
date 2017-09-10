import express = require("express");
var router = express.Router();
import util = require('util');
import userFeedsModel = require('../models/userfeeds-sequelize');
import cachedNewsItemsModel = require('../models/cached-newsitems-sequelize');
import feedSourcesModel = require('../models/feedsources-sequelize');
import logModule = require('debug');
const log = logModule('nffyi-rest:router-userFeeds');
// import errorModule = require('debug');
const error = logModule('nffyi-rest:error');
import authRouter = require('./authenticate');
// import UserFeedModel = require('../models/UserFeed');
import { UserFeedModel, CachedNewsItemModel } from '../../nffyi-common/models';
import pagesModel = require('../models/pages-sequelize');
import FeedSourceModel from '../models/FeedSourceModel';
import * as mobx from 'mobx';

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
      const feedSourceIDs:Set<number> = userFeedList.map(ufl => ufl.feedSourceID);
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
var getUserFeeds = function (pageID: number):any {
  return userFeedsModel.keylist(pageID)
    .then(keylist => {
      var keyPromises = keylist.map(key => {
        return userFeedsModel.read(key, pageID)
          .then(userFeed => {
            var usfm = new UserFeedModel(
              userFeed.column,
              userFeed.displayOrder,
              userFeed.name,
              userFeed.itemDisplayCount,
              userFeed.pageID,
              userFeed.feedSourceID,
              userFeed.titleURL
            );

            return usfm;
          }); 
      }); 
      return Promise.all(keyPromises);
    }); 
};

var getCachedNewsItems = function (feedSourceIDs: Array<number>):any {
  return cachedNewsItemsModel.getKeysForMultipleFeedSourceID(feedSourceIDs)
  .then(keylist => {
    var keyPromises = keylist.map(key => {
      return cachedNewsItemsModel.read(key)
        .then(cni => {
          var cnim = new CachedNewsItemModel(
            cni.title,
            cni.link,
            cni.description,
            cni.feedSourceID,
            cni.cachedNewsItemID
          );
          return cnim;
        }); 
    }); 
    return Promise.all(keyPromises);
  }); 
};

var getFeedSources = function (feedSourceIDs: Array<number>):any {
  var keyPromises = feedSourceIDs.map(key => {
    return feedSourcesModel.read(key)
      .then(fs => {
        var fsm = new FeedSourceModel(
          fs.url,
          fs.cachedTitle,
          fs.cachedWebsiteURL,
          fs.lastCachedDate,
          fs.feedSourceID
        );
        return fsm;
      }); 
  }); 
  return Promise.all(keyPromises);
};

var authorizeRequest = function (req, res, next, isPost: boolean) {
  // Authorize - Page should be associated with current User
  let userID: number = req.user ? req.user.userID : 1;
  let pageKeys: Array<number>;
  let pageIDToUse = isPost ? req.body.pageid : req.params.pageid;
  pagesModel.keylist(userID)
    .then(keylist => {
      pageKeys = keylist;
    })
    .catch(err => { error('router-user-feeds/authorization ' + err); next(err); });

  if (pageKeys.indexOf(pageIDToUse) < 0) {
    let err: any = new Error('Not Authorized');
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
      if (!userFeed) next();
      else {
        res.json(userFeed);
      }
    })
    .catch(err => { next(err); });
});

// Update existing UserFeed
router.put('/:feedsourceid/:pageid', authRouter.ensureAuthenticated, (req, res, next) => {
  authorizeRequest(req, res, next, false);

  let updateUserFeed = new UserFeedModel(req.body.column, req.body.displayOrder, req.body.name, req.body.itemDisplayCount, req.params.pageid, req.params.feedsourceid);
  userFeedsModel.update(updateUserFeed)
    .then(userFeed => {
      if (!userFeed) next();
      else res.json(userFeed);
    })
    .catch(err => { next(err); });
});

// POST new UserFeed
router.post('/', authRouter.ensureAuthenticated, function (req, res, next) {
  authorizeRequest(req, res, next, true);

  userFeedsModel.create(new UserFeedModel(req.body.column, req.body.displayOrder, req.body.name, req.body.itemDisplayCount, req.body.pageID, req.body.feedSourceID))
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
      if (!userFeed) next();
      else res.json(userFeed);
    })
    .catch(err => { next(err); });
});

export = router;
