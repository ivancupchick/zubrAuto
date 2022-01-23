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
const field_service_1 = __importDefault(require("../services/field.service"));
class FieldConntroller {
    getAllFields(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return next(api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array()));
                }
                const fields = yield field_service_1.default.getAll();
                return res.json(fields);
            }
            catch (e) {
                next(e);
            }
        });
    }
    createField(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return next(api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array()));
                }
                const newField = req.body;
                const field = yield field_service_1.default.create(newField);
                return res.json({ id: field.id });
            }
            catch (e) {
                next(e);
            }
        });
    }
    getField(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return next(api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array()));
                }
                const id = +req.params.fieldId;
                const field = yield field_service_1.default.get(id);
                return res.json(field);
            }
            catch (e) {
                next(e);
            }
        });
    }
    deleteField(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return next(api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array()));
                }
                const id = +req.params.fieldId;
                const field = yield field_service_1.default.delete(id);
                return res.json(field);
            }
            catch (e) {
                next(e);
            }
        });
    }
    updateField(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return next(api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array()));
                }
                const id = +req.params.fieldId;
                const updatedField = req.body;
                const field = yield field_service_1.default.update(id, updatedField);
                return res.json(field);
            }
            catch (e) {
                next(e);
            }
        });
    }
    getFieldsByDomain(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return next(api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array()));
                }
                const domain = +req.params.domain;
                const fields = yield field_service_1.default.getFieldsByDomain(domain);
                return res.json(fields);
            }
            catch (e) {
                next(e);
            }
        });
    }
}
module.exports = new FieldConntroller();
//# sourceMappingURL=field.controller.js.map