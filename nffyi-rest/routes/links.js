"use strict";
const express = require("express");
var router = express.Router();
const util = require("util");
// import User = require('../models/User');
const linksModel = require("../models/links-sequelize");
const logModule = require("debug");
const log = logModule('nffyi-rest:router-links');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
const authRouter = require("./authenticate");
// import LinkModel = require('../models/Link');
const models_1 = require("../../nffyi-common/models");
/* GET all Links for requesting User - Admin gets all Links */
router.get('/', function (req, res, next) {
    let userID = req.user ? req.user.userID : 1;
    getKeyList(userID)
        .then(linkList => {
        res.json(linkList);
    })
        .catch(err => { error('router-links ' + err); next(err); });
});
var getKeyList = function (userID) {
    return linksModel.keylist(userID)
        .then(keylist => {
        var keyPromises = keylist.map(key => {
            return linksModel.read(key).then(link => {
                return new models_1.LinkModel(link.url, link.name, link.displayOrder, link.linkID, link.userID);
            });
        });
        return Promise.all(keyPromises);
    });
};
/*
// GET single Link
// We may never need this
router.get('/:linkid', authRouter.ensureAuthenticated, (req, res, next) => {
  // Must be Admin to see another Link's data


  linksModel.read(req.params.linkid)
  .then(link => {
    if (!link) next();
    else res.json(link);
  })
  .catch(err => { next(err); });
});
*/
// Update existing Link
router.put('/:linkid', authRouter.ensureAuthenticated, (req, res, next) => {
    let userID = req.user ? req.user.userID : 1;
    // Authorize
    if (userID === req.body.userID || req.user.userID === 2) {
        let updateLink = new models_1.LinkModel(req.body.url, req.body.name, req.body.displayOrder, req.params.linkID, req.body.userID);
        linksModel.update(updateLink)
            .then(link => {
            if (!link)
                next();
            else
                res.json(link);
        })
            .catch(err => { next(err); });
    }
    else {
        let err;
        err = new Error('Not Authenticated');
        err.status = 403;
        next(err);
    }
});
// POST new Link
router.post('/', authRouter.ensureAuthenticated, function (req, res, next) {
    let userID = req.user ? req.user.userID : 1;
    // Authorize
    if (userID === req.body.userID || req.user.userID === 2) {
        linksModel.create(new models_1.LinkModel(req.body.url, req.body.name, req.body.displayOrder, null, userID))
            .then(link => {
            log('Attempted to create Link: ' + util.inspect(link));
            res.json(link);
        })
            .catch(err => { next(err); });
    }
    else {
        let err;
        err = new Error('Not Authenticated');
        err.status = 403;
        next(err);
    }
});
// DELETE existing Link
router.delete('/:linkid', authRouter.ensureAuthenticated, (req, res, next) => {
    let userID = req.user ? req.user.userID : 1;
    // Authorize
    if (userID === req.body.userID || req.user.userID === 2) {
        linksModel.destroy(req.params.linkid)
            .then(link => {
            if (!link)
                next();
            else
                res.json(link);
        })
            .catch(err => { next(err); });
    }
    else {
        let err;
        err = new Error('Not Authenticated');
        err.status = 403;
        next(err);
    }
});
module.exports = router;
//# sourceMappingURL=links.js.map