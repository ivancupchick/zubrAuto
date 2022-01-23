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
const car_form_repository_1 = __importDefault(require("../repositories/base/car-form.repository"));
const car_owner_repository_1 = __importDefault(require("../repositories/base/car-owner.repository"));
const car_repository_1 = __importDefault(require("../repositories/base/car.repository"));
const field_chain_repository_1 = __importDefault(require("../repositories/base/field-chain.repository"));
const field_repository_1 = __importDefault(require("../repositories/base/field.repository"));
const field_utils_1 = require("../utils/field.utils");
const car_info_getter_service_1 = __importDefault(require("./car-info-getter.service"));
const field_chain_service_1 = __importDefault(require("./field-chain.service"));
const field_service_1 = __importDefault(require("./field.service"));
const user_service_1 = __importDefault(require("./user.service"));
class CarService {
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const [cars, carFields, carOwners, carOwnerFields, carForms,] = yield Promise.all([
                car_repository_1.default.getAll(),
                field_service_1.default.getFieldsByDomain(Field_1.FieldDomains.Car),
                car_owner_repository_1.default.getAll(),
                field_service_1.default.getFieldsByDomain(Field_1.FieldDomains.CarOwner),
                car_form_repository_1.default.getAll(),
            ]);
            const [allCarChaines, allCarOwnerChaines] = yield Promise.all([
                yield field_chain_repository_1.default.find({
                    sourceId: cars.map(c => `${c.id}`),
                    sourceName: [`${Models_1.Models.CARS_TABLE_NAME}`]
                }),
                yield field_chain_repository_1.default.find({
                    sourceId: carOwners.map(c => `${c.id}`),
                    sourceName: [`${Models_1.Models.CAR_OWNERS_TABLE_NAME}`]
                })
            ]);
            const allUsers = yield user_service_1.default.getAll();
            const result = cars.map(car => {
                var _a;
                const carForm = carForms.find(form => form.carId === car.id);
                const workSheetField = carFields.find(f => f.name === FieldNames_1.FieldNames.Car.worksheet);
                const userIdField = carFields.find(f => f.name === FieldNames_1.FieldNames.Car.contactCenterSpecialistId);
                const userIdValue = allCarChaines.find(ch => ch.fieldId === userIdField.id && ch.sourceId === car.id && ch.sourceName === Models_1.Models.CARS_TABLE_NAME);
                const user = allUsers.find(dbUser => dbUser.id === +(userIdValue || {}).value);
                const userField = carFields.find(f => f.name === FieldNames_1.FieldNames.Car.contactCenterSpecialist);
                if (carForm && workSheetField) {
                    allCarChaines.forEach(ch => {
                        if (ch.fieldId === workSheetField.id && ch.sourceId === car.id && ch.sourceName === Models_1.Models.CARS_TABLE_NAME) {
                            ch.value = carForm.content;
                        }
                    });
                }
                if (user && userField) {
                    allCarChaines.forEach(ch => {
                        if (ch.fieldId === userField.id && ch.sourceId === car.id && ch.sourceName === Models_1.Models.CARS_TABLE_NAME) {
                            ch.value = JSON.stringify(user);
                        }
                    });
                }
                const carRealFields = (0, field_utils_1.getFieldsWithValues)(carFields, allCarChaines, car.id);
                return {
                    id: car.id,
                    createdDate: car.createdDate,
                    ownerId: car.ownerId,
                    ownerNumber: ((_a = carOwners.find(co => co.id === car.ownerId)) === null || _a === void 0 ? void 0 : _a.number) || '',
                    fields: [
                        ...carRealFields,
                        ...(0, field_utils_1.getFieldsWithValues)(carOwnerFields, allCarOwnerChaines, car.ownerId)
                    ]
                };
            });
            return result;
        });
    }
    getCarAndOwnerCarFields(carData) {
        return __awaiter(this, void 0, void 0, function* () {
            const carOwnerFieldsConfigs = yield field_service_1.default.getFieldsByDomain(Field_1.FieldDomains.CarOwner);
            const ownerFields = carData.fields.filter(f => !!carOwnerFieldsConfigs.find(fc => fc.id === f.id));
            const carFields = carData.fields.filter(f => !carOwnerFieldsConfigs.find(of => of.id === f.id));
            return [ownerFields, carFields];
        });
    }
    create(carData) {
        return __awaiter(this, void 0, void 0, function* () {
            const [ownerFields, carFields] = yield this.getCarAndOwnerCarFields(carData);
            const existCarOwner = yield car_owner_repository_1.default.findOne({ number: [`${carData.ownerNumber}`] });
            const ownerId = !existCarOwner
                ? (yield car_owner_repository_1.default.create({ number: carData.ownerNumber })).id
                : existCarOwner.id;
            const existCarIds = yield car_repository_1.default.find({ ownerId: [`${(existCarOwner === null || existCarOwner === void 0 ? void 0 : existCarOwner.id) || -1}`] });
            if (existCarIds.length > 0) {
                const fields = yield field_repository_1.default.find({ name: [FieldNames_1.FieldNames.Car.mark, FieldNames_1.FieldNames.Car.model, FieldNames_1.FieldNames.Car.mileage] });
                const carFieldChains = (yield Promise.all(existCarIds
                    .map(car => field_chain_repository_1.default.find({
                    sourceId: [`${car.id}`],
                    sourceName: [Models_1.Models.CARS_TABLE_NAME],
                    fieldId: fields.map(f => `${f.id}`)
                })))).reduce(function (prev, next) {
                    return prev.concat(next);
                });
                const realFields = fields
                    .map(f => {
                    var _a, _b;
                    return (Object.assign(Object.assign({}, f), { carId: ((_a = carFieldChains.find(cfc => cfc.fieldId === f.id)) === null || _a === void 0 ? void 0 : _a.sourceId) || -1, value: ((_b = carFieldChains.find(cfc => cfc.fieldId === f.id)) === null || _b === void 0 ? void 0 : _b.value) || '' }));
                }).filter(f => f.carId !== -1);
                const realFieldsMatches = realFields
                    .filter(rf => {
                    const field = carData.fields.find(f => f.id === rf.id);
                    return rf.value === field.value;
                });
                let matches = {};
                realFieldsMatches.forEach(rfm => {
                    if (!matches[rfm.carId]) {
                        matches[rfm.carId] = [rfm.id];
                    }
                    else {
                        matches[rfm.carId].push(rfm.id);
                    }
                });
                let trueMatches = 0;
                for (const key in matches) {
                    if (Object.prototype.hasOwnProperty.call(matches, key)) {
                        const element = matches[key];
                        if (element.length > 0) {
                            ++trueMatches;
                        }
                    }
                }
                if (trueMatches > 0) {
                    return { id: -1 };
                }
            }
            if (!existCarOwner) {
                yield Promise.all(ownerFields.map(f => field_chain_service_1.default.createFieldChain({
                    sourceId: ownerId,
                    fieldId: f.id,
                    value: f.value,
                    sourceName: Models_1.Models.CAR_OWNERS_TABLE_NAME
                })));
            }
            else {
                // await carOwnerRepository.updateById(existCarOwner.id, { // not need
                //   id: 0,
                //   number: carData.ownerNumber
                // })
                yield Promise.all(ownerFields.map(f => field_chain_repository_1.default.update({
                    value: f.value
                }, {
                    fieldId: [`${f.id}`],
                    sourceId: [`${ownerId}`],
                    sourceName: [Models_1.Models.CAR_OWNERS_TABLE_NAME]
                })));
            }
            const car = yield car_repository_1.default.create({
                createdDate: `${(new Date()).getTime()}`,
                ownerId
            });
            yield Promise.all(carFields.map(f => field_chain_service_1.default.createFieldChain({
                sourceId: car.id,
                fieldId: f.id,
                value: f.value,
                sourceName: Models_1.Models.CARS_TABLE_NAME
            })));
            return { id: car.id };
        });
    }
    update(carId, carData) {
        return __awaiter(this, void 0, void 0, function* () {
            const [ownerFields, carFields] = yield this.getCarAndOwnerCarFields(carData);
            let needUpdate = false;
            const existCar = yield car_repository_1.default.findById(carId);
            const existCarOwnerById = yield car_owner_repository_1.default.findOne({ id: [`${existCar.ownerId}`] });
            const existCarOwnerByNumber = carData.ownerNumber ? yield car_owner_repository_1.default.findOne({ number: [`${carData.ownerNumber}`] }) : null;
            let carOwner = existCarOwnerById;
            if (!existCarOwnerByNumber && carData.ownerNumber) {
                carOwner = yield car_owner_repository_1.default.updateById(existCar.ownerId, { number: carData.ownerNumber });
                // } else if (existCarOwnerById.number === existCarOwnerByNumber.number) {
            }
            else if (existCarOwnerById && existCarOwnerByNumber && existCarOwnerByNumber.number !== existCarOwnerById.number) {
                carData = Object.assign({}, carData, { ownerId: existCarOwnerByNumber.id });
                carOwner = existCarOwnerByNumber;
                needUpdate = true;
            }
            yield Promise.all(ownerFields.map(f => field_chain_repository_1.default.update({
                value: f.value
            }, {
                fieldId: [`${f.id}`],
                sourceId: [`${carOwner.id}`],
                sourceName: [Models_1.Models.CAR_OWNERS_TABLE_NAME]
            })));
            if (needUpdate) {
                delete carData.fields;
                yield car_repository_1.default.updateById(carId, carData);
            }
            const worksheetField = carFields.find(f => f.name === FieldNames_1.FieldNames.Car.worksheet);
            if (worksheetField && worksheetField.value) {
                const carFormExist = yield car_form_repository_1.default.findOne({ carId: [`${carId}`] });
                if (carFormExist) {
                    yield car_form_repository_1.default.updateById(carFormExist.id, { content: worksheetField.value });
                }
                else {
                    yield car_form_repository_1.default.create({ carId, content: worksheetField.value });
                }
            }
            const cf = carFields.filter(f => f.name !== FieldNames_1.FieldNames.Car.worksheet);
            yield Promise.all(cf.map(f => field_chain_repository_1.default.update({
                value: f.value
            }, {
                fieldId: [`${f.id}`],
                sourceId: [`${carId}`],
                sourceName: [Models_1.Models.CARS_TABLE_NAME]
            })));
            return { id: carId };
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const chaines = yield field_chain_repository_1.default.find({
                sourceId: [`${id}`],
                sourceName: [Models_1.Models.CARS_TABLE_NAME]
            });
            yield Promise.all(chaines.map(ch => field_chain_service_1.default.deleteFieldChain(ch.id)));
            const car = yield car_repository_1.default.deleteById(id);
            return car;
        });
    }
    get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [car, carFields, carOwnerFields] = yield Promise.all([
                car_repository_1.default.findById(id),
                field_service_1.default.getFieldsByDomain(Field_1.FieldDomains.Car),
                field_service_1.default.getFieldsByDomain(Field_1.FieldDomains.CarOwner),
            ]);
            const carOwner = yield car_owner_repository_1.default.findById(car.ownerId);
            const [carChaines, carOwnerChaines] = yield Promise.all([
                yield field_chain_repository_1.default.find({
                    sourceId: [`${car.id}`],
                    sourceName: [`${Models_1.Models.CARS_TABLE_NAME}`]
                }),
                yield field_chain_repository_1.default.find({
                    sourceId: [`${carOwner.id}`],
                    sourceName: [`${Models_1.Models.CAR_OWNERS_TABLE_NAME}`]
                })
            ]);
            const result = {
                id: car.id,
                createdDate: car.createdDate,
                ownerId: car.ownerId,
                ownerNumber: carOwner.number,
                fields: [
                    ...(0, field_utils_1.getFieldsWithValues)(carFields, carChaines, car.id),
                    ...(0, field_utils_1.getFieldsWithValues)(carOwnerFields, carOwnerChaines, car.ownerId)
                ]
            };
            return result;
        });
    }
    createCarsByLink(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const [carFields, carOwnerFields] = yield Promise.all([
                field_service_1.default.getFieldsByDomain(Field_1.FieldDomains.Car),
                field_service_1.default.getFieldsByDomain(Field_1.FieldDomains.CarOwner),
            ]);
            const queries = data.link.split('?')[1];
            const createCarData = yield car_info_getter_service_1.default.getCarsInfo(queries, carFields, carOwnerFields, data.userId);
            if (createCarData.length === 0) {
                return [];
            }
            const createdCarIds = yield Promise.all(createCarData.map(cc => this.create(cc)));
            const result = createdCarIds.map((r, i) => {
                if (r.id === -1) {
                    const carData = createCarData[i];
                    return Object.assign(Object.assign({}, carData), { id: -1 }); // TODO! Maybe rethink minor errors for all apies...
                }
                return Object.assign({}, r);
            });
            return result;
        });
    }
}
module.exports = new CarService();
//# sourceMappingURL=car.service.js.map