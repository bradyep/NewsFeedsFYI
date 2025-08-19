import util = require('util');
import fs = require('fs-extra');
import jsyaml = require('js-yaml');
import { Sequelize, DataTypes } from "sequelize";
import debug = require('debug');
const log = debug('nffyi-rest:model-definition');
const error = debug('nffyi-rest:error');

var sequelize: Sequelize;
type ModelKeys = 'SQRole' | 'SQUser' | 'SQLink' | 'SQPage' | 'SQUserFeed' | 'SQFeedSource' | 'SQCachedNewsItem';
type ModelsType = {
  SQRole: any,
  SQUser: any,
  SQLink: any,
  SQPage: any,
  SQUserFeed: any,
  SQFeedSource: any,
  SQCachedNewsItem: any
};
var models: ModelsType = { SQRole: null, SQUser: null, SQLink: null, SQPage: null, SQUserFeed: null, SQFeedSource: null, SQCachedNewsItem: null };

export function connectDB(modelRequested: ModelKeys): Promise<any> {
  log('Requesting: ' + modelRequested + ' which is: ' + models[modelRequested]);
  if (models[modelRequested]) {
    // If the requested model is there, return a contrived Promise
    return new Promise((resolve, reject) => {
      resolve(models[modelRequested]);
    });
  }
  log('--Setting Up Database Connection--');
  return new Promise((resolve, reject) => {
    const sequelizeConnectPath = process.env.SEQUELIZE_CONNECT;
    if (!sequelizeConnectPath) {
      reject(new Error('Environment variable SEQUELIZE_CONNECT is not defined.'));
      return;
    }
    fs.readFile(sequelizeConnectPath, 'utf8', (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  })
    .then((yamltext: string) => {
      return jsyaml.load(yamltext);
    })
    .then((params: any) => {
      sequelize = new Sequelize(params.dbname, params.username, params.password, params.params);

      models.SQRole = sequelize.define('Role', {
        roleID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: DataTypes.STRING,
      }); // /SQRole

      models.SQUser = sequelize.define('User', {
        userID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        username: DataTypes.STRING,
        password: DataTypes.STRING,
        email: DataTypes.STRING,
        lastAccessDate: DataTypes.DATE
      }); // /SQUser
      models.SQUser.belongsTo(models.SQRole, { foreignKey: 'roleID' });
      models.SQRole.hasMany(models.SQUser, { as: 'Users', foreignKey: 'roleID' });

      models.SQLink = sequelize.define('Link', {
        linkID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        url: DataTypes.STRING,
        name: DataTypes.STRING,
        displayOrder: DataTypes.INTEGER
      }); // /SQLink
      models.SQLink.belongsTo(models.SQUser, { foreignKey: 'userID' });
      models.SQUser.hasMany(models.SQLink, { as: 'Links', foreignKey: 'userID' });

      models.SQPage = sequelize.define('Page', {
        pageID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: DataTypes.STRING,
        displayOrder: DataTypes.INTEGER
      }); // /SQPage
      models.SQPage.belongsTo(models.SQUser, { foreignKey: 'userID' });
      models.SQUser.hasMany(models.SQPage, { as: 'Pages', foreignKey: 'userID' });

      models.SQFeedSource = sequelize.define('FeedSource', {
        feedSourceID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        url: DataTypes.STRING,
        cachedTitle: DataTypes.STRING,
        cachedWebsiteURL: DataTypes.STRING,
        lastCachedDate: DataTypes.DATE
      }); // /SQFeedSource

      models.SQUserFeed = sequelize.define('UserFeed', {
        userFeedID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        column: DataTypes.INTEGER,
        row: DataTypes.INTEGER,
        name: DataTypes.STRING,
        itemDisplayCount: DataTypes.INTEGER
      }); // /SQUserFeed
      models.SQUserFeed.belongsTo(models.SQFeedSource, { foreignKey: 'feedSourceID' });
      models.SQUserFeed.belongsTo(models.SQPage, { foreignKey: 'pageID' });
      models.SQPage.hasMany(models.SQUserFeed, { as: 'UserFeeds', foreignKey: 'pageID' });
      models.SQFeedSource.hasMany(models.SQUserFeed, { as: 'UserFeeds', foreignKey: 'feedSourceID' });

      models.SQCachedNewsItem = sequelize.define('CachedNewsItem', {
        cachedNewsItemID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        title: DataTypes.STRING,
        link: DataTypes.STRING,
        description: DataTypes.STRING
      }); // /SQCachedNewsItem
      models.SQCachedNewsItem.belongsTo(models.SQFeedSource, { foreignKey: 'feedSourceID' });
      models.SQFeedSource.hasMany(models.SQCachedNewsItem, { as: 'CachedNewsItems', foreignKey: 'feedSourceID' });

      // We should call sequelize.sync(), not on individual models
      log('Calling sequelize.sync()');
      return sequelize.sync();
    }) // /params Promise
    .then(() => {
      // Auto-Populate Database with Roles
      log('--Creating Initial Data: Admin Role--');

      return models.SQRole.findOrCreate({
        where: {
          name: 'admin'
        },
        defaults: { // set the default properties if it doesn't exist
          name: 'admin', roleID: 1
        }
      })
    })
    .then(() => {
      // Auto-Populate Database with Roles
      log('--Creating Initial Data: Pro Role--');

      return models.SQRole.findOrCreate({
        where: {
          name: 'pro'
        },
        defaults: { // set the default properties if it doesn't exist
          name: 'pro', roleID: 2
        }
      })
    })
    .then(() => {
      // Auto-Populate Database with Roles
      log('--Creating Initial Data: User Role--');

      return models.SQRole.findOrCreate({
        where: {
          name: 'user'
        },
        defaults: { // set the default properties if it doesn't exist
          name: 'user', roleID: 3
        }
      })
    })
    .then(() => {
      // Auto-Populate Database with Roles
      log('--Creating Initial Data: Guest Role--');

      return models.SQRole.findOrCreate({
        where: {
          name: 'guest'
        },
        defaults: { // set the default properties if it doesn't exist
          name: 'guest', roleID: 4
        }
      })
    })
    .then(() => {
      // Auto-Populate Database with Users
      log('--Creating Initial Data: Guest User--');

      return models.SQUser.findOrCreate({
        where: {
          username: 'guest'
        },
        defaults: { // set the default properties if it doesn't exist
          username: 'guest', password: 'Passw0rd', email: 'guest@newsfeeds.fyi', lastAccessDate: Date(), roleID: 4, createdAt: Date(), updatedAt: Date()
        }
      })
    })
    .then(function ([instance, created]) {
      // Understand results of last findOrCreate
      // log(instance.get({ plain: true }));
      // log(created);

      log('--Creating Initial Data: Admin User--');
      return models.SQUser.findOrCreate({
        where: {
          username: 'admin'
        },
        defaults: { // set the default properties if it doesn't exist
          username: 'admin', password: 'Passw0rd', email: 'admin@newsfeeds.fyi', lastAccessDate: Date(), roleID: 1, createdAt: Date(), updatedAt: Date()
        }
      })
    })
    .then(function ([instance, created]) {
      // Understand results of last findOrCreate
      // log(instance.get({ plain: true }));
      // log(created);

      log('--Creating Initial Data: Pro User--');
      return models.SQUser.findOrCreate({
        where: {
          username: 'bradyep'
        },
        defaults: { // set the default properties if it doesn't exist
          username: 'bradyep', password: 'Passw0rd', email: 'bradyep@newsfeeds.fyi', lastAccessDate: Date(), roleID: 2, createdAt: Date(), updatedAt: Date()
        }
      })
    })
    .then(function ([instance, created]) {
      // Understand results of last findOrCreate
      // log(instance.get({ plain: true }));
      // log(created);

      log('--Creating Initial Data: Normal User--');
      return models.SQUser.findOrCreate({
        where: {
          username: 'joeuser'
        },
        defaults: { // set the default properties if it doesn't exist
          username: 'joeuser', password: 'Passw0rd', email: 'joeuser@newsfeeds.fyi', lastAccessDate: Date(), roleID: 3, createdAt: Date(), updatedAt: Date()
        }
      })
    })
    // Auto-Populate Database with Links
    .then(function ([instance, created]) {
      // log(instance.get({ plain: true }));
      // log(created);

      log('--Creating Initial Data: Link(Google Mail)--');
      return models.SQLink.findOrCreate({
        where: {
          url: 'https://mail.google.com/'
        },
        defaults: { // set the default properties if it doesn't exist
          userID: 3, url: 'https://mail.google.com/', name: 'GMail', displayOrder: 1
        }
      })
    })
    .then(function ([instance, created]) {
      // log(instance.get({ plain: true }));
      // log(created);

      log('--Creating Initial Data: Link(Google News)--');
      return models.SQLink.findOrCreate({
        where: {
          url: 'https://news.google.com/'
        },
        defaults: { // set the default properties if it doesn't exist
          userID: 3, url: 'https://news.google.com/', name: 'Google News', displayOrder: 2
        }
      })
    })
    .then(function ([instance, created]) {
      // log(instance.get({ plain: true }));
      // log(created);

      log('--Creating Initial Data: Link(Google Drive)--');
      return models.SQLink.findOrCreate({
        where: {
          url: 'https://drive.google.com/'
        },
        defaults: { // set the default properties if it doesn't exist
          userID: 3, url: 'https://drive.google.com/', name: 'Google Drive', displayOrder: 3
        }
      })
    })
    .then(function ([instance, created]) {
      // log(instance.get({ plain: true }));
      // log(created);

      log('--Creating Initial Data: Link(Google Keep)--');
      return models.SQLink.findOrCreate({
        where: {
          url: 'https://keep.google.com/'
        },
        defaults: { // set the default properties if it doesn't exist
          userID: 3, url: 'https://keep.google.com/', name: 'Google Keep', displayOrder: 4
        }
      })
    })
    // Create Guest Links
    .then(function ([instance, created]) {
      // log(instance.get({ plain: true }));
      // log(created);

      log('--Creating Initial Data: Link(Google)--');
      return models.SQLink.findOrCreate({
        where: {
          url: 'https://www.google.com/'
        },
        defaults: { // set the default properties if it doesn't exist
          userID: 1, url: 'https://www.google.com/', name: 'Google Search', displayOrder: 1
        }
      })
    })
    .then(function ([instance, created]) {
      // log(instance.get({ plain: true }));
      // log(created);

      log('--Creating Initial Data: Link(Facebook)--');
      return models.SQLink.findOrCreate({
        where: {
          url: 'https://www.facebook.com/'
        },
        defaults: { // set the default properties if it doesn't exist
          userID: 1, url: 'https://www.facebook.com/', name: 'Facebook', displayOrder: 2
        }
      })
    })
    .then(function ([instance, created]) {
      // log(instance.get({ plain: true }));
      // log(created);

      log('--Creating Initial Data: Link(Youtube)--');
      return models.SQLink.findOrCreate({
        where: {
          url: 'https://www.youtube.com/'
        },
        defaults: { // set the default properties if it doesn't exist
          userID: 1, url: 'https://www.youtube.com/', name: 'Youtube', displayOrder: 3
        }
      })
    })
    // Auto-Populate Database with Pages
    .then(function ([instance, created]) {
      log(instance.get({ plain: true }));
      log(created);

      log('--Creating Initial Data: Page(Guest Page One)--');
      return models.SQPage.findOrCreate({
        where: {
          pageID: 1, Name: 'Guest Page One'
        },
        defaults: { // set the default properties if it doesn't exist
          userID: 1, name: 'Guest Page One', displayOrder: 1
        }
      })
    })
    .then(function ([instance, created]) {
      log(instance.get({ plain: true }));
      log(created);

      log('--Creating Initial Data: Page(Pro Page One | General News)--');
      return models.SQPage.findOrCreate({
        where: {
          pageID: 2, Name: 'General News'
        },
        defaults: { // set the default properties if it doesn't exist
          userID: 3, name: 'General News', displayOrder: 1
        }
      })
    })
    .then(function ([instance, created]) {
      log(instance.get({ plain: true }));
      log(created);

      log('--Creating Initial Data: Page(Pro Page Two | Development)--');
      return models.SQPage.findOrCreate({
        where: {
          pageID: 3, Name: 'Development'
        },
        defaults: { // set the default properties if it doesn't exist
          userID: 3, name: 'Development', displayOrder: 2
        }
      })
    })
    .then(function ([instance, created]) {
      log(instance.get({ plain: true }));
      log(created);

      log('--Creating Initial Data: Page(Pro Page Three | Design)--');
      return models.SQPage.findOrCreate({
        where: {
          pageID: 4, Name: 'Design'
        },
        defaults: { // set the default properties if it doesn't exist
          userID: 3, name: 'Design', displayOrder: 3
        }
      })
    })
    // Auto-Populate Database with Feed Sources
    .then(function ([instance, created]) {
      log(instance.get({ plain: true }));
      log(created);

      log('--Creating Initial Data: FeedSource(BBC World News)--');
      return models.SQFeedSource.findOrCreate({
        where: {
          url: 'http://feeds.bbci.co.uk/news/world/rss.xml', feedSourceID: 1
        },
        defaults: { // set the default properties if it doesn't exist
          cachedTitle: 'BBC World News', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', cachedWebsiteURL: 'http://www.bbc.com/news/world', lastCachedDate: new Date('2017-09-15 16:43:08.669 +00:00')
        }
      })
    })
    .then(function ([instance, created]) {
      log(instance.get({ plain: true }));
      log(created);

      log('--Creating Initial Data: FeedSource(NYTimes US News)--');
      return models.SQFeedSource.findOrCreate({
        where: {
          url: 'http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', feedSourceID: 2
        },
        defaults: { // set the default properties if it doesn't exist
          cachedTitle: 'NYTimes US News', url: 'http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', cachedWebsiteURL: 'https://www.nytimes.com/section/us', lastCachedDate: new Date('2017-09-15 16:43:08.669 +00:00')
        }
      })
    })
    .then(function ([instance, created]) {
      log(instance.get({ plain: true }));
      log(created);

      log('--Creating Initial Data: FeedSource(ESPN)--');
      return models.SQFeedSource.findOrCreate({
        where: {
          url: 'https://www.espn.com/espn/rss/news', feedSourceID: 3
        },
        defaults: { // set the default properties if it doesn't exist
          cachedTitle: 'ESPN', url: 'https://www.espn.com/espn/rss/news', cachedWebsiteURL: 'https://www.espn.com/', lastCachedDate: new Date('2025-08-18 16:43:08.669 +00:00')
        }
      })
    })
    .then(function ([instance, created]) {
      log(instance.get({ plain: true }));
      log(created);

      log('--Creating Initial Data: FeedSource(Hacker News)--');
      return models.SQFeedSource.findOrCreate({
        where: {
          url: 'https://news.ycombinator.com/rss', feedSourceID: 4
        },
        defaults: { // set the default properties if it doesn't exist
          cachedTitle: 'Hacker News', url: 'https://news.ycombinator.com/rss', cachedWebsiteURL: 'https://news.ycombinator.com/', lastCachedDate: new Date('2017-09-15 16:43:08.669 +00:00')
        }
      })
    })

    // Auto-Populate Database with User Feeds
    .then(function ([instance, created]) {
      log(instance.get({ plain: true }));
      log(created);

      log('--Creating Initial Data: UserFeed(BBC World News)--');
      return models.SQUserFeed.findOrCreate({
        where: {
          pageID: 1, Name: 'BBC World News'
        },
        defaults: { // set the default properties if it doesn't exist
          pageID: 1, feedSourceID: 1, name: 'BBC World News', column: 1, row: 1, itemDisplayCount: 3
        }
      })
    })
    .then(function ([instance, created]) {
      log(instance.get({ plain: true }));
      log(created);

      log('--Creating Initial Data: UserFeed(NYTimes US News)--');
      return models.SQUserFeed.findOrCreate({
        where: {
          pageID: 1, Name: 'NYTimes US News'
        },
        defaults: { // set the default properties if it doesn't exist
          pageID: 1, feedSourceID: 2, name: 'NYTimes US News', column: 2, row: 1, itemDisplayCount: 3
        }
      })
    })
    .then(function ([instance, created]) {
      log(instance.get({ plain: true }));
      log(created);

      log('--Creating Initial Data: UserFeed(ESPN)--');
      return models.SQUserFeed.findOrCreate({
        where: {
          pageID: 1, Name: 'ESPN'
        },
        defaults: { // set the default properties if it doesn't exist
          pageID: 1, feedSourceID: 3, name: 'ESPN', column: 3, row: 1, itemDisplayCount: 3
        }
      })
    })
    .then(function ([instance, created]) {
      log(instance.get({ plain: true }));
      log(created);

      log('--Creating Initial Data: UserFeed(Hacker News)--');
      return models.SQUserFeed.findOrCreate({
        where: {
          pageID: 2, Name: 'Hacker News'
        },
        defaults: { // set the default properties if it doesn't exist
          pageID: 2, feedSourceID: 4, name: 'Hacker News', column: 1, row: 1, itemDisplayCount: 3
        }
      })
    })
    // Return the entire model
    .then(function ([instance, created]) {
      // Understand results of last findOrCreate
      log(instance.get({ plain: true }));
      log(created);

      return new Promise((resolve, reject) => {
        resolve(models[modelRequested]);
      });
    })
    .catch(err => error(err));
}; // /function connectDB
