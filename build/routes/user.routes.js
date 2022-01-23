"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const constansts_1 = require("../utils/constansts");
const router = (0, express_1.Router)();
router.route(`/${constansts_1.Constants.API.CRUD}/`)
    .get(auth_middleware_1.authMiddleware, user_controller_1.default.getAll)
    .post(auth_middleware_1.authMiddleware, (0, express_validator_1.body)('email').isEmail(), (0, express_validator_1.body)('password').isLength({ min: 3, max: 32 }), 
// body('password').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/),
user_controller_1.default.create);
router.route(`/${constansts_1.Constants.API.CRUD}/:userId`)
    .get(auth_middleware_1.authMiddleware, user_controller_1.default.get)
    .delete(auth_middleware_1.authMiddleware, user_controller_1.default.delete)
    .put(auth_middleware_1.authMiddleware, user_controller_1.default.update);
// router.route('/getUsersByDomain/:domain')
//     .get(getUsersByDomain)
exports.default = router;
//# sourceMappingURL=user.routes.js.map