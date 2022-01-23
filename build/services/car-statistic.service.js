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
const car_statistic_repository_1 = __importDefault(require("../repositories/base/car-statistic.repository"));
const CarStatistic_1 = require("../entities/CarStatistic");
const field_repository_1 = __importDefault(require("../repositories/base/field.repository"));
const FieldNames_1 = require("../entities/FieldNames");
const field_chain_repository_1 = __importDefault(require("../repositories/base/field-chain.repository"));
const api_error_1 = require("../exceptions/api.error");
class CarStatisticService {
    addCall(carIds) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([
                ...carIds.map(id => {
                    const timestamp = +(new Date());
                    return car_statistic_repository_1.default.create({
                        carId: id,
                        type: CarStatistic_1.CarStatistic.Type.call,
                        date: timestamp,
                        content: ''
                    });
                })
            ]);
            return { carIds };
        });
    }
    createCarShowing(carId, carShowingContent) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!carShowingContent.date || !carShowingContent.status || !carShowingContent.clientId) {
                throw new Error("Ошибка в параметрах создаваемого показа");
            }
            const timestamp = +(new Date());
            const result = yield car_statistic_repository_1.default.create({
                carId,
                type: CarStatistic_1.CarStatistic.Type.showing,
                date: timestamp,
                content: JSON.stringify(carShowingContent)
            });
            return result;
        });
    }
    updateCarShowing(carShowingId, carId, carShowingContent) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!carShowingContent.date || !carShowingContent.status || !carShowingContent.clientId) {
                throw new Error("Ошибка в параметрах редактируемого показа");
            }
            const allCarShowings = yield car_statistic_repository_1.default.find({ carId: [`${carId}`], type: [`${CarStatistic_1.CarStatistic.Type.showing}`] });
            const carShowingExist = allCarShowings.find(cs => {
                const content = JSON.parse(cs.content);
                return cs.id === carShowingId && content.clientId === carShowingContent.clientId;
            });
            if (!carShowingExist) {
                throw new Error("Показ этому клиенту не найден");
            }
            const result = yield car_statistic_repository_1.default.updateById(carShowingExist.id, {
                content: JSON.stringify(carShowingContent)
            });
            return result;
        });
    }
    getCarShowingStatistic(carId) {
        return __awaiter(this, void 0, void 0, function* () {
            const statisticRecords = yield car_statistic_repository_1.default.find({ carId: [`${carId}`], type: [`${CarStatistic_1.CarStatistic.Type.showing}`] });
            const result = statisticRecords.map(r => {
                return Object.assign(Object.assign({}, r), { content: JSON.parse(r.content) });
            });
            return result;
        });
    }
    getAllCarStatistic(carId) {
        return __awaiter(this, void 0, void 0, function* () {
            const statisticRecords = yield car_statistic_repository_1.default.find({ carId: [`${carId}`] });
            const showingStatistics = statisticRecords.filter(rec => rec.type === CarStatistic_1.CarStatistic.Type.showing).map(r => {
                return Object.assign(Object.assign({}, r), { content: JSON.parse(r.content) });
            }).filter(r => r.content.status !== CarStatistic_1.CarStatistic.ShowingStatus.cancel).map(r => {
                if (r.content.status === CarStatistic_1.CarStatistic.ShowingStatus.success) {
                    r.date = r.content.date;
                }
                return r;
            });
            const discountStatistics = statisticRecords.filter(rec => rec.type === CarStatistic_1.CarStatistic.Type.customerDiscount).map(r => {
                return Object.assign(Object.assign({}, r), { content: JSON.parse(r.content) });
            });
            const callStatistics = statisticRecords.filter(rec => rec.type === CarStatistic_1.CarStatistic.Type.call || rec.type === CarStatistic_1.CarStatistic.Type.customerCall);
            return [...showingStatistics, ...callStatistics, ...discountStatistics];
        });
    }
    addCustomerCall(carId) {
        return __awaiter(this, void 0, void 0, function* () {
            const timestamp = +(new Date());
            yield car_statistic_repository_1.default.create({
                carId: carId,
                type: CarStatistic_1.CarStatistic.Type.customerCall,
                date: timestamp,
                content: ''
            });
            const fieldConfig = yield field_repository_1.default.findOne({ name: [`${FieldNames_1.FieldNames.Car.dateOfLastCustomerCall}`] });
            yield field_chain_repository_1.default.update({ value: `${timestamp}` }, {
                fieldId: [`${fieldConfig.id}`],
                sourceId: [`${carId}`],
                sourceName: [`${Models_1.Models.CARS_TABLE_NAME}`]
            });
            return { carId };
        });
    }
    addCustomerDiscount(carId, discount, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const fieldConfig = yield field_repository_1.default.findOne({ name: [`${FieldNames_1.FieldNames.Car.carOwnerPrice}`] });
            const fieldChain = yield field_chain_repository_1.default.findOne({
                fieldId: [`${fieldConfig.id}`],
                sourceId: [`${carId}`],
                sourceName: [`${Models_1.Models.CARS_TABLE_NAME}`]
            });
            if (amount !== +fieldChain.value) {
                throw api_error_1.ApiError.BadRequest(`Цена из запроса и цена из машины не сходяться.`); // Error codes
            }
            const timestamp = +(new Date());
            yield car_statistic_repository_1.default.create({
                carId: carId,
                type: CarStatistic_1.CarStatistic.Type.customerDiscount,
                date: timestamp,
                content: JSON.stringify({ amount, discount })
            });
            yield field_chain_repository_1.default.updateById(fieldChain.id, { value: `${+fieldChain.value - discount}` });
            return { carId };
        });
    }
}
module.exports = new CarStatisticService();
//# sourceMappingURL=car-statistic.service.js.map