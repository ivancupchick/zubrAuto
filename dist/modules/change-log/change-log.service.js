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
exports.ChangeLogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const enitities_functions_1 = require("../../core/utils/enitities-functions");
const api_error_1 = require("../../core/exceptions/api.error");
let ChangeLogService = class ChangeLogService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createActivity(createChangeLogDto) {
        const activity = Object.assign(createChangeLogDto);
        return await this.prisma.activities.create({ data: activity });
    }
    async findAll() {
        const [entities,] = await Promise.all([
            this.prisma.activities.findMany(),
        ]);
        return this.getEntities(entities);
    }
    async getEntities(requests) {
        return requests;
    }
    async findMany(query) {
        const { page, size, sortOrder, } = query;
        delete query['page'];
        delete query['size'];
        const searchEntitiesIds = await (0, enitities_functions_1.getEntityIdsByNaturalQuery)(this.prisma.activities, query);
        let entitiesIds = [...searchEntitiesIds];
        if (page && size) {
            const start = (+page - 1) * +size;
            entitiesIds = entitiesIds.slice(start, start + +size);
        }
        const requests = entitiesIds.length > 0 ? await this.prisma.activities.findMany({ where: { id: { in: entitiesIds } } }) : [];
        let list = await this.getEntities(requests);
        if (sortOrder === 'DESC') {
            list = list.reverse();
        }
        return {
            list: list,
            total: searchEntitiesIds.length
        };
    }
    async create(createChangeLogDto) {
        const entity = await this.prisma.activities.create({ data: createChangeLogDto });
        return entity;
    }
    async findOne(id) {
        const entity = await this.prisma.activities.findUnique({ where: { id } });
        return entity;
    }
    async update(id, updateChangeLogDto) {
        const entity = await this.prisma.activities.update({ where: { id }, data: updateChangeLogDto });
        return entity;
    }
    async remove(id) {
        throw new api_error_1.ApiError(404, `changeLog removeing is restricted`);
    }
};
exports.ChangeLogService = ChangeLogService;
exports.ChangeLogService = ChangeLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChangeLogService);
//# sourceMappingURL=change-log.service.js.map