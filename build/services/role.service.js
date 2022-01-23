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
const role_repository_1 = __importDefault(require("../repositories/base/role.repository"));
const field_access_repository_1 = __importDefault(require("../repositories/base/field-access.repository"));
class RoleService {
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const [roles, fieldAccesses] = yield Promise.all([
                role_repository_1.default.getAll(),
                field_access_repository_1.default.find({ sourceName: [`${Models_1.Models.ROLES_TABLE_NAME}`] })
            ]);
            const result = roles.map(role => ({
                id: role.id,
                systemName: role.systemName,
                accesses: fieldAccesses.filter(fa => fa.sourceId === role.id && fa.sourceName === `${Models_1.Models.ROLES_TABLE_NAME}`)
            }));
            return result;
        });
    }
    get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [role, fieldAccesses] = yield Promise.all([
                role_repository_1.default.findById(id),
                field_access_repository_1.default.find({ sourceName: [`${Models_1.Models.ROLES_TABLE_NAME}`] })
            ]);
            const result = {
                id: role.id,
                systemName: role.systemName,
                accesses: fieldAccesses.filter(fa => fa.sourceId === role.id && fa.sourceName === `${Models_1.Models.ROLES_TABLE_NAME}`)
            };
            return result;
        });
    }
    create(roleData) {
        return __awaiter(this, void 0, void 0, function* () {
            const role = yield role_repository_1.default.create({
                systemName: roleData.systemName
            });
            yield Promise.all((roleData.accesses || []).map(a => field_access_repository_1.default.create({
                sourceId: role.id,
                fieldId: a.fieldId,
                access: a.access,
                sourceName: Models_1.Models.ROLES_TABLE_NAME
            })));
            return role;
        });
    }
    update(id, roleData) {
        return __awaiter(this, void 0, void 0, function* () {
            const role = yield role_repository_1.default.updateById(id, {
                systemName: roleData.systemName
            });
            const createdAccess = roleData.accesses.length > 0 ? yield field_access_repository_1.default.find({
                fieldId: roleData.accesses.map(c => `${c.fieldId}`),
                sourceId: [id].map(c => `${c}`),
                sourceName: [Models_1.Models.ROLES_TABLE_NAME]
            }) : [];
            const notCreatedAccess = roleData.accesses.filter(a => createdAccess.find((ca => ca.fieldId === a.fieldId)));
            yield Promise.all((createdAccess || []).map(a => field_access_repository_1.default.update({
                access: a.access
            }, {
                fieldId: [a.fieldId].map(c => `${c}`),
                sourceId: [id].map(c => `${c}`),
                sourceName: [Models_1.Models.ROLES_TABLE_NAME]
            })));
            yield Promise.all((notCreatedAccess || []).map(a => field_access_repository_1.default.create({
                sourceId: id,
                fieldId: a.fieldId,
                access: a.access,
                sourceName: Models_1.Models.ROLES_TABLE_NAME
            })));
            return role;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const accesses = yield field_access_repository_1.default.find({
                sourceId: [id].map(c => `${c}`),
                sourceName: [Models_1.Models.ROLES_TABLE_NAME]
            });
            yield Promise.all(accesses.map(a => field_access_repository_1.default.deleteById(a.id)));
            const role = yield role_repository_1.default.deleteById(id);
            return role;
        });
    }
}
module.exports = new RoleService();
//# sourceMappingURL=role.service.js.map