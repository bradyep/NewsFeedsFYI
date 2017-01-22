import util = require('util');
import usersModel = require('./models/users-sequelize');
import User = require('./models/User');

// May need to set up environment variables
// $env:SEQUELIZE_CONNECT='models/sequelize-sqlite.yaml'
// $env:DEBUG='nffyi-rest:*'
// $env:PORT='3000'
// Get-ChildItem env:

// Create Users
let adminUser = new User('admin', 'Passw0rd', 'admin@newsfeeds.fyi', 'admin');
usersModel.create(adminUser)
.then(user => {
  console.log('Attempted to create User: ' + util.inspect(user));
})
.catch(err => { console.error(err); });

let guestUser = new User('guest', 'Passw0rd', 'guest@newsfeeds.fyi', 'user');
usersModel.create(guestUser)
.then(user => {
  console.log('Attempted to create User: ' + util.inspect(user));
})
.catch(err => { console.error(err); });

// Create Links

// Create Pages

// Create FeedSources

// Create UserFeeds
