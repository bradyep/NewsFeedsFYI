import util = require('util');
import usersModel = require('./models/users-sequelize');
// import UserModel = require('./models/User');
// import { UserModel } from '../nffyi-common/models';
import { UserModel } from './models/common';


// May need to set up environment variables
// $env:SEQUELIZE_CONNECT='models/sequelize-sqlite.yaml'
// $env:DEBUG='nffyi-rest:*'
// $env:PORT='3000'
// Get-ChildItem env:

// Create Users
let adminUser = new UserModel('admin', 'Passw0rd', 'admin@newsfeeds.fyi', 1);
usersModel.create(adminUser)
.then(user => {
  console.log('Attempted to create User: ' + util.inspect(user));
})
.catch(err => { console.error(err); });

let guestUser = new UserModel('guest', 'Passw0rd', 'guest@newsfeeds.fyi', 3);
usersModel.create(guestUser)
.then(user => {
  console.log('Attempted to create User: ' + util.inspect(user));
})
.catch(err => { console.error(err); });

// Create Links

// Create Pages

// Create FeedSources

// Create UserFeeds
