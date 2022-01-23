"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const role_controller_1 = __importDefault(require("../controllers/role.controller"));
const router = (0, express_1.Router)();
router.route('/')
    .get(role_controller_1.default.getAllRoles)
    .post(role_controller_1.default.createRole);
router.route('/:roleId')
    .get(role_controller_1.default.getRole)
    .delete(role_controller_1.default.deleteRole)
    .put(role_controller_1.default.updateRole);
exports.default = router;
//# sourceMappingURL=role.routes.js.map