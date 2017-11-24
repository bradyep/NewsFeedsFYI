import express = require("express");
var router = express.Router();
import util = require('util');
import userFeedsModel = require('../models/userfeeds-sequelize');
import cachedNewsItemsModel = require('../models/cached-newsitems-sequelize');
import feedSourcesModel = require('../models/feedsources-sequelize');
import logModule = require('debug');
const log = logModule('nffyi-rest:router-userFeeds');
const error = logModule('nffyi-rest:error');
import authRouter = require('./authenticate');
import { UserFeedModel, CachedNewsItemModel } from '../../nffyi-common/models';
import { NUMBER_OF_COLUMNS } from '../../nffyi-common/constants/newsfeeds';
import pagesModel = require('../models/pages-sequelize');
import FeedSourceModel from '../models/FeedSourceModel';
import * as mobx from 'mobx';

interface ColumnDescriptor {
  columnNumber: number,
  userFeedCount: number
}

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
      const feedSourceIDs: Set<number> = userFeedList.map(ufl => ufl.feedSourceID);
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
var getUserFeeds = function (pageID: number): Promise<any> {
  return userFeedsModel.keylist(pageID)
    .then(keylist => {
      var keyPromises = keylist.map(key => {
        // return userFeedsModel.read(key, pageID)
        return userFeedsModel.readAsync(key, pageID)
          .then((userFeed: UserFeedModel) => {
            var usfm: UserFeedModel = new UserFeedModel(
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

var getCachedNewsItems = function (feedSourceIDs: Array<number>): any {
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

var getFeedSources = function (feedSourceIDs: Array<number>): any {
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
  let pageIDToUse = isPost ? req.body.pageID : req.params.pageid;

  pagesModel.keylist(userID)
    .then(keylist => {
      pageKeys = keylist;
      if (pageKeys.indexOf(+pageIDToUse) < 0) {
        let err: any = new Error('Not Authorized');
        err.status = 403;
        next(err);
      }
    })
    .catch(err => { error('router-user-feeds/authorization ' + err); next(err); });

  // /Authorize
};

// GET single UserFeed
router.get('/:feedsourceid/:pageid', (req, res, next) => {
  authorizeRequest(req, res, next, false);

  // userFeedsModel.read(req.params.feedsourceid, req.params.pageid)
  userFeedsModel.readAsync(req.params.feedsourceid, req.params.pageid)
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

async function createFeedSource(url: string): Promise<number> {
  log('[findFeedSourceID] Attempting to create new FeedSourceModel with url = ' + url);  
  let newFeedSourceModel: FeedSourceModel;
  // This is as good a place as any to populate the cachedNewsItems for this feedSource
  try {
    let newlyFetchedCachedNewsItems: CachedNewsItemModel[] = await userFeedsModel.getNewsItemsFromFeedAsync(url, 0);
    log('Got back ' + newlyFetchedCachedNewsItems.length + ' items from userFeedsModel.getNewsItemsFromFeedAsync');
    // Determine cachedTitle and cachedWebsiteURL
    const { feedSourceWebTitle } = newlyFetchedCachedNewsItems[0];
    const { feedSourceWebURL } = newlyFetchedCachedNewsItems[0];
    log('feedSourceWebTitle: ' + feedSourceWebTitle + ', feedSourceWebURL: ' + feedSourceWebURL);
    newFeedSourceModel = await feedSourcesModel.create(new FeedSourceModel(url, feedSourceWebTitle, feedSourceWebURL, new Date()));
    // Add the returned FeedSourceID to the cahcedNewsItems and commit them to the database
    newlyFetchedCachedNewsItems.forEach(cni => cni.feedSourceID = newFeedSourceModel.feedSourceID);
    const updateCachedNewsItemsReturn: string[] = await userFeedsModel.updateCachedNewsItemsAsync(newlyFetchedCachedNewsItems);
    log('Got back ' + updateCachedNewsItemsReturn.length + ' items from calling userFeedsModel.updateCachedNewsItemsAsync()');
  } catch (err) {
    error('[user-feeds.findFeedSourceID] Problem creating new FeedSourceModel: ' + err.toString());
  }

  log('We created a new FeedSourceModel and newFeedSourceModel.feedSourceID = ' + newFeedSourceModel.feedSourceID.toString());

  return newFeedSourceModel.feedSourceID;
}

async function findFeedSourceID(url: string): Promise<number> {
  log('[findFeedSourceID] Attempting to get existing userFeed for url = ' + url);
  let existingFeedSourceModel: FeedSourceModel;
  try {
    existingFeedSourceModel = await feedSourcesModel.getByURL(url);
  } catch (err) {
    error('[user-feeds.findFeedSourceID] Problem getting existing FeedSourceModel: ' + err.toString());
  }
  if (existingFeedSourceModel) { 
    log('Found existing source feed, existingFeedSourceModel.feedSourceID = ' + existingFeedSourceModel.feedSourceID);
    return existingFeedSourceModel.feedSourceID;
  };

  return await createFeedSource(url);
} // /function findFeedSourceID(): Promise<number> {

// POST new UserFeed
router.post('/', authRouter.ensureAuthenticated, function (req, res, next) {
  (async () => {
    log('Attempting to create new UserFeed');
    authorizeRequest(req, res, next, true);
    // body: "name=" + this.state.feedName + "&itemDisplayCount=" + this.state.itemsToDisplay + "&pageID=" + this.state.selectedPageID + "&feedURL=" + this.state.feedURL

    // Figure out what the column and displayOrder are going to be
    const userFeeds: UserFeedModel[] = await getUserFeeds(req.body.pageID);
    let columnDescriptors = new Array<ColumnDescriptor>();
    for (let i = 0; i < NUMBER_OF_COLUMNS; i++) {
      const currentColumnNumber: number = i + 1;
      const userFeedsInColumn = userFeeds.filter(uf => uf.column === currentColumnNumber);
      const numberOfUserFeedsInColumn = userFeedsInColumn ? userFeedsInColumn.length : 0;
      columnDescriptors.push({ columnNumber: currentColumnNumber, userFeedCount: numberOfUserFeedsInColumn });
    }
    if (columnDescriptors.length !== NUMBER_OF_COLUMNS) {
      error('ERROR: columnDescriptors.length = ' + columnDescriptors.length + ', NUMBER_OF_COLUMNS = ' + NUMBER_OF_COLUMNS + '. They should be the same.');
    }
    columnDescriptors.sort((a, b) => a.userFeedCount - b.userFeedCount);
    const columnID = columnDescriptors[0].columnNumber;
    const displayOrder = columnDescriptors[0].userFeedCount + 1;

    // Figure out what the feedSourceID is going to be
    const feedSourceID = await findFeedSourceID(req.body.feedURL);

    userFeedsModel.create(new UserFeedModel(columnID, displayOrder, req.body.name, req.body.itemDisplayCount, req.body.pageID, feedSourceID))
      .then(userFeed => {
        log('Attempted to create UserFeed: ' + util.inspect(userFeed));
        res.json(userFeed);
      })
      .catch(err => { next(err); });
  })();
}); // /router.post('/', authRouter.ensureAuthenticated, function (req, res, next) {

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
