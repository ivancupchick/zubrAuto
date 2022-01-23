"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_validator_1 = require("express-validator");
const api_error_1 = require("../exceptions/api.error");
const role_service_1 = __importDefault(require("../services/role.service"));
class RoleController {
    getAllRoles(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array());
                }
                const roles = yield role_service_1.default.getAll();
                return res.json(roles);
            }
            catch (e) {
                next(e);
            }
        });
    }
    createRole(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array());
                }
                const newRole = req.body;
                const role = yield role_service_1.default.create(newRole);
                return res.json(role);
            }
            catch (e) {
                next(e);
            }
        });
    }
    getRole(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array());
                }
                const id = +req.params.roleId;
                const role = yield role_service_1.default.get(id);
                return res.json(role);
            }
            catch (e) {
                next(e);
            }
        });
    }
    deleteRole(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array());
                }
                const id = +req.params.roleId;
                const role = yield role_service_1.default.delete(id);
                return res.json(role);
            }
            catch (e) {
                next(e);
            }
        });
    }
    updateRole(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array());
                }
                const id = +req.params.roleId;
                const updatedRole = req.body;
                const role = yield role_service_1.default.update(id, updatedRole);
                return res.json(role);
            }
            catch (e) {
                next(e);
            }
        });
    }
}
module.exports = new RoleController();
//# sourceMappingURL=role.controller.js.map