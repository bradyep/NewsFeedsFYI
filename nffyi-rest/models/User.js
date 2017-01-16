"use strict";
const util = require("util");
const logModule = require("debug");
const log = logModule('nffyi-rest:User');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
// module.exports = class Note {
class User {
    constructor(username, password, email, role, userID, lastAccessDate) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.role = role;
        this.userID = userID;
        this.lastAccessDate = lastAccessDate;
    }
    get JSON() {
        return JSON.stringify({
            userID: this.userID, userName: this.username, password: this.password, email: this.email, lastAccessDate: this.lastAccessDate, role: this.role
        });
    }
    static fromJSON(json) {
        var data = JSON.parse(json);
        var user = new User(data.username, data.password, data.email, data.role, data.userID, data.lastAccessDate);
        log(json + ' => ' + util.inspect(user));
        return user;
    }
}
; // /class User
module.exports = User;
//# sourceMappingURL=User.js.map