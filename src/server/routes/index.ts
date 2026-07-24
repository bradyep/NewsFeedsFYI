import * as express from "express";
var router = express.Router();
import debug from "debug";
const log = debug('nffyi-rest:router-index');
const error = debug('nffyi-rest:error');

/* GET home page - let the catch-all handle serving the React app */
// router.get('/', function (req, res, next) {
//   res.render('index', { title: 'Express' });
// });

// Logout now lives at POST /authenticate/logout (see src/server/routes/authenticate.ts) -
// it clears the JWT cookie directly rather than relying on Passport's req.logout().

export = router;
