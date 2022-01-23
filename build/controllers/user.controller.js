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
const user_service_1 = __importDefault(require("../services/user.service"));
class UserController {
    getAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return next(api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array()));
                }
                const users = yield user_service_1.default.getAll();
                return res.json(users);
            }
            catch (e) {
                next(e);
            }
        });
    }
    get(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return next(api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array()));
                }
                const id = +req.params.userId;
                const user = yield user_service_1.default.get(id);
                return res.json(user);
            }
            catch (e) {
                next(e);
            }
        });
    }
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return next(api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array()));
                }
                const newUser = req.body;
                const user = yield user_service_1.default.create(newUser);
                return res.json(user);
            }
            catch (e) {
                next(e);
            }
        });
    }
    update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return next(api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array()));
                }
                const id = +req.params.userId;
                const updatedUser = req.body;
                const user = yield user_service_1.default.update(id, updatedUser);
                return res.json(user);
            }
            catch (e) {
                next(e);
            }
        });
    }
    delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return next(api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array()));
                }
                const id = +req.params.userId;
                const user = yield user_service_1.default.delete(id);
                return res.json(user);
            }
            catch (e) {
                next(e);
            }
        });
    }
}
module.exports = new UserController();
//# sourceMappingURL=user.controller.js.map