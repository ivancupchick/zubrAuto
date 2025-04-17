"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTableNameByDomain = getTableNameByDomain;
const fields_1 = require("../../core/fields/fields");
const Models_1 = require("./Models");
function getTableNameByDomain(domain) {
    switch (domain) {
        case fields_1.FieldDomains.Role: return Models_1.Models.Table.Roles;
        default: return 'None';
    }
}
//# sourceMappingURL=Field.js.map