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
const client_service_1 = __importDefault(require("../services/client.service"));
class ClientConntroller {
    getAllClient(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return next(api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array()));
                }
                const clients = yield client_service_1.default.getAll();
                return res.json(clients);
            }
            catch (e) {
                next(e);
            }
        });
    }
    getClient(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return next(api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array()));
                }
                const id = +req.params.clientId;
                const client = yield client_service_1.default.get(id);
                return res.json(client);
            }
            catch (e) {
                next(e);
            }
        });
    }
    createClient(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return next(api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array()));
                }
                const newClient = req.body;
                const client = yield client_service_1.default.create(newClient);
                return res.json(client);
            }
            catch (e) {
                next(e);
            }
        });
    }
    updateClient(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return next(api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array()));
                }
                const id = +req.params.clientId;
                const updatedClient = req.body;
                const client = yield client_service_1.default.update(id, updatedClient);
                return res.json(client);
            }
            catch (e) {
                next(e);
            }
        });
    }
    deleteClient(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return next(api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array()));
                }
                const id = +req.params.clientId;
                const client = yield client_service_1.default.delete(id);
                return res.json(client);
            }
            catch (e) {
                next(e);
            }
        });
    }
    completeDeal(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return next(api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array()));
                }
                const { clientId, carId } = req.body;
                const client = yield client_service_1.default.completeDeal(clientId, carId);
                return res.json(client);
            }
            catch (e) {
                next(e);
            }
        });
    }
}
module.exports = new ClientConntroller();
//# sourceMappingURL=client.controller.js.map