"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const field_controller_1 = __importDefault(require("../controllers/field.controller"));
const constansts_1 = require("../utils/constansts");
const router = (0, express_1.Router)();
router.route(`/${constansts_1.Constants.API.CRUD}/`)
    .get(field_controller_1.default.getAllFields)
    .post((0, express_validator_1.body)('name').isLength({ min: 3, max: 50 }), (0, express_validator_1.body)('name').matches(/^[a-z][a-z-]{1,50}[a-z]$/), (0, express_validator_1.body)('flags').isNumeric(), (0, express_validator_1.body)('domain').isNumeric(), (0, express_validator_1.body)('variants').isString(), (0, express_validator_1.body)('showUserLevel').isNumeric(), field_controller_1.default.createField);
router.route(`/${constansts_1.Constants.API.CRUD}/:fieldId`)
    .get(field_controller_1.default.getField)
    .delete(field_controller_1.default.deleteField)
    .put(field_controller_1.default.updateField);
router.route('/getFieldsByDomain/:domain')
    .get(field_controller_1.default.getFieldsByDomain);
exports.default = router;
//# sourceMappingURL=field.routes.js.map