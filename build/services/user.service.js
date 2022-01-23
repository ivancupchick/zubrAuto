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
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const mail_service_1 = __importDefault(require("./mail.service"));
const Models_1 = require("../entities/Models");
const api_error_1 = require("../exceptions/api.error");
const user_repository_1 = __importDefault(require("../repositories/base/user.repository"));
const field_service_1 = __importDefault(require("./field.service"));
const Field_1 = require("../entities/Field");
const field_chain_repository_1 = __importDefault(require("../repositories/base/field-chain.repository"));
const field_utils_1 = require("../utils/field.utils");
const field_chain_service_1 = __importDefault(require("./field-chain.service"));
const role_repository_1 = __importDefault(require("../repositories/base/role.repository"));
class UserService {
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const [users, relatedFields] = yield Promise.all([
                user_repository_1.default.getAll(),
                field_service_1.default.getFieldsByDomain(Field_1.FieldDomains.User)
            ]);
            const chaines = yield field_chain_repository_1.default.find({
                sourceId: users.map(c => `${c.id}`),
                sourceName: [`${Models_1.Models.USERS_TABLE_NAME}`]
            });
            const customRoles = yield role_repository_1.default.getAll();
            const result = users.map(user => {
                var _a;
                return ({
                    id: user.id,
                    email: user.email,
                    password: user.password,
                    isActivated: user.isActivated,
                    activationLink: user.activationLink,
                    roleLevel: user.roleLevel,
                    customRoleName: ((_a = customRoles.find(cr => (cr.id + 1000) === user.roleLevel)) === null || _a === void 0 ? void 0 : _a.systemName) || '',
                    fields: (0, field_utils_1.getFieldsWithValues)(relatedFields, chaines, user.id)
                });
            });
            return result;
        });
    }
    create(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const existUser = yield user_repository_1.default.findOne({ email: [userData.email] });
            if (existUser) {
                throw api_error_1.ApiError.BadRequest(`User with ${userData.email} exists`); // Error codes
            }
            const activationLink = (0, uuid_1.v4)();
            userData.password = yield bcrypt_1.default.hash(userData.password, 3);
            if (!userData.isActivated) {
                userData = Object.assign({}, userData, { activationLink });
            }
            const fields = [...userData.fields];
            delete userData.fields;
            const user = yield user_repository_1.default.create(userData);
            yield Promise.all(fields.map(f => field_chain_service_1.default.createFieldChain({
                sourceId: user.id,
                fieldId: f.id,
                value: f.value,
                sourceName: Models_1.Models.USERS_TABLE_NAME
            })));
            if (!userData.isActivated) {
                yield mail_service_1.default.sendActivationMail(userData.email, `${process.env.API_URL}/activate/` + activationLink); // need test
            }
            return user;
        });
    }
    update(id, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userData.password) {
                userData.password = yield bcrypt_1.default.hash(userData.password, 3);
            }
            const fields = [...userData.fields];
            delete userData.fields;
            const user = yield user_repository_1.default.updateById(id, userData);
            yield Promise.all(fields.map(f => field_chain_repository_1.default.update({
                value: f.value
            }, {
                fieldId: [f.id].map(c => `${c}`),
                sourceId: [id].map(c => `${c}`),
                sourceName: [Models_1.Models.USERS_TABLE_NAME]
            })));
            return user;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const chaines = yield field_chain_repository_1.default.find({
                sourceId: [`${id}`],
                sourceName: [Models_1.Models.USERS_TABLE_NAME]
            });
            yield Promise.all(chaines.map(ch => field_chain_service_1.default.deleteFieldChain(ch.id)));
            const user = yield user_repository_1.default.deleteById(id);
            return user;
        });
    }
    get(id) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_repository_1.default.findById(id);
            const relatedFields = yield field_service_1.default.getFieldsByDomain(Field_1.FieldDomains.User);
            const chaines = yield field_chain_repository_1.default.find({
                sourceId: [`${id}`],
                sourceName: [`${Models_1.Models.USERS_TABLE_NAME}`]
            });
            const customRoles = yield role_repository_1.default.getAll();
            const result = {
                id: user.id,
                email: user.email,
                isActivated: user.isActivated,
                roleLevel: user.roleLevel,
                customRoleName: ((_a = customRoles.find(cr => (cr.id + 1000) === user.roleLevel)) === null || _a === void 0 ? void 0 : _a.systemName) || '',
                fields: (0, field_utils_1.getFieldsWithValues)(relatedFields, chaines, user.id)
            };
            return result;
        });
    }
}
module.exports = new UserService();
//# sourceMappingURL=user.service.js.map