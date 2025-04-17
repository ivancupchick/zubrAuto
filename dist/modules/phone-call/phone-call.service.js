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
exports.PhoneCallService = void 0;
const common_1 = require("@nestjs/common");
const webhook_1 = require("../../temp/models/webhook");
const prisma_service_1 = require("../../prisma/prisma.service");
const json_util_1 = require("../../core/utils/json.util");
const enitities_functions_1 = require("../../core/utils/enitities-functions");
const client_1 = require("@prisma/client");
let PhoneCallService = class PhoneCallService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async webHookNotify(webhook) {
        let existPhoneCall = null;
        if (webhook.notificationType === webhook_1.Webhook.NotificationType.State || webhook.notificationType === webhook_1.Webhook.NotificationType.Finish) {
            existPhoneCall = await this.prisma.phoneCalls.findFirst({ where: {
                    innerNumber: webhook.numberB,
                    clientNumber: webhook.numberA,
                } });
        }
        if (webhook.notificationType === webhook_1.Webhook.NotificationType.Start || !existPhoneCall) {
            const date = webhook.notificationType === webhook_1.Webhook.NotificationType.Start
                ? webhook.date
                : (new Date()).toString();
            const crmCallType = webhook.notificationType === webhook_1.Webhook.NotificationType.Start
                ? webhook.crmCallType
                : webhook_1.Webhook.CallType.Internal;
            const phoneCall = {
                originalNotifications: JSON.stringify([webhook]),
                innerNumber: webhook.numberB,
                clientNumber: webhook.numberA,
                createdDate: BigInt(+(new Date())),
                userId: null,
                originalDate: date,
                uuid: webhook.uuid,
                type: crmCallType,
                status: null,
                isFinished: false,
                recordUrl: null,
                isUsed: false,
            };
            return await this.prisma.phoneCalls.create({ data: phoneCall });
        }
        if (webhook.notificationType === webhook_1.Webhook.NotificationType.State) {
            const phoneCall = await this.prisma.phoneCalls.findFirst({ where: {
                    innerNumber: webhook.numberB,
                    clientNumber: webhook.numberA,
                } });
            if (phoneCall) {
                const oldNotifications = (0, json_util_1.JSONparse)(phoneCall.originalNotifications) || [];
                phoneCall.originalNotifications = JSON.stringify([...oldNotifications, webhook]);
                return await this.prisma.phoneCalls.update({ where: { id: phoneCall.id }, data: phoneCall });
            }
        }
        if (webhook.notificationType === webhook_1.Webhook.NotificationType.Finish) {
            const phoneCall = await this.prisma.phoneCalls.findFirst({ where: {
                    innerNumber: webhook.numberB,
                    clientNumber: webhook.numberA,
                } });
            if (phoneCall) {
                const oldNotifications = (0, json_util_1.JSONparse)(phoneCall.originalNotifications) || [];
                phoneCall.originalNotifications = JSON.stringify([...oldNotifications, webhook]);
                phoneCall.status = webhook.crmCallFinishedStatus;
                phoneCall.isFinished = webhook.isCallFinished;
                phoneCall.recordUrl = webhook.fullUrl;
                return await this.prisma.phoneCalls.update({ where: { id: phoneCall.id }, data: phoneCall });
            }
        }
        return null;
    }
    async findAll() {
        const [requests,] = await Promise.all([
            this.prisma.phoneCalls.findMany(),
        ]);
        return this.getEntities(requests);
    }
    async getEntities(entities) {
        return entities;
    }
    async findMany(query) {
        const { page, size, sortOrder, } = query;
        delete query['page'];
        delete query['size'];
        const searchEntitiesIds = await (0, enitities_functions_1.getEntityIdsByNaturalQuery)(this.prisma.phoneCalls, query);
        let entitiesIds = [...searchEntitiesIds];
        if (page && size) {
            const start = (+page - 1) * +size;
            entitiesIds = entitiesIds.slice(start, start + +size);
        }
        const requests = entitiesIds.length > 0 ? await this.prisma.phoneCalls.findMany({ where: {
                id: { in: entitiesIds }
            } }) : [];
        let list = await this.getEntities(requests);
        if (sortOrder === client_1.Prisma.SortOrder.desc) {
            list = list.reverse();
        }
        return {
            list: list,
            total: searchEntitiesIds.length
        };
    }
    create(createPhoneCallDto) {
        return 'This action adds a new phoneCall';
    }
    async findOne(id) {
        const phoneCall = await this.prisma.phoneCalls.findUnique({ where: { id } });
        return phoneCall;
    }
    async update(id, updatePhoneCallDto) {
        const phoneCall = await this.prisma.phoneCalls.update({ where: { id }, data: updatePhoneCallDto });
        return phoneCall;
    }
    async remove(id) {
        const phoneCall = await this.prisma.phoneCalls.delete({ where: { id } });
        return phoneCall;
    }
};
exports.PhoneCallService = PhoneCallService;
exports.PhoneCallService = PhoneCallService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PhoneCallService);
//# sourceMappingURL=phone-call.service.js.map