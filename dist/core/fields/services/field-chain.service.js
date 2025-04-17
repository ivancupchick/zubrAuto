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
exports.FieldChainService = void 0;
const common_1 = require("@nestjs/common");
const fields_1 = require("../fields");
const prisma_service_1 = require("../../../prisma/prisma.service");
const Models_1 = require("../../../temp/entities/Models");
const field_utils_1 = require("../../utils/field.utils");
const api_error_1 = require("../../exceptions/api.error");
let FieldChainService = class FieldChainService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMany(where, sortOrder) {
        const orderBy = {};
        if (sortOrder) {
            orderBy.value = sortOrder;
        }
        const [fieldChains, longtextFieldChains] = await Promise.all([
            this.prisma.fieldIds.findMany({ where: where, orderBy: orderBy }),
            this.prisma.longtextFieldsIds.findMany({
                where: where,
                orderBy: orderBy,
            }),
        ]);
        return [...fieldChains, ...longtextFieldChains];
    }
    async update(data, where) {
        const [fieldChains, longtextFieldChains] = await Promise.all([
            this.prisma.fieldIds.updateMany({ where: where, data: data }),
            this.prisma.longtextFieldsIds.updateMany({ where: where, data: data }),
        ]);
        return { count: fieldChains.count + longtextFieldChains.count, ...fieldChains, ...longtextFieldChains };
    }
    async findOne(where) {
        const [fieldChain, longtextFieldChain] = await Promise.all([this.prisma.fieldIds.findMany({ where }), this.prisma.longtextFieldsIds.findMany({ where })]);
        return [...fieldChain, ...longtextFieldChain][0];
    }
    async deleteMany(payload) {
        const [fieldChains, longtextFieldChains] = await Promise.all([this.prisma.fieldIds.deleteMany({ where: payload }), this.prisma.longtextFieldsIds.deleteMany({ where: payload })]);
        return { count: fieldChains.count + longtextFieldChains.count, ...fieldChains, ...longtextFieldChains };
    }
    async create(fieldChainData) {
        const field = await this.prisma.fields.findUnique({
            where: { id: fieldChainData.fieldId },
        });
        let findFirst = field.type !== fields_1.FieldType.Textarea
            ? this.prisma.fieldIds.findFirst.bind(this.prisma.fieldIds)
            : this.prisma.longtextFieldsIds.findFirst.bind(this.prisma.longtextFieldsIds);
        let create = field.type !== fields_1.FieldType.Textarea
            ? this.prisma.fieldIds.create.bind(this.prisma.fieldIds)
            : this.prisma.longtextFieldsIds.create.bind(this.prisma.longtextFieldsIds);
        const existFieldChain = await findFirst({
            where: {
                sourceName: fieldChainData.sourceName,
                sourceId: fieldChainData.sourceId,
                fieldId: fieldChainData.fieldId,
            },
        });
        if (existFieldChain) {
            throw api_error_1.ApiError.BadRequest(`This Field Chain exists`);
        }
        const fieldChain = await create({
            data: {
                fieldId: fieldChainData.fieldId,
                value: fieldChainData.value || '',
                sourceId: fieldChainData.sourceId,
                sourceName: fieldChainData.sourceName,
            },
        });
        return fieldChain;
    }
    async updateById(id, fieldId, fieldChainData) {
        const field = await this.prisma.fields.findUnique({
            where: { id: fieldId },
        });
        let update = field.type !== fields_1.FieldType.Textarea
            ? this.prisma.fieldIds.update.bind(this.prisma.fieldIds)
            : this.prisma.longtextFieldsIds.update.bind(this.prisma.longtextFieldsIds);
        const fieldChain = await update({
            where: { id },
            data: { ...fieldChainData },
        });
        return fieldChain;
    }
    async getFieldChain(fieldId, id) {
        const field = await this.prisma.fields.findUnique({
            where: { id: fieldId },
        });
        let findUnique = field.type !== fields_1.FieldType.Textarea
            ? this.prisma.fieldIds.findUnique.bind(this.prisma.fieldIds)
            : this.prisma.longtextFieldsIds.findUnique.bind(this.prisma.longtextFieldsIds);
        const fieldChain = await findUnique({ where: { id: id } });
        return fieldChain;
    }
    async getEntityIdsByQuery(sourceName, entityDomain, query) {
        const ids = new Set(query['id']?.split(',') || []);
        delete query['id'];
        let fieldNames = Object.keys(query);
        const specialFieldNameOperators = fieldNames.filter((fn) => fn.includes('filter-operator'));
        const specialFieldNames = specialFieldNameOperators.map((n) => n.split('filter-operator-')[1]);
        const specialFieldIds = specialFieldNames.length > 0
            ? await this.prisma.fields.findMany({
                where: {
                    domain: entityDomain,
                    name: { in: specialFieldNames },
                },
            })
            : [];
        const specialFieldChaines = specialFieldIds.length
            ? await Promise.all(specialFieldNames.map((fieldName) => {
                const id = specialFieldIds.find((fc) => fc.name === fieldName);
                const fieldIdsQuery = {
                    sourceName: Models_1.Models.Table.Clients,
                    fieldId: id.id,
                };
                const operatorName = specialFieldNameOperators.find((fc) => fc.includes(fieldName));
                switch (query[operatorName]) {
                    case '<':
                        fieldIdsQuery.value = {
                            lte: query[fieldName],
                        };
                        break;
                    case '>':
                        fieldIdsQuery.value = {
                            gte: query[fieldName],
                        };
                        break;
                    case 'range':
                        const values = query[fieldName].split('-');
                        fieldIdsQuery.value = {
                            lte: values[1],
                            gte: values[0],
                        };
                        break;
                    case 'like':
                    case 'LIKE':
                        fieldIdsQuery.value = {
                            contains: query[fieldName],
                        };
                        break;
                }
                return this.prisma.fieldIds.findMany({ where: fieldIdsQuery });
            }))
            : [];
        const specialIds = specialFieldChaines
            .map((s) => s.map((item) => item.sourceId))
            .reduce((prev, cur) => {
            if (!prev.length) {
                return [...cur];
            }
            return cur.filter((id) => prev.includes(id));
        }, []);
        fieldNames = fieldNames.filter((n) => !specialFieldNameOperators.includes(n) &&
            !specialFieldNames.includes(n));
        if (fieldNames.length === 0 && ids.size > 0) {
            if (specialIds && specialIds.length > 0) {
                ids;
                return specialIds.filter((id) => ids.has(`${id}`)).map((id) => `${id}`);
            }
            else {
                return [...ids];
            }
        }
        const fields = fieldNames.length > 0
            ? await this.prisma.fields.findMany({
                where: {
                    domain: entityDomain,
                    name: {
                        in: fieldNames,
                    },
                },
            })
            : [];
        const fieldIdsWhereInput = {
            sourceName: sourceName,
        };
        if (ids && ids.size > 0) {
            fieldIdsWhereInput.sourceId = { in: [...ids].map((id) => +id) };
        }
        if (fields.length > 0) {
            fieldIdsWhereInput.fieldId = { in: fields.map((f) => f.id) };
            fieldIdsWhereInput.value = { in: (0, field_utils_1.getFieldChainsValue)(query, fields) };
        }
        const needChaines = fields.length > 0
            ? await this.prisma.fieldIds.findMany({ where: fieldIdsWhereInput })
            : [];
        const searchIds = new Set();
        const matchObj = {};
        if (needChaines.length > 0) {
            needChaines.forEach((ch) => {
                if (!matchObj[ch.fieldId]) {
                    matchObj[ch.fieldId] = [];
                }
                matchObj[ch.fieldId].push(`${ch.sourceId}`);
            });
            const matchKeys = fields.map((f) => `${f.id}`);
            needChaines.forEach((ch) => {
                let currentMatch = 0;
                matchKeys.forEach((key) => {
                    if (matchObj[key] && matchObj[key].includes(`${ch.sourceId}`)) {
                        ++currentMatch;
                    }
                });
                if (currentMatch === matchKeys.length) {
                    if (specialIds && specialIds.length > 0) {
                        if (specialIds.includes(ch.sourceId)) {
                            searchIds.add(`${ch.sourceId}`);
                        }
                    }
                    else {
                        searchIds.add(`${ch.sourceId}`);
                    }
                }
            });
        }
        return [...searchIds];
    }
};
exports.FieldChainService = FieldChainService;
exports.FieldChainService = FieldChainService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FieldChainService);
//# sourceMappingURL=field-chain.service.js.map