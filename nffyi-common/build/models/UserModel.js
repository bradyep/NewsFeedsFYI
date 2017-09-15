"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logModule = require("debug");
var log = logModule('nffyi-common:User');
var error = logModule('nffyi-common:error');
var UserModel = (function () {
    function UserModel(username, password, email, roleID, userID, lastAccessDate) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.roleID = roleID;
        this.userID = userID;
        this.lastAccessDate = lastAccessDate;
    }
    Object.defineProperty(UserModel.prototype, "JSON", {
        get: function () {
            return JSON.stringify({
                userID: this.userID, userName: this.username, password: this.password, email: this.email, lastAccessDate: this.lastAccessDate, roleID: this.roleID
            });
        },
        enumerable: true,
        configurable: true
    });
    UserModel.fromJSON = function (json) {
        var data = JSON.parse(json);
        var user = new UserModel(data.username, data.password, data.email, data.role, data.userID, data.lastAccessDate);
        log(json + ' => ' + user);
        return user;
    };
    return UserModel;
}());
exports.UserModel = UserModel;
;
exports.default = UserModel;
//# sourceMappingURL=UserModel.js.map