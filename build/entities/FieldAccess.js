"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldAccess = void 0;
const bit_utils_1 = require("../utils/bit.utils");
var FieldAccess;
(function (FieldAccess) {
    let AccessBits;
    (function (AccessBits) {
        AccessBits[AccessBits["noAccess"] = 1] = "noAccess";
        AccessBits[AccessBits["writable"] = 2] = "writable";
    })(AccessBits = FieldAccess.AccessBits || (FieldAccess.AccessBits = {}));
    function isNoAccess(access) {
        return bit_utils_1.BitHelper.Is(access, AccessBits.noAccess);
    }
    FieldAccess.isNoAccess = isNoAccess;
    function writable(access) {
        return bit_utils_1.BitHelper.Is(access, AccessBits.writable);
    }
    FieldAccess.writable = writable;
})(FieldAccess = exports.FieldAccess || (exports.FieldAccess = {}));
//# sourceMappingURL=FieldAccess.js.map