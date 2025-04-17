"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerAuth = void 0;
var ServerAuth;
(function (ServerAuth) {
    class Payload {
        constructor(options) {
            this.id = options.id;
            this.email = options.email;
            this.isActivated = options.isActivated;
            this.roleLevel = options.roleLevel;
            this.customRoleName = options.customRoleName;
        }
    }
    ServerAuth.Payload = Payload;
})(ServerAuth || (exports.ServerAuth = ServerAuth = {}));
//# sourceMappingURL=Auth.js.map