"use strict";
const fs = require("fs-extra");
const jsyaml = require("js-yaml");
const Sequelize = require("sequelize");
const logModule = require("debug");
const log = logModule('nffyi-rest:model-definition');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
// var SQUser;
// var SQLink;
var sequelize;
var models = { SQUser: null, SQLink: null, SQPage: null, SQUserFeed: null, SQFeedSource: null, SQCachedNewsItem: null };
// Need parameter to indicate which model? 
function connectDB(modelRequested) {
    // Maybe have a switch statement here? 
    // See if ANY of our models is defined?
    // Return a made-up Promise with requested model here? 
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
        /*
                SQLink = sequelize.define('Link', {
                    linkID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
                    url: Sequelize.STRING,
                    name: Sequelize.STRING,
                    displayOrder: Sequelize.INTEGER
                }); // /SQLink
                */
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