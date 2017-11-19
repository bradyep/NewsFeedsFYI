"use strict";
var Roles;
(function (Roles) {
    Roles[Roles["ADMIN"] = 1] = "ADMIN";
    Roles[Roles["PRO"] = 2] = "PRO";
    Roles[Roles["USER"] = 3] = "USER";
    Roles[Roles["GUEST"] = 4] = "GUEST";
})(Roles = exports.Roles || (exports.Roles = {}));
;
exports.ROLE_DB_NAMES = (_a = {},
    _a[Roles.ADMIN] = 'admin',
    _a[Roles.PRO] = 'pro',
    _a[Roles.USER] = 'user',
    _a[Roles.GUEST] = 'guest',
    _a);
var _a;
//# sourceMappingURL=roles.js.map