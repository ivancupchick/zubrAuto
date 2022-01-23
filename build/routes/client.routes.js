"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const client_controller_1 = __importDefault(require("../controllers/client.controller"));
const constansts_1 = require("../utils/constansts");
const router = (0, express_1.Router)();
router.route('/')
    .get(client_controller_1.default.getAllClient)
    .post(client_controller_1.default.createClient);
router.route('/:clientId')
    .get(client_controller_1.default.getClient)
    .delete(client_controller_1.default.deleteClient)
    .put(client_controller_1.default.updateClient);
router.route(`/${constansts_1.Constants.API.COMPLETE_DEAL}`)
    .post((0, express_validator_1.body)('clientId').isNumeric().notEmpty(), (0, express_validator_1.body)('carId').isNumeric().notEmpty(), client_controller_1.default.completeDeal);
exports.default = router;
//# sourceMappingURL=client.routes.js.map