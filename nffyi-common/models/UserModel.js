"use strict";
const logModule = require("debug");
const log = logModule('nffyi-common:User');
const error = logModule('nffyi-common:error');
class UserModel {
    constructor(username, password, email, roleID, userID, lastAccessDate) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.roleID = roleID;
        this.userID = userID;
        this.lastAccessDate = lastAccessDate;
    }
    get JSON() {
        return JSON.stringify({
            userID: this.userID, userName: this.username, password: this.password, email: this.email, lastAccessDate: this.lastAccessDate, roleID: this.roleID
        });
    }
    static fromJSON(json) {
        var data = JSON.parse(json);
        var user = new UserModel(data.username, data.password, data.email, data.role, data.userID, data.lastAccessDate);
        log(json + ' => ' + user);
        return user;
    }
}
exports.UserModel = UserModel;
; // /class User
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = UserModel;
//# sourceMappingURL=UserModel.js.map