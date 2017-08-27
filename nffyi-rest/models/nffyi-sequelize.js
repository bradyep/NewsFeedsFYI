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
        // Auto-Populate Database with Users
        log('--Creating Initial Data: Guest User--');
        return models.SQUser.findOrCreate({
            where: {
                username: 'guest'
            },
            defaults: {
                username: 'guest', password: 'Passw0rd', email: 'guest@newsfeeds.fyi', lastAccessDate: Date(), role: 'guest', createdAt: Date(), updatedAt: Date()
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
                username: 'bradyep', password: 'Passw0rd', email: 'bradyep@newsfeeds.fyi', lastAccessDate: Date(), role: 'user', createdAt: Date(), updatedAt: Date()
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
        log('--Creating Initial Data: CachedNewsItem(BBC 1)--');
        return models.SQCachedNewsItem.findOrCreate({
            where: {
                cachedNewsItemID: 1, feedSourceID: 1
            },
            defaults: {
                title: "Donald Trump: N Korea's Kim Jong-un a 'smart cookie'", link: 'http://www.bbc.co.uk/news/world-asia-39764834', description: "The US president reflects on the young leader's rise and says 'we'll see' about US military options.", feedSourceID: 1
            }
        });
    })
        .then(function ([instance, created]) {
        log(instance.get({ plain: true }));
        log(created);
        log('--Creating Initial Data: CachedNewsItem(BBC 2)--');
        return models.SQCachedNewsItem.findOrCreate({
            where: {
                cachedNewsItemID: 2, feedSourceID: 1
            },
            defaults: {
                title: "Dozens of Yazidis enslaved by IS in Iraq now free", link: 'http://www.bbc.co.uk/news/world-middle-east-39762790', description: "The 36 men, women and children were held by IS in Iraq for nearly three years.", feedSourceID: 1
            }
        });
    })
        .then(function ([instance, created]) {
        log(instance.get({ plain: true }));
        log(created);
        log('--Creating Initial Data: CachedNewsItem(BBC 3)--');
        return models.SQCachedNewsItem.findOrCreate({
            where: {
                cachedNewsItemID: 3, feedSourceID: 1
            },
            defaults: {
                title: "Ueli Steck: Everest preparation claims 'Swiss Machine' climber", link: 'http://www.bbc.co.uk/news/world-asia-39761904', description: "'Swiss Machine' Ueli Steck dies in an accident while acclimatising for an attempt on a new route.", feedSourceID: 1
            }
        });
    })
        .then(function ([instance, created]) {
        log(instance.get({ plain: true }));
        log(created);
        log('--Creating Initial Data: CachedNewsItem(NYTimes 1)--');
        return models.SQCachedNewsItem.findOrCreate({
            where: {
                cachedNewsItemID: 4, feedSourceID: 2
            },
            defaults: {
                title: "Trump’s ‘Very Friendly’ Talk With Duterte Stuns Aides and Critics Alike", link: 'https://www.nytimes.com/2017/04/30/us/politics/trump-duterte.html?partner=rss&emc=rss', description: "The administration is bracing for an avalanche of criticism after the president embraced Rodrigo Duterte, who has led a deadly crackdown on drugs in the Philippines.", feedSourceID: 2
            }
        });
    })
        .then(function ([instance, created]) {
        log(instance.get({ plain: true }));
        log(created);
        log('--Creating Initial Data: CachedNewsItem(NYTimes 2)--');
        return models.SQCachedNewsItem.findOrCreate({
            where: {
                cachedNewsItemID: 5, feedSourceID: 2
            },
            defaults: {
                title: "Becoming Duterte: The Making of a Philippine Strongman", link: 'http://www.nytimes.com/2017/03/21/world/asia/rodrigo-duterte-philippines-president-strongman.html?partner=rss&emc=rss', description: "He is a child of privilege turned populist politician, an antidrug crusader who has struggled with drug abuse. Obsessed with death, he has turned his violent vision into national policy.", feedSourceID: 2
            }
        });
    })
        .then(function ([instance, created]) {
        log(instance.get({ plain: true }));
        log(created);
        log('--Creating Initial Data: CachedNewsItem(NYTimes 3)--');
        return models.SQCachedNewsItem.findOrCreate({
            where: {
                cachedNewsItemID: 6, feedSourceID: 2
            },
            defaults: {
                title: "News Analysis: On Trade, a Politically Feisty Trump Risks Economic Damage", link: 'https://www.nytimes.com/2017/04/30/business/trump-nafta-trade-economy.html?partner=rss&emc=rss', description: "Trucks waiting to enter the United States at the border crossing in Tijuana, Mexico, in February.", feedSourceID: 2
            }
        });
    })
        .then(function ([instance, created]) {
        log(instance.get({ plain: true }));
        log(created);
        log('--Creating Initial Data: CachedNewsItem(ESPN 1)--');
        return models.SQCachedNewsItem.findOrCreate({
            where: {
                cachedNewsItemID: 7, feedSourceID: 3
            },
            defaults: {
                title: "Jazz hold off Clippers to win series", link: 'http://www.espn.com/nba/recap?gameId=400950426', description: "Jazz hold off Clippers to win series", feedSourceID: 3
            }
        });
    })
        .then(function ([instance, created]) {
        log(instance.get({ plain: true }));
        log(created);
        log('--Creating Initial Data: CachedNewsItem(ESPN 2)--');
        return models.SQCachedNewsItem.findOrCreate({
            where: {
                cachedNewsItemID: 8, feedSourceID: 3
            },
            defaults: {
                title: "Nats' Rendon goes 6-for-6, with 3 HRs, 10 RBIs", link: 'http://www.espn.com/mlb/story/_/id/19281935/anthony-rendon-washington-nationals-goes-6-6-3-hrs-10-rbis', description: "Nats' Rendon goes 6-for-6, with 3 HRs, 10 RBIs", feedSourceID: 3
            }
        });
    })
        .then(function ([instance, created]) {
        log(instance.get({ plain: true }));
        log(created);
        log('--Creating Initial Data: CachedNewsItem(ESPN 3)--');
        return models.SQCachedNewsItem.findOrCreate({
            where: {
                cachedNewsItemID: 9, feedSourceID: 3
            },
            defaults: {
                title: "Toothless Thomas: C's star eyes fast dental fix", link: 'http://www.espn.com/nba/story/_/id/19282028/isaiah-thomas-boston-celtics-loses-tooth-game-1-win-washington-wizards', description: "Toothless Thomas: C's star eyes fast dental fix", feedSourceID: 3
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