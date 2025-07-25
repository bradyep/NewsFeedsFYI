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
  /*
    req.session.destroy(function(err) {
      if (err) {
        error(err);
      } else {
        res.clearCookie('connect.sid');
        res.redirect('/');
      }
    });
    */
  // req.session.destroy(function (err) {
  //   // res.clearCookie('connect.sid');
  //   res.redirect('/'); //Inside a callback… bulletproof!
  // });

  req.logout(function (err) {
    if (err) {
      error(err);
      return next(err);
    }
    res.redirect('/');
  });
});

export = router;
