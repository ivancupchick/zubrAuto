"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFieldsWithValues = exports.FlagField = void 0;
const bit_utils_1 = require("./bit.utils");
var FlagField;
(function (FlagField) {
    let Flags;
    (function (Flags) {
        Flags[Flags["System"] = 1] = "System";
        Flags[Flags["Virtual"] = 2] = "Virtual";
    })(Flags = FlagField.Flags || (FlagField.Flags = {}));
    function setFlagOn(v, bit) {
        // v.flags |= bit;
        v.flags = bit_utils_1.BitHelper.setOn(v.flags, bit);
    }
    FlagField.setFlagOn = setFlagOn;
    function setFlagOff(v, bit) {
        // v.flags &= ~bit;
        v.flags = bit_utils_1.BitHelper.setOff(v.flags, bit);
    }
    FlagField.setFlagOff = setFlagOff;
    function Is(v, bit) {
        const value = typeof v === 'number' ? v : v.flags;
        // (value & bit) === bit;
        return bit_utils_1.BitHelper.Is(value, bit);
    }
    FlagField.Is = Is;
})(FlagField = exports.FlagField || (exports.FlagField = {}));
const getFieldsWithValues = (chainedFields, chaines, sourceId) => {
    return chainedFields
        .filter(cf => !!chaines
        .filter(ch => ch.sourceId === sourceId)
        .find(ch => ch.fieldId === cf.id))
        .map(cf => {
        var _a;
        return {
            id: cf.id,
            name: cf.name,
            flags: cf.flags,
            type: cf.type,
            domain: cf.domain,
            variants: cf.variants,
            showUserLevel: cf.showUserLevel,
            value: ((_a = chaines.find(c => c.fieldId === cf.id && c.sourceId === sourceId)) === null || _a === void 0 ? void 0 : _a.value) || ''
        };
    });
};
exports.getFieldsWithValues = getFieldsWithValues;
//# sourceMappingURL=field.utils.js.map