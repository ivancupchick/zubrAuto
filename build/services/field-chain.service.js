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
// import { FieldChainDomains, FieldChainType, ServerFieldChain } from '../entities/FieldChain';
const api_error_1 = require("../exceptions/api.error");
const field_chain_repository_1 = __importDefault(require("../repositories/base/field-chain.repository"));
class FieldChainService {
    getAllFieldChains() {
        return __awaiter(this, void 0, void 0, function* () {
            const fieldChains = yield field_chain_repository_1.default.getAll();
            return fieldChains;
        });
    }
    createFieldChain(fieldChainData) {
        return __awaiter(this, void 0, void 0, function* () {
            const existFieldChain = yield field_chain_repository_1.default.findOne({
                sourceId: [`${fieldChainData.sourceId}`],
                fieldId: [`${fieldChainData.fieldId}`],
                sourceName: [`${fieldChainData.sourceName}`]
            });
            if (existFieldChain) {
                throw api_error_1.ApiError.BadRequest(`This Field Chain exists`);
            }
            const fieldChain = yield field_chain_repository_1.default.create({
                fieldId: fieldChainData.fieldId,
                value: fieldChainData.value || '',
                sourceId: fieldChainData.sourceId,
                sourceName: fieldChainData.sourceName
            });
            return fieldChain;
        });
    }
    updateFieldChain(id, fieldChainData) {
        return __awaiter(this, void 0, void 0, function* () {
            const fieldChain = yield field_chain_repository_1.default.updateById(id, fieldChainData);
            return fieldChain;
        });
    }
    deleteFieldChain(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const fieldChain = yield field_chain_repository_1.default.deleteById(id);
            return fieldChain;
        });
    }
    getFieldChain(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const fieldChain = yield field_chain_repository_1.default.findById(id);
            return fieldChain;
        });
    }
}
module.exports = new FieldChainService();
//# sourceMappingURL=field-chain.service.js.map