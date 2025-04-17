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
exports.FieldsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const fields_1 = require("./fields");
const Field_1 = require("../../temp/entities/Field");
const api_error_1 = require("../exceptions/api.error");
const Models_1 = require("../../temp/entities/Models");
const field_chain_service_1 = require("./services/field-chain.service");
let FieldsService = class FieldsService {
    constructor(prisma, fieldChainService) {
        this.prisma = prisma;
        this.fieldChainService = fieldChainService;
    }
    async create(createFieldDto) {
        const existField = await this.prisma.fields.findFirst({ where: { name: createFieldDto.name, domain: createFieldDto.domain } });
        if (existField) {
            throw api_error_1.ApiError.BadRequest(`Field ${createFieldDto.name} exists`);
        }
        const field = await this.prisma.fields.create({ data: {
                flags: createFieldDto.flags || 0,
                type: createFieldDto.type || fields_1.FieldType.Text,
                name: createFieldDto.name.toLowerCase(),
                domain: createFieldDto.domain,
                variants: createFieldDto.variants,
                showUserLevel: createFieldDto.showUserLevel
            } });
        if (createFieldDto.accesses) {
            await Promise.all((createFieldDto.accesses || []).map(a => this.prisma.fieldAccesses.create({ data: {
                    sourceId: a.sourceId,
                    fieldId: field.id,
                    access: a.access,
                    sourceName: (0, Field_1.getTableNameByDomain)(a.domain)
                } })));
        }
        return field;
    }
    async findAll() {
        const [fields, fieldAccesses] = await Promise.all([
            this.prisma.fields.findMany(),
            this.prisma.fieldAccesses.findMany()
        ]);
        const result = fields.map(field => ({
            ...field,
            accesses: fieldAccesses.filter(fa => fa.fieldId === field.id).map(fa => ({
                id: fa.id,
                fieldId: fa.fieldId,
                sourceId: fa.sourceId,
                domain: (0, fields_1.getDomainByTableName)(fa.sourceName),
                access: fa.access
            })),
        }));
        return result;
    }
    async findOne(id) {
        const [field, fieldAccesses] = await Promise.all([
            this.prisma.fields.findUnique({ where: { id } }),
            this.prisma.fieldAccesses.findMany()
        ]);
        const result = {
            ...field,
            accesses: fieldAccesses.filter(fa => fa.fieldId === field.id).map(fa => ({
                id: fa.id,
                fieldId: fa.fieldId,
                sourceId: fa.sourceId,
                domain: (0, fields_1.getDomainByTableName)(fa.sourceName),
                access: fa.access
            })),
        };
        return result;
    }
    async update(id, updateFieldDto) {
        const accesses = [...updateFieldDto.accesses];
        delete updateFieldDto.accesses;
        if (updateFieldDto.name) {
            updateFieldDto.name === updateFieldDto.name.trim();
        }
        const field = await this.prisma.fields.update({ where: { id }, data: updateFieldDto });
        const createdAccess = accesses.length > 0
            ? await this.prisma.fieldAccesses.findMany({ where: {
                    fieldId: id
                } })
            : [];
        const notCreatedAccess = accesses.filter(na => !createdAccess.find((ca => ca.sourceId === na.sourceId && ca.sourceName === (0, Field_1.getTableNameByDomain)(na.domain))));
        await Promise.all(createdAccess
            .map(a => {
            const newAccess = accesses.find(na => na.sourceId === a.sourceId && (0, Field_1.getTableNameByDomain)(na.domain) === a.sourceName);
            const newAccessValue = !!newAccess ? newAccess.access : null;
            switch (newAccessValue) {
                case null: return this.prisma.fieldAccesses.delete({ where: { id: a.id } });
                case 0: return this.prisma.fieldAccesses.delete({ where: { id: a.id } });
            }
            return this.prisma.fieldAccesses.update({ where: { id: a.id }, data: { access: newAccessValue } });
        })
            .filter(a => a));
        await Promise.all(notCreatedAccess
            .map(na => this.prisma.fieldAccesses.create({ data: {
                sourceId: na.sourceId,
                fieldId: id,
                access: na.access,
                sourceName: (0, Field_1.getTableNameByDomain)(na.domain)
            } })));
        return field;
    }
    async remove(id) {
        const field = await this.prisma.fields.findUnique({ where: { id } });
        let tableName = '';
        let entities = [];
        switch (field.domain) {
            case fields_1.FieldDomains.Car:
                tableName = Models_1.Models.Table.Cars;
                entities = await this.prisma.cars.findMany();
                break;
            case fields_1.FieldDomains.User:
                tableName = Models_1.Models.Table.Users;
                entities = await this.prisma.users.findMany();
                break;
            case fields_1.FieldDomains.CarOwner:
                tableName = Models_1.Models.Table.CarOwners;
                entities = await this.prisma.carOwners.findMany();
                break;
            case fields_1.FieldDomains.Client:
                tableName = Models_1.Models.Table.Clients;
                entities = await this.prisma.clients.findMany();
                break;
        }
        const createdAccess = (await this.prisma.fieldAccesses.findMany({ where: {
                fieldId: id
            } })) || [];
        await this.fieldChainService.deleteMany({
            sourceId: { in: entities.map(e => e.id) },
            fieldId: field.id
        });
        await Promise.all([
            ...createdAccess.map(a => this.prisma.fieldAccesses.delete({ where: { id: a.id } }))
        ]);
        await this.prisma.fields.delete({ where: { id } });
        return field;
    }
    async getFieldsByDomain(domain) {
        const [fields, fieldAccesses] = await Promise.all([
            this.prisma.fields.findMany({ where: { domain: +domain } }),
            this.prisma.fieldAccesses.findMany()
        ]);
        const result = fields.map(field => ({
            ...field,
            accesses: fieldAccesses.filter(fa => fa.fieldId === field.id).map(fa => ({
                id: fa.id,
                fieldId: fa.fieldId,
                sourceId: fa.sourceId,
                domain: (0, fields_1.getDomainByTableName)(fa.sourceName),
                access: fa.access
            })),
        }));
        return result;
    }
};
exports.FieldsService = FieldsService;
exports.FieldsService = FieldsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, field_chain_service_1.FieldChainService])
], FieldsService);
//# sourceMappingURL=fields.service.js.map