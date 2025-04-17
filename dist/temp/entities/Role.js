"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerRole = void 0;
var ServerRole;
(function (ServerRole) {
    let System;
    (function (System) {
        System[System["None"] = 0] = "None";
        System[System["Admin"] = 900] = "Admin";
        System[System["SuperAdmin"] = 1000] = "SuperAdmin";
    })(System = ServerRole.System || (ServerRole.System = {}));
    let Custom;
    (function (Custom) {
        Custom["contactCenter"] = "contactCenter";
        Custom["contactCenterChief"] = "contactCenterChief";
        Custom["carShooting"] = "carShooting";
        Custom["carShootingChief"] = "carShootingChief";
        Custom["customerService"] = "customerService";
        Custom["customerServiceChief"] = "customerServiceChief";
        Custom["carSales"] = "carSales";
        Custom["carSalesChief"] = "carSalesChief";
    })(Custom = ServerRole.Custom || (ServerRole.Custom = {}));
})(ServerRole || (exports.ServerRole = ServerRole = {}));
//# sourceMappingURL=Role.js.map