"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexWelcome = void 0;
function indexWelcome(req, res) {
    res.sendFile(process.cwd() + "/ui/dist/zubr-auto/index.html"); // check path
}
exports.indexWelcome = indexWelcome;
