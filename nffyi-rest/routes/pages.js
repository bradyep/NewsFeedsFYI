"use strict";
const express = require("express");
var router = express.Router();
const util = require("util");
// import User = require('../models/User');
const pagesModel = require("../models/pages-sequelize");
const logModule = require("debug");
const log = logModule('nffyi-rest:router-pages');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
const authRouter = require("./authenticate");
// import PageModel = require('../models/Page');
// import { PageModel, UserModel } from '../../nffyi-common/models';
const common_1 = require("../models/common");
// import UserModel = require('../models/User');
/* GET all Pages for requesting User */
router.get('/', function (req, res, next) {
    let userID = req.user ? req.user.userID : 1;
    getKeyList(userID)
        .then(pageList => {
        res.json(pageList);
    })
        .catch(err => { error('router-pages ' + err); next(err); });
});
var getKeyList = function (userID) {
    return pagesModel.keylist(userID)
        .then(keylist => {
        var keyPromises = keylist.map(key => {
            return pagesModel.read(key).then(page => {
                return new common_1.PageModel(page.name, page.displayOrder, page.userID, page.pageID);
            });
        });
        return Promise.all(keyPromises);
    });
};
// GET single Page
router.get('/:pageid', (req, res, next) => {
    let userID = req.user ? req.user.userID : 1;
    pagesModel.read(req.params.pageid)
        .then(page => {
        if (!page)
            next();
        else {
            // Authorize
            if (userID === page.userID || req.user.userID === 2) {
                res.json(page);
            }
            else {
                let err = new Error('Not Authenticated');
                err.status = 403;
                next(err);
            }
        }
    })
        .catch(err => { next(err); });
});
// Update existing Page
router.put('/:pageid', authRouter.ensureAuthenticated, (req, res, next) => {
    let userID = req.user ? req.user.userID : 1;
    // Authorize
    if (userID === req.body.userID || req.user.userID === 2) {
        let updatePage = new common_1.PageModel(req.body.name, req.body.displayOrder, req.body.userID, req.params.pageID);
        pagesModel.update(updatePage)
            .then(page => {
            if (!page)
                next();
            else
                res.json(page);
        })
            .catch(err => { next(err); });
    }
    else {
        let err = new Error('Not Authenticated');
        err.status = 403;
        next(err);
    }
});
// POST new Page
router.post('/', authRouter.ensureAuthenticated, function (req, res, next) {
    let userID = req.user ? req.user.userID : 1;
    // Authorize
    if (userID === req.body.userID || req.user.userID === 2) {
        pagesModel.create(new common_1.PageModel(req.body.name, req.body.displayOrder, userID, null))
            .then(page => {
            log('Attempted to create Page: ' + util.inspect(page));
            res.json(page);
        })
            .catch(err => { next(err); });
    }
    else {
        let err = new Error('Not Authenticated');
        err.status = 403;
        next(err);
    }
});
// DELETE existing Page
router.delete('/:pageid', authRouter.ensureAuthenticated, (req, res, next) => {
    let userID = req.user ? req.user.userID : 1;
    // Authorize
    if (userID === req.body.userID || req.user.userID === 2) {
        pagesModel.destroy(req.params.pageid)
            .then(page => {
            if (!page)
                next();
            else
                res.json(page);
        })
            .catch(err => { next(err); });
    }
    else {
        let err = new Error('Not Authenticated');
        err.status = 403;
        next(err);
    }
});
module.exports = router;
//# sourceMappingURL=pages.js.map