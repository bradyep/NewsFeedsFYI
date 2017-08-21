"use strict";
const util = require("util");
const logModule = require("debug");
const log = logModule('nffyi-rest:User');
// import errorModule = require('debug');
const error = logModule('nffyi-rest:error');
// module.exports = class Note {
class UserModel {
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
        var user = new UserModel(data.username, data.password, data.email, data.role, data.userID, data.lastAccessDate);
        log(json + ' => ' + util.inspect(user));
        return user;
    }
}
exports.UserModel = UserModel;
; // /class User
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = UserModel;
//# sourceMappingURL=UserModel.js.map