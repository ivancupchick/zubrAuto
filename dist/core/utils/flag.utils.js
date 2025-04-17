"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlagField = void 0;
const bit_utils_1 = require("../utils/bit.utils");
var FlagField;
(function (FlagField) {
    let Flags;
    (function (Flags) {
        Flags[Flags["System"] = 1] = "System";
        Flags[Flags["Virtual"] = 2] = "Virtual";
    })(Flags = FlagField.Flags || (FlagField.Flags = {}));
    function setFlagOn(v, bit) {
        v.flags = bit_utils_1.BitHelper.setOn(v.flags, bit);
    }
    FlagField.setFlagOn = setFlagOn;
    function setFlagOff(v, bit) {
        v.flags = bit_utils_1.BitHelper.setOff(v.flags, bit);
    }
    FlagField.setFlagOff = setFlagOff;
    function Is(v, bit) {
        const value = typeof v === 'number' ? v : v.flags;
        return bit_utils_1.BitHelper.Is(value, bit);
    }
    FlagField.Is = Is;
})(FlagField || (exports.FlagField = FlagField = {}));
//# sourceMappingURL=flag.utils.js.map