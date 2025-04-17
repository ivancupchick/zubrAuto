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
exports.CarStatisticService = void 0;
const common_1 = require("@nestjs/common");
const api_error_1 = require("../../../core/exceptions/api.error");
const field_chain_service_1 = require("../../../core/fields/services/field-chain.service");
const prisma_service_1 = require("../../../prisma/prisma.service");
const CarStatistic_1 = require("../../../temp/entities/CarStatistic");
const FieldNames_1 = require("../../../temp/entities/FieldNames");
const Models_1 = require("../../../temp/entities/Models");
let CarStatisticService = class CarStatisticService {
    constructor(prisma, fieldChainService) {
        this.prisma = prisma;
        this.fieldChainService = fieldChainService;
    }
    async addCall(carIds) {
        const ids = carIds.filter(id => !Number.isNaN(id));
        if (ids.length === 0) {
            return { carIds };
        }
        await Promise.all([
            ...ids.map(id => {
                const timestamp = +(new Date());
                return this.prisma.carStatistic.create({ data: {
                        carId: id,
                        type: CarStatistic_1.CarStatistic.Type.call,
                        date: timestamp,
                        content: ''
                    } });
            })
        ]);
        return { carIds };
    }
    async createCarShowing(carId, carShowingContent) {
        if (!carShowingContent.date || !carShowingContent.status || !carShowingContent.clientId) {
            throw new Error("Ошибка в параметрах создаваемого показа");
        }
        const timestamp = +(new Date());
        const result = await this.prisma.carStatistic.create({ data: {
                carId,
                type: CarStatistic_1.CarStatistic.Type.showing,
                date: timestamp,
                content: JSON.stringify(carShowingContent)
            } });
        return result;
    }
    async updateCarShowing(carShowingId, carId, carShowingContent) {
        if (!carShowingContent.date || !carShowingContent.status || !carShowingContent.clientId) {
            throw new Error("Ошибка в параметрах редактируемого показа");
        }
        const allCarShowings = await this.prisma.carStatistic.findMany({ where: { carId: carId, type: CarStatistic_1.CarStatistic.Type.showing } });
        const carShowingExist = allCarShowings.find(cs => {
            const content = JSON.parse(cs.content);
            return cs.id === carShowingId && content.clientId === carShowingContent.clientId;
        });
        if (!carShowingExist) {
            throw new Error("Показ этому клиенту не найден");
        }
        const result = await this.prisma.carStatistic.update({ where: { id: carShowingExist.id }, data: {
                content: JSON.stringify(carShowingContent)
            } });
        return result;
    }
    async getCarShowingStatistic(carId) {
        const statisticRecords = await this.prisma.carStatistic.findMany({ where: { carId: carId, type: CarStatistic_1.CarStatistic.Type.showing } });
        const result = statisticRecords.map(r => {
            return {
                ...r,
                content: JSON.parse(r.content)
            };
        });
        return result;
    }
    async getAllCarStatistic(carId) {
        const statisticRecords = await this.prisma.carStatistic.findMany({ where: { carId: carId } });
        const showingStatistics = statisticRecords.filter(rec => rec.type === CarStatistic_1.CarStatistic.Type.showing).map(r => {
            return {
                ...r,
                content: JSON.parse(r.content)
            };
        }).filter(r => r.content.status !== CarStatistic_1.CarStatistic.ShowingStatus.cancel).map(r => {
            if (r.content.status === CarStatistic_1.CarStatistic.ShowingStatus.success) {
                r.date = BigInt(r.content.date);
            }
            return r;
        });
        const discountStatistics = statisticRecords.filter(rec => rec.type === CarStatistic_1.CarStatistic.Type.customerDiscount).map(r => {
            return {
                ...r,
                content: JSON.parse(r.content)
            };
        });
        const callStatistics = statisticRecords.filter(rec => rec.type === CarStatistic_1.CarStatistic.Type.call || rec.type === CarStatistic_1.CarStatistic.Type.customerCall);
        return [...showingStatistics, ...callStatistics, ...discountStatistics];
    }
    async addCustomerCall(carId) {
        const timestamp = +(new Date());
        await this.prisma.carStatistic.create({ data: {
                carId: carId,
                type: CarStatistic_1.CarStatistic.Type.customerCall,
                date: timestamp,
                content: ''
            } });
        const fieldConfig = await this.prisma.fields.findFirst({ where: { name: FieldNames_1.FieldNames.Car.dateOfLastCustomerCall } });
        const fieldIdExist = await this.fieldChainService.findOne({
            sourceName: Models_1.Models.Table.Cars,
            sourceId: carId,
            fieldId: fieldConfig.id,
        });
        if (fieldIdExist) {
            await this.fieldChainService.updateById(fieldIdExist.id, fieldIdExist.fieldId, { value: `${timestamp}` });
        }
        else {
            await this.fieldChainService.create({
                fieldId: fieldConfig.id,
                sourceId: carId,
                sourceName: Models_1.Models.Table.Cars,
                value: `${timestamp}`
            });
        }
        return { carId };
    }
    async addCustomerDiscount(carId, discount, amount) {
        const fieldConfig = await this.prisma.fields.findFirst({ where: { name: FieldNames_1.FieldNames.Car.carOwnerPrice } });
        const fieldChain = await this.fieldChainService.findOne({
            sourceName: Models_1.Models.Table.Cars,
            sourceId: carId,
            fieldId: fieldConfig.id,
        });
        if (amount !== +fieldChain.value) {
            throw api_error_1.ApiError.BadRequest(`Цена из запроса и цена из машины не сходяться.`);
        }
        const timestamp = +(new Date());
        await this.prisma.carStatistic.create({ data: {
                carId: carId,
                type: CarStatistic_1.CarStatistic.Type.customerDiscount,
                date: timestamp,
                content: JSON.stringify({ amount, discount })
            } });
        await this.fieldChainService.updateById(fieldChain.id, fieldChain.fieldId, { value: `${+fieldChain.value - discount}` });
        return { carId };
    }
};
exports.CarStatisticService = CarStatisticService;
exports.CarStatisticService = CarStatisticService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, field_chain_service_1.FieldChainService])
], CarStatisticService);
//# sourceMappingURL=car-statistic.service.js.map