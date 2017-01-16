"use strict";
const fs = require("fs-extra");
const jsyaml = require("js-yaml");
const Sequelize = require("sequelize");
const logModule = require("debug");
const log = logModule('nffyi-rest:model-definition');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
var sequelize;
var models = { SQUser: null, SQLink: null, SQPage: null, SQUserFeed: null, SQFeedSource: null, SQCachedNewsItem: null };
function connectDB(modelRequested) {
    log('Requesting: ' + modelRequested + ' which is: ' + models[modelRequested]);
    if (models[modelRequested]) {
        // return SQUser.sync();
        return new Promise((resolve, reject) => {
            resolve(models[modelRequested]);
        });
    }
    // if (SQUser) return SQUser; // doesn't work
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
        models.SQUser = sequelize.define('User', {
            userID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            username: Sequelize.STRING,
            password: Sequelize.STRING,
            email: Sequelize.STRING,
            lastAccessDate: Sequelize.DATE,
            role: Sequelize.STRING
        }); // /SQUser
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
            feedSourceURL: Sequelize.STRING,
            cachedTitle: Sequelize.STRING,
            cachedWebsiteURL: Sequelize.STRING,
            lastCachedDate: Sequelize.DATE
        }); // /SQFeedSource
        models.SQUserFeed = sequelize.define('UserFeed', {
            columnNumber: Sequelize.INTEGER,
            displayOrder: Sequelize.INTEGER,
            userFeedName: Sequelize.STRING,
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
        // Return model that User asked for 
        // return SQUser.sync();
        // return SQUser.sync() && SQLink.sync();
    }) // /params Promise
        .then(() => {
        return new Promise((resolve, reject) => {
            resolve(models[modelRequested]);
        });
    })
        .catch(err => error(err));
}
exports.connectDB = connectDB;
; // /function connectDB
//# sourceMappingURL=nffyi-sequelize.js.map