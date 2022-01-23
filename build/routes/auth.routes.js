"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
router.route('/registration')
    .post((0, express_validator_1.body)('email').isEmail(), (0, express_validator_1.body)('password').isLength({ min: 3, max: 32 }), (0, express_validator_1.body)('password').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/), auth_controller_1.default.registration);
router.route('/login').post(auth_controller_1.default.login);
router.route('/logout').post(auth_controller_1.default.logout);
router.route('/activate/:link').get(auth_controller_1.default.activate);
router.route('/refresh').get(auth_controller_1.default.refresh);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map