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
exports.CarService = void 0;
const common_1 = require("@nestjs/common");
const Models_1 = require("../../temp/entities/Models");
const prisma_service_1 = require("../../prisma/prisma.service");
const fields_service_1 = require("../../core/fields/fields.service");
const field_chain_service_1 = require("../../core/fields/services/field-chain.service");
const FieldNames_1 = require("../../temp/entities/FieldNames");
const user_service_1 = require("../user/user.service");
const field_utils_1 = require("../../core/utils/field.utils");
const fields_1 = require("../../core/fields/fields");
const car_info_getter_service_1 = require("./services/car-info-getter.service");
let CarService = class CarService {
    constructor(prisma, userService, fieldsService, fieldChainService, carInfoGetterService) {
        this.prisma = prisma;
        this.userService = userService;
        this.fieldsService = fieldsService;
        this.fieldChainService = fieldChainService;
        this.carInfoGetterService = carInfoGetterService;
    }
    async getCars(cars, carFields, carOwners, carOwnerFields) {
        if (cars.length === 0) {
            return [];
        }
        const [allCarChaines, allCarOwnerChaines, carForms] = await Promise.all([
            (cars.length > 0 ? await this.fieldChainService.findMany({
                sourceName: Models_1.Models.Table.Cars,
                sourceId: { in: cars.map(c => c.id) },
            }) : []),
            (carOwners.length > 0 ? await this.fieldChainService.findMany({
                sourceName: Models_1.Models.Table.CarOwners,
                sourceId: { in: carOwners.map(c => c.id) },
            }) : []),
            (cars.length > 0 ? await this.prisma.carForms.findMany({ where: {
                    carId: { in: cars.map(c => c.id) }
                } }) : [])
        ]);
        const contactCenterSpecialistIdField = carFields.find(f => f.name === FieldNames_1.FieldNames.Car.contactCenterSpecialistId);
        const workSheetField = carFields.find(f => f.name === FieldNames_1.FieldNames.Car.worksheet);
        const contactCenterSpecialistField = carFields.find(f => f.name === FieldNames_1.FieldNames.Car.contactCenterSpecialist);
        if (!contactCenterSpecialistIdField || !workSheetField || !contactCenterSpecialistField) {
            throw new Error("!contactCenterSpecialistIdField || !workSheetField || !contactCenterSpecialistField");
        }
        const allUsers = await this.userService.findAll();
        const result = cars.map(car => {
            const carChaines = allCarChaines.filter(ch => ch.sourceId === car.id);
            const carOwnerChaines = allCarOwnerChaines.filter(ch => ch.sourceId === car.ownerId);
            const carForm = carForms.find(form => form.carId === car.id);
            const userIdValue = carChaines.find(ch => ch.fieldId === contactCenterSpecialistIdField.id);
            const userId = userIdValue && userIdValue.value ? +userIdValue.value : -1;
            const user = allUsers.list.find(dbUser => dbUser.id === userId);
            if (carForm) {
                carChaines.find(ch => {
                    if (ch.fieldId === workSheetField.id) {
                        ch.value = carForm.content;
                        return true;
                    }
                    return false;
                });
            }
            if (user) {
                const r = carChaines.find(ch => {
                    if (ch.fieldId === contactCenterSpecialistField.id) {
                        ch.value = JSON.stringify(user);
                        return true;
                    }
                    return false;
                });
                if (!r) {
                    carChaines.push({
                        id: -1,
                        sourceId: car.id,
                        fieldId: contactCenterSpecialistField.id,
                        value: JSON.stringify(user),
                        sourceName: `${Models_1.Models.Table.Cars}`
                    });
                }
            }
            return {
                id: car.id,
                createdDate: car.createdDate,
                ownerId: car.ownerId,
                ownerNumber: carOwners.find(co => co.id === car.ownerId)?.number || '',
                fields: [
                    ...(0, field_utils_1.getFieldsWithValues)(carFields, carChaines, car.id),
                    ...(0, field_utils_1.getFieldsWithValues)(carOwnerFields, carOwnerChaines, car.ownerId)
                ]
            };
        });
        return result;
    }
    async findOne(id) {
        const [car, carFields, carOwnerFields,] = await Promise.all([
            this.prisma.cars.findUnique({ where: { id } }),
            this.fieldsService.getFieldsByDomain(fields_1.FieldDomains.Car),
            this.fieldsService.getFieldsByDomain(fields_1.FieldDomains.CarOwner),
        ]);
        const carOwner = await this.prisma.carOwners.findUnique({ where: { id: car.ownerId } });
        const result = await this.getCars([car], carFields, [carOwner], carOwnerFields);
        return result[0];
    }
    async findAll() {
        const [cars, carFields, carOwners, carOwnerFields,] = await Promise.all([
            this.prisma.cars.findMany(),
            this.fieldsService.getFieldsByDomain(fields_1.FieldDomains.Car),
            this.prisma.carOwners.findMany(),
            this.fieldsService.getFieldsByDomain(fields_1.FieldDomains.CarOwner),
        ]);
        return this.getCars(cars, carFields, carOwners, carOwnerFields);
    }
    async findMany(query) {
        const { page, size, } = query;
        delete query['page'];
        delete query['size'];
        const searchCarIds = await this.fieldChainService.getEntityIdsByQuery(Models_1.Models.Table.Cars, fields_1.FieldDomains.Car, query);
        let carIds = [...searchCarIds];
        if (page && size) {
            const start = (+page - 1) * +size;
            carIds = carIds.slice(start, start + +size);
        }
        const cars = carIds.length > 0 ? await this.prisma.cars.findMany({ where: {
                id: { in: carIds.map(id => +id) }
            } }) : [];
        const [carFields, carOwners, carOwnerFields,] = await Promise.all([
            this.fieldsService.getFieldsByDomain(fields_1.FieldDomains.Car),
            (cars.length > 0 ? await this.prisma.carOwners.findMany({ where: {
                    id: { in: cars.map(c => c.ownerId) }
                } }) : []),
            this.fieldsService.getFieldsByDomain(fields_1.FieldDomains.CarOwner),
        ]);
        return this.getCars(cars, carFields, carOwners, carOwnerFields);
    }
    async getCarAndOwnerCarFields(carData) {
        const carOwnerFieldsConfigs = await this.fieldsService.getFieldsByDomain(fields_1.FieldDomains.CarOwner);
        const ownerFields = carData.fields.filter(f => !!carOwnerFieldsConfigs.find(fc => fc.id === f.id));
        const carFields = carData.fields.filter(f => !carOwnerFieldsConfigs.find(of => of.id === f.id));
        return [ownerFields, carFields];
    }
    async createCarInDB(createCarDto) {
        const [ownerFields, carFields] = await this.getCarAndOwnerCarFields(createCarDto);
        const existCarOwner = false;
        const ownerId = (await this.prisma.carOwners.create({ data: { number: createCarDto.ownerNumber } })).id;
        if (!existCarOwner) {
            await Promise.all(ownerFields.map(f => this.fieldChainService.create({
                sourceId: ownerId,
                fieldId: f.id,
                value: f.value,
                sourceName: Models_1.Models.Table.CarOwners
            })));
        }
        else {
            await Promise.all(ownerFields.map(f => this.fieldChainService.update({
                value: f.value
            }, {
                fieldId: f.id,
                sourceId: ownerId,
                sourceName: Models_1.Models.Table.CarOwners
            })));
        }
        const statusField = await this.prisma.fields.findFirst({ where: { name: FieldNames_1.FieldNames.Car.status, domain: fields_1.FieldDomains.Car } });
        if (statusField) {
            const statusFieldRequest = {
                id: statusField.id,
                name: FieldNames_1.FieldNames.Car.status,
                value: 'status-0'
            };
            const statusFieldRequestExist = carFields.find(f => f.id === statusFieldRequest.id);
            if (!statusFieldRequestExist || !statusFieldRequestExist.value) {
                carFields.push(statusFieldRequest);
            }
        }
        const car = await this.prisma.cars.create({ data: {
                createdDate: `${(new Date()).getTime()}`,
                ownerId
            } });
        await Promise.all(carFields.map(f => this.fieldChainService.create({
            sourceId: car.id,
            fieldId: f.id,
            value: f.value,
            sourceName: Models_1.Models.Table.Cars
        })));
        return { id: car.id };
    }
    async create(createCarDto) {
        const [ownerFields, carFields] = await this.getCarAndOwnerCarFields(createCarDto);
        const existCarOwner = false;
        const ownerId = (await this.prisma.carOwners.create({ data: { number: createCarDto.ownerNumber } })).id;
        const searchFields = await this.prisma.fields.findMany({ where: { name: FieldNames_1.FieldNames.Car.linkToAd } });
        const existCarChain = await this.fieldChainService.findMany({
            sourceName: Models_1.Models.Table.Cars,
            fieldId: { in: searchFields.map(f => f.id) },
            value: field_utils_1.FieldsUtils.getFieldValue(createCarDto, FieldNames_1.FieldNames.Car.linkToAd)
        });
        if (existCarChain.length > 0) {
            return { id: -1 };
        }
        if (!existCarOwner) {
            await Promise.all(ownerFields.map(f => this.fieldChainService.create({
                sourceId: ownerId,
                fieldId: f.id,
                value: f.value,
                sourceName: Models_1.Models.Table.CarOwners
            })));
        }
        else {
            await Promise.all(ownerFields.map(f => this.fieldChainService.update({
                value: f.value
            }, {
                fieldId: f.id,
                sourceId: ownerId,
                sourceName: Models_1.Models.Table.CarOwners
            })));
        }
        const statusField = await this.prisma.fields.findFirst({ where: { name: FieldNames_1.FieldNames.Car.status, domain: fields_1.FieldDomains.Car } });
        if (statusField) {
            const statusFieldRequest = {
                id: statusField.id,
                name: FieldNames_1.FieldNames.Car.status,
                value: 'status-0'
            };
            const statusFieldRequestExist = carFields.find(f => f.id === statusFieldRequest.id);
            if (!statusFieldRequestExist || !statusFieldRequestExist.value) {
                carFields.push(statusFieldRequest);
            }
        }
        const car = await this.prisma.cars.create({ data: {
                createdDate: `${(new Date()).getTime()}`,
                ownerId
            } });
        await Promise.all(carFields.map(f => this.fieldChainService.create({
            sourceId: car.id,
            fieldId: f.id,
            value: f.value,
            sourceName: Models_1.Models.Table.Cars
        })));
        return { id: car.id };
    }
    async update(carId, updateCarDto) {
        const [ownerFields, carFields] = await this.getCarAndOwnerCarFields(updateCarDto);
        let needUpdate = false;
        const existCar = await this.prisma.cars.findUnique({ where: { id: carId } });
        const existCarOwnerById = await this.prisma.carOwners.findUnique({ where: { id: existCar.ownerId } });
        const existCarOwnerByNumber = updateCarDto.ownerNumber ? await this.prisma.carOwners.findFirst({ where: { number: updateCarDto.ownerNumber } }) : null;
        let carOwner = existCarOwnerById;
        if (!existCarOwnerByNumber && updateCarDto.ownerNumber) {
            carOwner = await this.prisma.carOwners.update({ where: { id: existCar.ownerId }, data: { number: updateCarDto.ownerNumber } });
        }
        else if (existCarOwnerById && existCarOwnerByNumber && existCarOwnerByNumber.number !== existCarOwnerById.number) {
            updateCarDto = Object.assign({}, updateCarDto, { ownerId: existCarOwnerByNumber.id });
            carOwner = existCarOwnerByNumber;
            needUpdate = true;
        }
        await Promise.all(ownerFields.map(f => this.fieldChainService.update({
            value: f.value
        }, {
            fieldId: f.id,
            sourceId: carOwner.id,
            sourceName: Models_1.Models.Table.CarOwners
        })));
        if (needUpdate) {
            await this.prisma.cars.update({ where: { id: carId }, data: { ownerId: carOwner.id } });
        }
        const worksheetField = carFields.find(f => f.name === FieldNames_1.FieldNames.Car.worksheet);
        if (worksheetField && worksheetField.value) {
            const carFormExist = await this.prisma.carForms.findFirst({ where: { carId: carId } });
            if (carFormExist) {
                await this.prisma.carForms.update({ where: { id: carFormExist.id }, data: { content: worksheetField.value } });
            }
            else {
                await this.prisma.carForms.create({ data: { carId, content: worksheetField.value } });
            }
        }
        const fieldsExists = await this.fieldChainService.findMany({
            sourceName: Models_1.Models.Table.Cars,
            sourceId: carId,
        });
        const fieldChainForCreate = carFields.filter(f => !fieldsExists.find(fe => fe.fieldId === f.id));
        const cf = carFields.filter(f => f.name !== FieldNames_1.FieldNames.Car.worksheet);
        await Promise.all(cf.map(f => this.fieldChainService.update({
            value: f.value
        }, {
            fieldId: f.id,
            sourceId: carId,
            sourceName: Models_1.Models.Table.Cars
        })));
        if (fieldChainForCreate.length > 0) {
            await Promise.all(fieldChainForCreate.map(f => this.fieldChainService.create({
                sourceId: carId,
                fieldId: f.id,
                value: f.value,
                sourceName: Models_1.Models.Table.Cars
            })));
        }
        return { id: carId };
    }
    async remove(id) {
        await this.fieldChainService.deleteMany({
            sourceName: Models_1.Models.Table.Cars,
            sourceId: id,
        });
        const car = await this.prisma.cars.delete({ where: { id } });
        return car;
    }
    async removeMany(ids) {
        await this.fieldChainService.deleteMany({
            sourceName: Models_1.Models.Table.Cars,
            sourceId: { in: ids.map(id => +id) },
        });
        const cars = await this.prisma.cars.deleteMany({ where: { id: { in: ids.map(id => +id) } } });
        return cars;
    }
    async createCarsByLink(data) {
        const [carFields, carOwnerFields] = await Promise.all([
            this.fieldsService.getFieldsByDomain(fields_1.FieldDomains.Car),
            this.fieldsService.getFieldsByDomain(fields_1.FieldDomains.CarOwner),
        ]);
        const queries = data.link.split('?')[1];
        const createCarData = await this.carInfoGetterService.getCarsInfo(queries, carFields, carOwnerFields, data.userId);
        if (createCarData.length === 0) {
            return [];
        }
        const createdCarIds = await Promise.all(createCarData.map(cc => this.createCarInDB(cc)));
        const result = createdCarIds.map((r, i) => {
            if (r.id === -1) {
                const carData = createCarData[i];
                return { ...carData, id: -1 };
            }
            return { ...r };
        });
        return result;
    }
    async createCarsByManager(data) {
        const [carFields, carOwnerFields] = await Promise.all([
            this.fieldsService.getFieldsByDomain(fields_1.FieldDomains.Car),
            this.fieldsService.getFieldsByDomain(fields_1.FieldDomains.CarOwner),
        ]);
        const createCarData = await this.carInfoGetterService.getCarsInfoByManualInfo(data.cars, carFields, carOwnerFields, data.specialist);
        if (createCarData.length === 0) {
            return [];
        }
        const createdCarIds = await Promise.all(createCarData.map(cc => this.createCarInDB(cc)));
        const result = createdCarIds.map((r, i) => {
            if (r.id === -1) {
                const carData = createCarData[i];
                return { ...carData, id: -1 };
            }
            return { ...r };
        });
        return result;
    }
};
exports.CarService = CarService;
exports.CarService = CarService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, user_service_1.UserService, fields_service_1.FieldsService, field_chain_service_1.FieldChainService, car_info_getter_service_1.CarInfoGetterService])
], CarService);
//# sourceMappingURL=car.service.js.map