"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldType = exports.FieldDomains = void 0;
exports.getDomainByTableName = getDomainByTableName;
const Models_1 = require("../../temp/entities/Models");
var FieldDomains;
(function (FieldDomains) {
    FieldDomains[FieldDomains["Car"] = 0] = "Car";
    FieldDomains[FieldDomains["CarOwner"] = 1] = "CarOwner";
    FieldDomains[FieldDomains["Client"] = 2] = "Client";
    FieldDomains[FieldDomains["User"] = 3] = "User";
    FieldDomains[FieldDomains["Role"] = 4] = "Role";
})(FieldDomains || (exports.FieldDomains = FieldDomains = {}));
var FieldType;
(function (FieldType) {
    FieldType[FieldType["Boolean"] = 0] = "Boolean";
    FieldType[FieldType["Radio"] = 1] = "Radio";
    FieldType[FieldType["Text"] = 2] = "Text";
    FieldType[FieldType["Multiselect"] = 3] = "Multiselect";
    FieldType[FieldType["Number"] = 4] = "Number";
    FieldType[FieldType["Dropdown"] = 5] = "Dropdown";
    FieldType[FieldType["Date"] = 6] = "Date";
    FieldType[FieldType["Textarea"] = 7] = "Textarea";
})(FieldType || (exports.FieldType = FieldType = {}));
function getDomainByTableName(tableName) {
    switch (tableName) {
        case Models_1.Models.Table.Roles: return FieldDomains.Role;
        default: return FieldDomains.Car;
    }
}
//# sourceMappingURL=fields.js.map