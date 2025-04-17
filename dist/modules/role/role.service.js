"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const common_1 = require("@nestjs/common");
const Models_1 = require("../../temp/entities/Models");
const prisma_service_1 = require("../../prisma/prisma.service");
let RoleService = class RoleService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createRoleDto) {
        const role = await this.prisma.roles.create({ data: {
                systemName: createRoleDto.systemName
            } });
        await Promise.all((createRoleDto.accesses || []).map(a => this.prisma.fieldAccesses.create({ data: {
                sourceId: role.id,
                fieldId: a.fieldId,
                access: a.access,
                sourceName: Models_1.Models.Table.Roles
            } })));
        return role;
    }
    async findAll() {
        const [roles, fieldAccesses] = await Promise.all([
            this.prisma.roles.findMany(),
            this.prisma.fieldAccesses.findMany({ where: { sourceName: Models_1.Models.Table.Roles } })
        ]);
        const result = roles.map(role => ({
            id: role.id,
            systemName: role.systemName,
            accesses: fieldAccesses.filter(fa => fa.sourceId === role.id)
        }));
        return result;
    }
    async findOne(id) {
        const [role, fieldAccesses] = await Promise.all([
            this.prisma.roles.findUnique({ where: { id } }),
            this.prisma.fieldAccesses.findMany({ where: { sourceName: Models_1.Models.Table.Roles } })
        ]);
        const result = {
            id: role.id,
            systemName: role.systemName,
            accesses: fieldAccesses.filter(fa => fa.sourceId === role.id)
        };
        return result;
    }
    async update(id, updateRoleDto) {
        const role = await this.prisma.roles.update({ where: { id }, data: {
                systemName: updateRoleDto.systemName
            } });
        const createdAccess = updateRoleDto.accesses.length > 0 ? await this.prisma.fieldAccesses.findMany({ where: {
                fieldId: { in: updateRoleDto.accesses.map(c => c.fieldId) },
                sourceId: id,
                sourceName: Models_1.Models.Table.Roles
            } }) : [];
        const notCreatedAccess = updateRoleDto.accesses.filter(a => createdAccess.find((ca => ca.fieldId === a.fieldId)));
        await Promise.all((createdAccess || []).map(a => this.prisma.fieldAccesses.updateMany({ data: {
                access: a.access
            }, where: {
                fieldId: a.fieldId,
                sourceId: id,
                sourceName: Models_1.Models.Table.Roles
            } })));
        await Promise.all((notCreatedAccess || []).map(a => this.prisma.fieldAccesses.create({ data: {
                sourceId: id,
                fieldId: a.fieldId,
                access: a.access,
                sourceName: Models_1.Models.Table.Roles
            } })));
        return role;
    }
    async remove(id) {
        const accesses = await this.prisma.fieldAccesses.findMany({ where: {
                sourceId: id,
                sourceName: Models_1.Models.Table.Roles
            } });
        await Promise.all(accesses.map(a => this.prisma.fieldAccesses.delete({ where: { id: a.id } })));
        const role = await this.prisma.roles.delete({ where: { id } });
        return role;
    }
};
exports.RoleService = RoleService;
exports.RoleService = RoleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoleService);
//# sourceMappingURL=role.service.js.map