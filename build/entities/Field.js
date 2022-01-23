"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDomainByTableName = exports.getTableNameByDomain = exports.FieldType = exports.FieldDomains = void 0;
const Models_1 = require("./Models");
var FieldDomains;
(function (FieldDomains) {
    FieldDomains[FieldDomains["Car"] = 0] = "Car";
    FieldDomains[FieldDomains["CarOwner"] = 1] = "CarOwner";
    FieldDomains[FieldDomains["Client"] = 2] = "Client";
    FieldDomains[FieldDomains["User"] = 3] = "User";
    FieldDomains[FieldDomains["Role"] = 4] = "Role";
})(FieldDomains = exports.FieldDomains || (exports.FieldDomains = {}));
var FieldType;
(function (FieldType) {
    FieldType[FieldType["Boolean"] = 0] = "Boolean";
    FieldType[FieldType["Radio"] = 1] = "Radio";
    FieldType[FieldType["Text"] = 2] = "Text";
    FieldType[FieldType["Multiselect"] = 3] = "Multiselect";
    FieldType[FieldType["Number"] = 4] = "Number";
    FieldType[FieldType["Dropdown"] = 5] = "Dropdown";
})(FieldType = exports.FieldType || (exports.FieldType = {}));
function getTableNameByDomain(domain) {
    switch (domain) {
        // case FieldDomains.Car: return Models.CARS_TABLE_NAME;
        // case FieldDomains.CarOwner: return Models.CAR_OWNERS_TABLE_NAME;
        // case FieldDomains.Client: return Models.CLIENTS_TABLE_NAME;
        case FieldDomains.Role: return Models_1.Models.ROLES_TABLE_NAME;
        default: return 'None';
    }
}
exports.getTableNameByDomain = getTableNameByDomain;
function getDomainByTableName(tableName) {
    switch (tableName) {
        // case Models.CARS_TABLE_NAME: return FieldDomains.Car;
        // case Models.CAR_OWNERS_TABLE_NAME: return FieldDomains.CarOwner;
        // case Models.CLIENTS_TABLE_NAME: return FieldDomains.Client;
        // case Models.USERS_TABLE_NAME: return FieldDomains.User;
        case Models_1.Models.ROLES_TABLE_NAME: return FieldDomains.Role;
        default: return 1000;
    }
}
exports.getDomainByTableName = getDomainByTableName;
//# sourceMappingURL=Field.js.map