"use strict";
var Roles;
(function (Roles) {
    Roles[Roles["ADMIN"] = 1] = "ADMIN";
    Roles[Roles["PRO"] = 2] = "PRO";
    Roles[Roles["USER"] = 3] = "USER";
    Roles[Roles["GUEST"] = 4] = "GUEST"; // 4
})(Roles = exports.Roles || (exports.Roles = {}));
;
exports.ROLE_DB_NAMES = {
    [Roles.ADMIN]: 'admin',
    [Roles.PRO]: 'pro',
    [Roles.USER]: 'user',
    [Roles.GUEST]: 'guest'
};
//# sourceMappingURL=roles.js.map