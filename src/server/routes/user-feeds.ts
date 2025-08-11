import * as express from 'express';
const router = express.Router();
import * as util from 'util'
import userFeedsModel = require('server/models/userfeeds-sequelize');
import cachedNewsItemsModel = require('server/models/cached-newsitems-sequelize');
import feedSourcesModel = require('server/models/feedsources-sequelize');
import debug = require('debug');
const log = debug('nffyi-rest:router-userFeeds');
const error = debug('nffyi-rest:error');
import authRouter = require('./authenticate');
import { UserFeedModel, CachedNewsItemModel } from 'common/models';
import { NUMBER_OF_COLUMNS } from 'common/constants/newsfeeds';
import pagesModel = require('server/models/pages-sequelize');
import { FeedSourceModel } from 'server/models/FeedSourceModel';
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

/** GET UserFeeds By PageID */
router.get('/page/:pageid', function (req, res, next) {
  // authorizeRequest(req, res, next, false);

  getUserFeeds(+req.params.pageid)
    .then(userFeedList => {
      const feedSourceIDs: Set<number> = userFeedList.map((ufl: any) => ufl.feedSourceID);
      getCachedNewsItems([...feedSourceIDs])
        .then((cnis: any) => {
          // Place all cnis with their userFeeds
          userFeedList.map((uf: any) => {
            cnis.map((cni: any) => {
              if (uf.feedSourceID === cni.feedSourceID) {
                uf.newsItems.push(cni);
              }
            });
          });

          getFeedSources([...feedSourceIDs])
            .then(fss => {
              // Place FeedSource's CachedWebsiteURL onto the UserFeed's getFeedSources titleURL
              userFeedList.map((uf: any) => {
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

/** Returns all UserFeedModels for a given page id */
const getUserFeeds = (pageID: number): Promise<any> => {
  return userFeedsModel.getUserFeedsByPageID(pageID)
    .then(userFeeds => {
      const userFeedPromises = userFeeds.map((userFeed: any) => {
        // Update cached news items if needed
        return userFeedsModel.updateFeedSourceCachedNewsItemsIfNeeded(userFeed.feedSourceID)
          .then(() => {
            return new UserFeedModel(
              userFeed.column,
              userFeed.row,
              userFeed.name,
              userFeed.itemDisplayCount,
              userFeed.pageID,
              userFeed.feedSourceID,
              userFeed.titleURL || "",
              [], // newsItems - to be populated later
              userFeed.userFeedID
            );
          });
      });
      return Promise.all(userFeedPromises);
    });
};

/** Gets all CachedNewsItemModels associated with a supplied array of feedSourceIds */
const getCachedNewsItems = (feedSourceIDs: Array<number>): any => {
  return cachedNewsItemsModel.getKeysForMultipleFeedSourceID(feedSourceIDs)
    .then(keylist => {
      var keyPromises = keylist.map((key: any) => {
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

/** Returns an array of FeedSourceModels given an array of their IDs */
const getFeedSources = (feedSourceIDs: Array<number>): Promise<FeedSourceModel[]> => {
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

var authorizeRequest = function (req: any, res: any, next: any, isPost: boolean) {
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
router.get('/:userfeedid', (req, res, next) => {
  // TODO: Add authorization check
  
  userFeedsModel.readByUserFeedIDAsync(+req.params.userfeedid)
    .then(userFeed => {
      if (!userFeed) next();
      else {
        res.json(userFeed);
      }
    })
    .catch(err => { next(err); });
});

// Update existing UserFeed
router.put('/:userfeedid', authRouter.ensureAuthenticated, (req, res, next) => {
  log('Attempting to update existing UserFeed');
  log('Request params:', req.params);
  log('Request body:', req.body);
  // TODO: Add authorization check

  let updateUserFeed = new UserFeedModel(req.body.column, req.body.row, req.body.name, req.body.itemDisplayCount, req.body.pageID, req.body.feedSourceID, undefined, undefined, +req.params.userfeedid);
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
    let newlyFetchedCachedNewsItems: CachedNewsItemModel[] = await userFeedsModel.getNewsItemsFromFeedAsync(url, 0) ?? [];
    log('Got back ' + newlyFetchedCachedNewsItems.length + ' items from userFeedsModel.getNewsItemsFromFeedAsync');
    // Determine cachedTitle and cachedWebsiteURL
    const feedSourceWebTitle: string = newlyFetchedCachedNewsItems[0].feedSourceWebTitle ?? "No Title Found";
    const feedSourceWebURL: string = newlyFetchedCachedNewsItems[0].feedSourceWebURL ?? "No URL Found";
    log('feedSourceWebTitle: ' + feedSourceWebTitle + ', feedSourceWebURL: ' + feedSourceWebURL);
    newFeedSourceModel = await feedSourcesModel.create(new FeedSourceModel(url, feedSourceWebTitle, feedSourceWebURL, new Date()));
    // Add the returned FeedSourceID to the cachedNewsItems and commit them to the database
    newlyFetchedCachedNewsItems.forEach(cni => cni.feedSourceID = newFeedSourceModel.feedSourceID);
    const updateCachedNewsItemsReturn: string[] = await userFeedsModel.updateCachedNewsItemsAsync(newlyFetchedCachedNewsItems) ?? [];
    log('Got back ' + updateCachedNewsItemsReturn.length + ' items from calling userFeedsModel.updateCachedNewsItemsAsync()');

    log('We created a new FeedSourceModel and newFeedSourceModel.feedSourceID = ' + (newFeedSourceModel && newFeedSourceModel.feedSourceID !== undefined ? newFeedSourceModel.feedSourceID.toString() : 'undefined'));

    if (newFeedSourceModel.feedSourceID === undefined) {
      throw new Error('FeedSourceID is undefined after creating FeedSourceModel');
    }
    return newFeedSourceModel.feedSourceID;
  } catch (err) {
    error('[user-feeds.findFeedSourceID] Problem creating new FeedSourceModel: ' + err.toString());

    return 0;
  }
}

async function findFeedSourceID(url: string): Promise<number> {
  log('[findFeedSourceID] Attempting to get existing userFeed for url = ' + url);
  let existingFeedSourceModel: FeedSourceModel | undefined;
  try {
    existingFeedSourceModel = await feedSourcesModel.getByURL(url);

    if (existingFeedSourceModel) {
      log('Found existing source feed, existingFeedSourceModel.feedSourceID = ' + existingFeedSourceModel.feedSourceID);

      return existingFeedSourceModel.feedSourceID ?? 0;
    }
  } catch (err) {
    error('[user-feeds.findFeedSourceID] Problem getting existing FeedSourceModel: ' + err.toString());
  }

  return await createFeedSource(url);
} // /function findFeedSourceID(): Promise<number> {

// POST new UserFeed
router.post('/', authRouter.ensureAuthenticated, async function (req, res, next) {
  log('Attempting to create new UserFeed');
  authorizeRequest(req, res, next, true);
  // body: "name=" + this.state.feedName + "&itemDisplayCount=" + this.state.itemsToDisplay + "&pageID=" + this.state.selectedPageID + "&feedURL=" + this.state.feedURL

  // Figure out what the column and row are going to be
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
  const row = columnDescriptors[0].userFeedCount + 1;

  // Figure out what the feedSourceID is going to be
  const feedSourceID = await findFeedSourceID(req.body.feedURL);

  // We should also get the CachedNewsItemModels for this new UserFeed
  const cachedNewsItemsUpdated = userFeedsModel.updateFeedSourceCachedNewsItemsIfNeeded(feedSourceID);
  log('Cached News Items Updated: ' + cachedNewsItemsUpdated.toString());
  const cachedNewsItems: CachedNewsItemModel[] = await getCachedNewsItems([feedSourceID]);

  // It's confusing as hell, but we need to stick the newsItems in the userFeed.dataValues property
  userFeedsModel.create(new UserFeedModel(columnID, row, req.body.name, req.body.itemDisplayCount, req.body.pageID, feedSourceID))
    .then((userFeed: any) => {
      // userFeed.newsItems = cachedNewsItems;
      userFeed.dataValues.newsItems = new Array<CachedNewsItemModel>();
      userFeed.dataValues.newsItems.push(...cachedNewsItems);
      log('Attempted to create UserFeed: ' + util.inspect(userFeed));
      log('Number of CachedNewsItems: ' + userFeed.dataValues.newsItems.length);
      res.json(userFeed);
    })
    .catch(err => { next(err); });
}); // /router.post('/', authRouter.ensureAuthenticated, function (req, res, next) {

// DELETE existing UserFeed
router.delete('/:userfeedid', authRouter.ensureAuthenticated, (req, res, next) => {
  // TODO: Add authorization check
  log('Attempting to delete existing UserFeed');
  log('Request params:', req.params);

  userFeedsModel.destroyByUserFeedID(+req.params.userfeedid)
    .then(userFeed => {
      if (!userFeed) next();
      else res.json(userFeed);
    })
    .catch(err => { next(err); });
});

export = router;
