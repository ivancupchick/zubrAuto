"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONparse = JSONparse;
function JSONparse(json) {
    try {
        return JSON.parse(json);
    }
    catch (e) {
        console.log('JSON parsing error', e);
        return null;
    }
}
//# sourceMappingURL=json.util.js.map