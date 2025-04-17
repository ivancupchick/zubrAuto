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
exports.CallRequestService = void 0;
const common_1 = require("@nestjs/common");
const Models_1 = require("../../temp/entities/Models");
const prisma_service_1 = require("../../prisma/prisma.service");
const enitities_functions_1 = require("../../core/utils/enitities-functions");
const client_1 = require("@prisma/client");
const number_utils_1 = require("../../core/utils/number.utils");
let CallRequestService = class CallRequestService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async callRequest(sitesCallRequest) {
        let users = await this.prisma.fieldIds.findMany({
            where: {
                fieldId: 50,
                sourceName: Models_1.Models.Table.Users,
                value: sitesCallRequest.source,
            },
        });
        if (!users.length) {
            users = await this.prisma.fieldIds.findMany({
                where: {
                    fieldId: 50,
                    sourceName: Models_1.Models.Table.Users,
                    value: 'all',
                },
            });
        }
        let userIds = users.map((ef) => +ef.sourceId);
        const existUsers = await this.prisma.users.findMany({
            where: { id: { in: userIds }, deleted: false },
        });
        userIds = existUsers.map((u) => +u.id);
        const allRequests = await this.prisma.callRequests.findMany({
            where: {
                userId: { in: userIds },
            },
            orderBy: { createdDate: client_1.Prisma.SortOrder.desc },
        });
        let id = 0;
        if (!allRequests.length) {
            id = userIds[0];
        }
        else {
            const lastUserIndex = userIds.findIndex((id) => +id === +allRequests[0].userId);
            id = userIds[lastUserIndex + 1] || userIds[0];
        }
        const callRequest = {
            originalNotification: JSON.stringify(sitesCallRequest),
            innerNumber: '',
            clientNumber: (0, number_utils_1.convertClientNumber)(sitesCallRequest.number) || sitesCallRequest.number,
            createdDate: BigInt(+new Date()),
            userId: +id || null,
            comment: sitesCallRequest.comment,
            source: sitesCallRequest.source,
            isUsed: false,
        };
        return await this.prisma.callRequests.create({ data: callRequest });
    }
    async create(createCallRequestDto) {
        return 'This action adds a new callRequest';
    }
    async findAll() {
        const [requests] = await Promise.all([this.prisma.callRequests.findMany()]);
        return this.getCallRequests(requests);
    }
    async getCallRequests(requests) {
        return requests;
    }
    async findMany(query) {
        const { page, size, sortOrder } = query;
        delete query['page'];
        delete query['size'];
        const searchCallRequestsIds = await (0, enitities_functions_1.getEntityIdsByNaturalQuery)(this.prisma.callRequests, query);
        let callRequestsIds = [...searchCallRequestsIds];
        if (page && size) {
            const start = (+page - 1) * +size;
            callRequestsIds = callRequestsIds.slice(start, start + +size);
        }
        const requests = callRequestsIds.length > 0
            ? await this.prisma.callRequests.findMany({
                where: {
                    id: { in: callRequestsIds },
                },
            })
            : [];
        let list = await this.getCallRequests(requests);
        if (sortOrder === client_1.Prisma.SortOrder.desc) {
            list = list.reverse();
        }
        return {
            list: list,
            total: searchCallRequestsIds.length,
        };
    }
    async findOne(id) {
        const callRequest = await this.prisma.callRequests.findUnique({
            where: { id },
        });
        return callRequest;
    }
    async update(id, updateCallRequestDto) {
        const callRequest = await this.prisma.callRequests.update({
            where: { id },
            data: updateCallRequestDto,
        });
        return callRequest;
    }
    async remove(id) {
        const callRequest = await this.prisma.callRequests.delete({
            where: { id },
        });
        return callRequest;
    }
};
exports.CallRequestService = CallRequestService;
exports.CallRequestService = CallRequestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CallRequestService);
//# sourceMappingURL=call-request.service.js.map