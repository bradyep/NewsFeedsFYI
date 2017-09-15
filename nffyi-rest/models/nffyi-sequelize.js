"use strict";
const fs = require("fs-extra");
const jsyaml = require("js-yaml");
const Sequelize = require("sequelize");
const logModule = require("debug");
const log = logModule('nffyi-rest:model-definition');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
var sequelize;
var models = { SQRole: null, SQUser: null, SQLink: null, SQPage: null, SQUserFeed: null, SQFeedSource: null, SQCachedNewsItem: null };
function connectDB(modelRequested) {
    log('Requesting: ' + modelRequested + ' which is: ' + models[modelRequested]);
    if (models[modelRequested]) {
        return new Promise((resolve, reject) => {
            resolve(models[modelRequested]);
        });
    }
    log('--Setting Up Database Connection--');
    return new Promise((resolve, reject) => {
        fs.readFile(process.env.SEQUELIZE_CONNECT, 'utf8', (err, data) => {
            if (err)
                reject(err);
            else
                resolve(data);
        });
    })
        .then(yamltext => {
        return jsyaml.safeLoad(yamltext, 'utf8');
    })
        .then(params => {
        sequelize = new Sequelize(params.dbname, params.username, params.password, params.params);
        models.SQRole = sequelize.define('Role', {
            roleID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            name: Sequelize.STRING,
        }); // /SQRole
        models.SQUser = sequelize.define('User', {
            userID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            username: Sequelize.STRING,
            password: Sequelize.STRING,
            email: Sequelize.STRING,
            lastAccessDate: Sequelize.DATE
        }); // /SQUser
        models.SQUser.belongsTo(models.SQRole, { foreignKey: 'roleID' });
        models.SQRole.hasMany(models.SQUser, { as: 'Users', foreignKey: 'roleID' });
        models.SQLink = sequelize.define('Link', {
            linkID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            url: Sequelize.STRING,
            name: Sequelize.STRING,
            displayOrder: Sequelize.INTEGER
        }); // /SQLink
        models.SQLink.belongsTo(models.SQUser, { foreignKey: 'userID' });
        models.SQUser.hasMany(models.SQLink, { as: 'Links', foreignKey: 'userID' });
        models.SQPage = sequelize.define('Page', {
            pageID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            name: Sequelize.STRING,
            displayOrder: Sequelize.INTEGER
        }); // /SQPage
        models.SQPage.belongsTo(models.SQUser, { foreignKey: 'userID' });
        models.SQUser.hasMany(models.SQPage, { as: 'Pages', foreignKey: 'userID' });
        models.SQFeedSource = sequelize.define('FeedSource', {
            feedSourceID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            url: Sequelize.STRING,
            cachedTitle: Sequelize.STRING,
            cachedWebsiteURL: Sequelize.STRING,
            lastCachedDate: Sequelize.DATE
        }); // /SQFeedSource
        models.SQUserFeed = sequelize.define('UserFeed', {
            column: Sequelize.INTEGER,
            displayOrder: Sequelize.INTEGER,
            name: Sequelize.STRING,
            itemDisplayCount: Sequelize.INTEGER
        }); // /SQUserFeed
        models.SQUserFeed.belongsTo(models.SQFeedSource, { foreignKey: 'feedSourceID' });
        models.SQUserFeed.belongsTo(models.SQPage, { foreignKey: 'pageID' });
        models.SQPage.hasMany(models.SQUserFeed, { as: 'UserFeeds', foreignKey: 'pageID' });
        models.SQFeedSource.hasMany(models.SQUserFeed, { as: 'UserFeeds', foreignKey: 'feedSourceID' });
        models.SQCachedNewsItem = sequelize.define('CachedNewsItem', {
            cachedNewsItemID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            title: Sequelize.STRING,
            link: Sequelize.STRING,
            description: Sequelize.STRING
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
            defaults: {
                name: 'admin', roleID: 1
            }
        });
    })
        .then(() => {
        // Auto-Populate Database with Roles
        log('--Creating Initial Data: Pro Role--');
        return models.SQRole.findOrCreate({
            where: {
                name: 'pro'
            },
            defaults: {
                name: 'pro', roleID: 2
            }
        });
    })
        .then(() => {
        // Auto-Populate Database with Roles
        log('--Creating Initial Data: User Role--');
        return models.SQRole.findOrCreate({
            where: {
                name: 'user'
            },
            defaults: {
                name: 'user', roleID: 3
            }
        });
    })
        .then(() => {
        // Auto-Populate Database with Roles
        log('--Creating Initial Data: Guest Role--');
        return models.SQRole.findOrCreate({
            where: {
                name: 'guest'
            },
            defaults: {
                name: 'guest', roleID: 4
            }
        });
    })
        .then(() => {
        // Auto-Populate Database with Users
        log('--Creating Initial Data: Guest User--');
        return models.SQUser.findOrCreate({
            where: {
                username: 'guest'
            },
            defaults: {
                username: 'guest', password: 'Passw0rd', email: 'guest@newsfeeds.fyi', lastAccessDate: Date(), roleID: 'guest', createdAt: Date(), updatedAt: Date()
            }
        });
    })
        .then(function ([instance, created]) {
        // Understand results of last findOrCreate
        log(instance.get({ plain: true }));
        log(created);
        log('--Creating Initial Data: Admin User--');
        return models.SQUser.findOrCreate({
            where: {
                username: 'admin'
            },
            defaults: {
                username: 'admin', password: 'Passw0rd', email: 'admin@newsfeeds.fyi', lastAccessDate: Date(), role: 'admin', createdAt: Date(), updatedAt: Date()
            }
        });
    })
        .then(function ([instance, created]) {
        // Understand results of last findOrCreate
        log(instance.get({ plain: true }));
        log(created);
        log('--Creating Initial Data: Normal User--');
        return models.SQUser.findOrCreate({
            where: {
                username: 'bradyep'
            },
            defaults: {
                username: 'bradyep', password: 'Passw0rd', email: 'bradyep@newsfeeds.fyi', lastAccessDate: Date(), role: 'pro', createdAt: Date(), updatedAt: Date()
            }
        });
    })
        .then(function ([instance, created]) {
        // Understand results of last findOrCreate
        log(instance.get({ plain: true }));
        log(created);
        log('--Creating Initial Data: Normal User--');
        return models.SQUser.findOrCreate({
            where: {
                username: 'joeuser'
            },
            defaults: {
                username: 'joeuser', password: 'Passw0rd', email: 'joeuser@newsfeeds.fyi', lastAccessDate: Date(), role: 'user', createdAt: Date(), updatedAt: Date()
            }
        });
    })
        .then(function ([instance, created]) {
        log(instance.get({ plain: true }));
        log(created);
        log('--Creating Initial Data: Link(Google Mail)--');
        return models.SQLink.findOrCreate({
            where: {
                url: 'https://mail.google.com/'
            },
            defaults: {
                userID: 1, url: 'https://mail.google.com/', name: 'GMail', displayOrder: 1
            }
        });
    })
        .then(function ([instance, created]) {
        log(instance.get({ plain: true }));
        log(created);
        log('--Creating Initial Data: Link(Google News)--');
        return models.SQLink.findOrCreate({
            where: {
                url: 'https://news.google.com/'
            },
            defaults: {
                userID: 1, url: 'https://news.google.com/', name: 'Google News', displayOrder: 2
            }
        });
    })
        .then(function ([instance, created]) {
        log(instance.get({ plain: true }));
        log(created);
        log('--Creating Initial Data: Link(Google Drive)--');
        return models.SQLink.findOrCreate({
            where: {
                url: 'https://drive.google.com/'
            },
            defaults: {
                userID: 1, url: 'https://drive.google.com/', name: 'Google Drive', displayOrder: 3
            }
        });
    })
        .then(function ([instance, created]) {
        log(instance.get({ plain: true }));
        log(created);
        log('--Creating Initial Data: Link(Google Keep)--');
        return models.SQLink.findOrCreate({
            where: {
                url: 'https://keep.google.com/'
            },
            defaults: {
                userID: 1, url: 'https://keep.google.com/', name: 'Google Keep', displayOrder: 4
            }
        });
    })
        .then(function ([instance, created]) {
        log(instance.get({ plain: true }));
        log(created);
        log('--Creating Initial Data: Page(Guest Page One)--');
        return models.SQPage.findOrCreate({
            where: {
                pageID: 1, Name: 'Guest Page One'
            },
            defaults: {
                userID: 1, name: 'Guest Page One', displayOrder: 1
            }
        });
    })
        .then(function ([instance, created]) {
        log(instance.get({ plain: true }));
        log(created);
        log('--Creating Initial Data: FeedSource(BBC World News)--');
        return models.SQFeedSource.findOrCreate({
            where: {
                url: 'http://feeds.bbci.co.uk/news/world/rss.xml', feedSourceID: 1
            },
            defaults: {
                cachedTitle: 'BBC World News', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', cachedWebsiteURL: 'http://www.bbc.com/news/world', lastCachedDate: Date()
            }
        });
    })
        .then(function ([instance, created]) {
        log(instance.get({ plain: true }));
        log(created);
        log('--Creating Initial Data: FeedSource(NYTimes US News)--');
        return models.SQFeedSource.findOrCreate({
            where: {
                url: 'http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', feedSourceID: 2
            },
            defaults: {
                cachedTitle: 'NYTimes US News', url: 'http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', cachedWebsiteURL: 'https://www.nytimes.com/section/us', lastCachedDate: Date()
            }
        });
    })
        .then(function ([instance, created]) {
        log(instance.get({ plain: true }));
        log(created);
        log('--Creating Initial Data: FeedSource(ESPN)--');
        return models.SQFeedSource.findOrCreate({
            where: {
                url: 'http://sports-ak.espn.go.com/espn/rss/news', feedSourceID: 3
            },
            defaults: {
                cachedTitle: 'ESPN', url: 'http://sports-ak.espn.go.com/espn/rss/news', cachedWebsiteURL: 'http://www.espn.com/', lastCachedDate: Date()
            }
        });
    })
        .then(function ([instance, created]) {
        log(instance.get({ plain: true }));
        log(created);
        log('--Creating Initial Data: UserFeed(BBC World News)--');
        return models.SQUserFeed.findOrCreate({
            where: {
                pageID: 1, Name: 'BBC World News'
            },
            defaults: {
                pageID: 1, feedSourceID: 1, name: 'BBC World News', column: 1, displayOrder: 1, itemDisplayCount: 3
            }
        });
    })
        .then(function ([instance, created]) {
        log(instance.get({ plain: true }));
        log(created);
        log('--Creating Initial Data: UserFeed(NYTimes US News)--');
        return models.SQUserFeed.findOrCreate({
            where: {
                pageID: 1, Name: 'NYTimes US News'
            },
            defaults: {
                pageID: 1, feedSourceID: 2, name: 'NYTimes US News', column: 2, displayOrder: 1, itemDisplayCount: 3
            }
        });
    })
        .then(function ([instance, created]) {
        log(instance.get({ plain: true }));
        log(created);
        log('--Creating Initial Data: UserFeed(ESPN)--');
        return models.SQUserFeed.findOrCreate({
            where: {
                pageID: 1, Name: 'ESPN'
            },
            defaults: {
                pageID: 1, feedSourceID: 3, name: 'ESPN', column: 3, displayOrder: 1, itemDisplayCount: 3
            }
        });
    })
        .then(function ([instance, created]) {
        // Understand results of last findOrCreate
        log(instance.get({ plain: true }));
        log(created);
        return new Promise((resolve, reject) => {
            resolve(models[modelRequested]);
        });
    })
        .catch(err => error(err));
}
exports.connectDB = connectDB;
; // /function connectDB
//# sourceMappingURL=nffyi-sequelize.js.map