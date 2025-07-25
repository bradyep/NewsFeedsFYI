import * as express from "express";
var router = express.Router();
import debug from "debug";
const log = debug('nffyi-rest:router-index');
const error = debug('nffyi-rest:error');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/logout', function (req, res, next) {

  req.logout(function (err) {
    if (err) {
      error(err);
      return next(err);
    }
    res.redirect('/');
  });
});

export = router;
