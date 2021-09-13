"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexWelcome = void 0;
function indexWelcome(req, res) {
    res.sendFile(process.cwd() + "/dist/zubr-auto/"); // check path
}
exports.indexWelcome = indexWelcome;
