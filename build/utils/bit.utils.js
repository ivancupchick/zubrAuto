"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitHelper = void 0;
var BitHelper;
(function (BitHelper) {
    function setOn(value, bit) {
        return value | bit;
    }
    BitHelper.setOn = setOn;
    function setOff(value, bit) {
        return value & ~bit;
    }
    BitHelper.setOff = setOff;
    function Is(value, bit) {
        return (value & bit) === bit;
    }
    BitHelper.Is = Is;
})(BitHelper = exports.BitHelper || (exports.BitHelper = {}));
//# sourceMappingURL=bit.utils.js.map