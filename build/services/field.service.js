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
const Models_1 = require("../entities/Models");
const Field_1 = require("../entities/Field");
const api_error_1 = require("../exceptions/api.error");
const field_repository_1 = __importDefault(require("../repositories/base/field.repository"));
const car_repository_1 = __importDefault(require("../repositories/base/car.repository"));
const user_repository_1 = __importDefault(require("../repositories/base/user.repository"));
const car_owner_repository_1 = __importDefault(require("../repositories/base/car-owner.repository"));
const client_repository_1 = __importDefault(require("../repositories/base/client.repository"));
const field_chain_service_1 = __importDefault(require("./field-chain.service"));
const field_chain_repository_1 = __importDefault(require("../repositories/base/field-chain.repository"));
const field_access_repository_1 = __importDefault(require("../repositories/base/field-access.repository"));
class FieldService {
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const [fields, fieldAccesses] = yield Promise.all([
                field_repository_1.default.getAll(),
                field_access_repository_1.default.getAll()
            ]);
            const result = fields.map(field => (Object.assign(Object.assign({}, field), { accesses: fieldAccesses.filter(fa => fa.fieldId === field.id).map(fa => ({
                    id: fa.id,
                    fieldId: fa.fieldId,
                    sourceId: fa.sourceId,
                    domain: (0, Field_1.getDomainByTableName)(fa.sourceName),
                    access: fa.access
                })) })));
            return result;
        });
    }
    create(fieldData) {
        return __awaiter(this, void 0, void 0, function* () {
            const existField = yield field_repository_1.default.findOne({ name: [fieldData.name], domain: [`${fieldData.domain}`] });
            if (existField) {
                throw api_error_1.ApiError.BadRequest(`Field ${fieldData.name} exists`);
            }
            const field = yield field_repository_1.default.create({
                flags: fieldData.flags || 0,
                type: fieldData.type || Field_1.FieldType.Text,
                name: fieldData.name.toLowerCase(),
                domain: fieldData.domain,
                variants: fieldData.variants,
                showUserLevel: fieldData.showUserLevel
            });
            if (fieldData.accesses) {
                yield Promise.all((fieldData.accesses || []).map(a => field_access_repository_1.default.create({
                    sourceId: a.sourceId,
                    fieldId: field.id,
                    access: a.access,
                    sourceName: (0, Field_1.getTableNameByDomain)(a.domain)
                })));
            }
            let tableName = '';
            let entities = [];
            switch (field.domain) {
                case Field_1.FieldDomains.Car:
                    tableName = Models_1.Models.CARS_TABLE_NAME;
                    entities = yield car_repository_1.default.getAll();
                    break;
                case Field_1.FieldDomains.User:
                    tableName = Models_1.Models.USERS_TABLE_NAME;
                    entities = yield user_repository_1.default.getAll();
                    break;
                case Field_1.FieldDomains.CarOwner:
                    tableName = Models_1.Models.CAR_OWNERS_TABLE_NAME;
                    entities = yield car_owner_repository_1.default.getAll();
                    break;
                case Field_1.FieldDomains.Client:
                    tableName = Models_1.Models.CLIENTS_TABLE_NAME;
                    entities = yield client_repository_1.default.getAll();
                    break;
            }
            yield Promise.all(entities.map(entity => field_chain_service_1.default.createFieldChain({
                sourceId: entity.id,
                fieldId: field.id,
                value: '',
                sourceName: tableName
            })));
            return field;
        });
    }
    update(id, fieldData) {
        return __awaiter(this, void 0, void 0, function* () {
            const accesses = [...fieldData.accesses];
            delete fieldData.accesses;
            if (fieldData.name) {
                fieldData.name === fieldData.name.trim();
            }
            const field = yield field_repository_1.default.updateById(id, fieldData);
            const createdAccess = accesses.length > 0
                ? yield field_access_repository_1.default.find({
                    fieldId: [`${id}`]
                })
                : [];
            const notCreatedAccess = accesses.filter(na => !createdAccess.find((ca => ca.sourceId === na.sourceId && ca.sourceName === (0, Field_1.getTableNameByDomain)(na.domain))));
            yield Promise.all(createdAccess
                .map(a => {
                const newAccess = accesses.find(na => na.sourceId === a.sourceId && (0, Field_1.getTableNameByDomain)(na.domain) === a.sourceName);
                const newAccessValue = !!newAccess ? newAccess.access : null;
                switch (newAccessValue) {
                    case null: return field_access_repository_1.default.deleteById(a.id);
                    case 0: return field_access_repository_1.default.deleteById(a.id);
                }
                return field_access_repository_1.default.updateById(a.id, { access: newAccessValue });
            })
                .filter(a => a));
            yield Promise.all(notCreatedAccess
                .map(na => field_access_repository_1.default.create({
                sourceId: na.sourceId,
                fieldId: id,
                access: na.access,
                sourceName: (0, Field_1.getTableNameByDomain)(na.domain)
            })));
            // const field = await fieldRepository.updateById(id, fieldData);
            return field;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const field = yield field_repository_1.default.findById(id);
            let tableName = '';
            let entities = [];
            switch (field.domain) {
                case Field_1.FieldDomains.Car:
                    tableName = Models_1.Models.CARS_TABLE_NAME;
                    entities = yield car_repository_1.default.getAll();
                    break;
                case Field_1.FieldDomains.User:
                    tableName = Models_1.Models.USERS_TABLE_NAME;
                    entities = yield user_repository_1.default.getAll();
                    break;
                case Field_1.FieldDomains.CarOwner:
                    tableName = Models_1.Models.CAR_OWNERS_TABLE_NAME;
                    entities = yield car_owner_repository_1.default.getAll();
                    break;
                case Field_1.FieldDomains.Client:
                    tableName = Models_1.Models.CLIENTS_TABLE_NAME;
                    entities = yield client_repository_1.default.getAll();
                    break;
            }
            const createdAccess = (yield field_access_repository_1.default.find({
                fieldId: [`${id}`]
            })) || [];
            const fieldIds = yield field_chain_repository_1.default.find({
                sourceId: entities.map(e => `${e.id}`),
                fieldId: [`${field.id}`],
            });
            yield Promise.all([
                ...fieldIds.map(fieldChain => field_chain_repository_1.default.deleteById(fieldChain.id)),
            ]);
            yield Promise.all([
                ...createdAccess.map(a => field_access_repository_1.default.deleteById(a.id))
            ]);
            yield field_repository_1.default.deleteById(id);
            return field;
        });
    }
    get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [field, fieldAccesses] = yield Promise.all([
                field_repository_1.default.findById(id),
                field_access_repository_1.default.getAll()
            ]);
            const result = Object.assign(Object.assign({}, field), { accesses: fieldAccesses.filter(fa => fa.fieldId === field.id).map(fa => ({
                    id: fa.id,
                    fieldId: fa.fieldId,
                    sourceId: fa.sourceId,
                    domain: (0, Field_1.getDomainByTableName)(fa.sourceName),
                    access: fa.access
                })) });
            return result;
        });
    }
    getFieldsByDomain(domain) {
        return __awaiter(this, void 0, void 0, function* () {
            const [fields, fieldAccesses] = yield Promise.all([
                field_repository_1.default.find({ domain: [`${domain}`] }),
                field_access_repository_1.default.getAll()
            ]);
            const result = fields.map(field => (Object.assign(Object.assign({}, field), { accesses: fieldAccesses.filter(fa => fa.fieldId === field.id).map(fa => ({
                    id: fa.id,
                    fieldId: fa.fieldId,
                    sourceId: fa.sourceId,
                    domain: (0, Field_1.getDomainByTableName)(fa.sourceName),
                    access: fa.access
                })) })));
            return result;
        });
    }
}
module.exports = new FieldService();
//# sourceMappingURL=field.service.js.map