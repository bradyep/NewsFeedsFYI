"use strict";
var util = require("util");
var logModule = require("debug");
var log = logModule('nffyi-common:User');
var error = logModule('nffyi-common:error');
var UserModel = (function () {
    function UserModel(username, password, email, role, userID, lastAccessDate) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.role = role;
        this.userID = userID;
        this.lastAccessDate = lastAccessDate;
    }
    Object.defineProperty(UserModel.prototype, "JSON", {
        get: function () {
            return JSON.stringify({
                userID: this.userID, userName: this.username, password: this.password, email: this.email, lastAccessDate: this.lastAccessDate, role: this.role
            });
        },
        enumerable: true,
        configurable: true
    });
    UserModel.fromJSON = function (json) {
        var data = JSON.parse(json);
        var user = new UserModel(data.username, data.password, data.email, data.role, data.userID, data.lastAccessDate);
        log(json + ' => ' + util.inspect(user));
        return user;
    };
    return UserModel;
}());
exports.UserModel = UserModel;
;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = UserModel;
//# sourceMappingURL=UserModel.js.map