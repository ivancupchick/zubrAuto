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
const Field_1 = require("../entities/Field");
const FieldNames_1 = require("../entities/FieldNames");
const Models_1 = require("../entities/Models");
const client_repository_1 = __importDefault(require("../repositories/base/client.repository"));
const field_chain_repository_1 = __importDefault(require("../repositories/base/field-chain.repository"));
const field_utils_1 = require("../utils/field.utils");
const car_statistic_service_1 = __importDefault(require("./car-statistic.service"));
const field_chain_service_1 = __importDefault(require("./field-chain.service"));
const field_service_1 = __importDefault(require("./field.service"));
class ClientService {
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const [clients, relatedFields] = yield Promise.all([
                client_repository_1.default.getAll(),
                field_service_1.default.getFieldsByDomain(Field_1.FieldDomains.Client)
            ]);
            const chaines = yield field_chain_repository_1.default.find({
                sourceId: clients.map(c => `${c.id}`),
                sourceName: [`${Models_1.Models.CLIENTS_TABLE_NAME}`]
            });
            const result = clients.map(client => ({
                id: client.id,
                carIds: client.carIds,
                fields: (0, field_utils_1.getFieldsWithValues)(relatedFields, chaines, client.id)
            }));
            return result;
        });
    }
    create(clientData) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield client_repository_1.default.create({
                carIds: clientData.carIds
            });
            yield car_statistic_service_1.default.addCall(clientData.carIds.split(',').map(id => +id));
            yield Promise.all(clientData.fields.map(f => field_chain_service_1.default.createFieldChain({
                sourceId: client.id,
                fieldId: f.id,
                value: f.value,
                sourceName: Models_1.Models.CLIENTS_TABLE_NAME
            })));
            return client;
        });
    }
    update(id, clientData) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield client_repository_1.default.updateById(id, {
                carIds: clientData.carIds
            });
            yield Promise.all(clientData.fields.map(f => field_chain_repository_1.default.update({
                value: f.value
            }, {
                fieldId: [f.id].map(c => `${c}`),
                sourceId: [id].map(c => `${c}`),
                sourceName: [Models_1.Models.CLIENTS_TABLE_NAME]
            })));
            return client;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const chaines = yield field_chain_repository_1.default.find({
                sourceId: [`${id}`],
                sourceName: [Models_1.Models.CLIENTS_TABLE_NAME]
            });
            yield Promise.all(chaines.map(ch => field_chain_service_1.default.deleteFieldChain(ch.id)));
            const client = yield client_repository_1.default.deleteById(id);
            return client;
        });
    }
    get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield client_repository_1.default.findById(id);
            const relatedFields = yield field_service_1.default.getFieldsByDomain(Field_1.FieldDomains.Client);
            const chaines = yield field_chain_repository_1.default.find({
                sourceId: [`${id}`],
                sourceName: [`${Models_1.Models.CLIENTS_TABLE_NAME}`]
            });
            const result = {
                id: client.id,
                carIds: client.carIds,
                fields: (0, field_utils_1.getFieldsWithValues)(relatedFields, chaines, client.id)
            };
            return result;
        });
    }
    completeDeal(clientId, carId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [clientFields, carFields,] = yield Promise.all([
                field_service_1.default.getFieldsByDomain(Field_1.FieldDomains.Client),
                field_service_1.default.getFieldsByDomain(Field_1.FieldDomains.Car),
            ]);
            const clientStatusField = clientFields.find(cf => cf.name === FieldNames_1.FieldNames.Client.dealStatus);
            const carStatusField = carFields.find(cf => cf.name === FieldNames_1.FieldNames.Car.status);
            const [clientStatusChain, carStatusChain,] = yield Promise.all([
                field_chain_repository_1.default.findOne({ fieldId: [`${clientStatusField.id}`], sourceId: [`${clientId}`], sourceName: [`${Models_1.Models.CLIENTS_TABLE_NAME}`] }),
                field_chain_repository_1.default.findOne({ fieldId: [`${carStatusField.id}`], sourceId: [`${carId}`], sourceName: [`${Models_1.Models.CARS_TABLE_NAME}`] }),
            ]);
            const clientStatusIndex = clientStatusField.variants.split(',').findIndex(v => v === FieldNames_1.FieldNames.DealStatus.Sold);
            const carStatusIndex = carStatusField.variants.split(',').findIndex(v => v === FieldNames_1.FieldNames.CarStatus.customerService_Sold);
            const clientStatus = `${FieldNames_1.FieldNames.Client.dealStatus}-${clientStatusIndex !== -1 ? clientStatusIndex : 0}`;
            const carStatus = `${FieldNames_1.FieldNames.Car.status}-${carStatusIndex !== -1 ? carStatusIndex : 0}`;
            const res = yield Promise.all([
                field_chain_service_1.default.updateFieldChain(clientStatusChain.id, { value: clientStatus }),
                field_chain_service_1.default.updateFieldChain(carStatusChain.id, { value: carStatus }),
            ]);
            // TODO Delete all related carShowings
            return res;
        });
    }
}
module.exports = new ClientService();
//# sourceMappingURL=client.service.js.map