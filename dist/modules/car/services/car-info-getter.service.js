"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarInfoGetterService = void 0;
const common_1 = require("@nestjs/common");
const car_info_getter_1 = require("../entities/car-info-getter");
const request_promise_1 = require("request-promise");
const FieldNames_1 = require("../../../temp/entities/FieldNames");
let CarInfoGetterService = class CarInfoGetterService {
    async getCarsInfo(queries, carFieldConfigs, carOwnerFieldConfigs, userId) {
        const CARS_INFO_LINK = process.env.CARS_INFO_LINK;
        const firstQueries = queries.split('&').filter(query => !query.match('page')).join('&');
        const carsInfo = await this.get(`${CARS_INFO_LINK}?${firstQueries}`);
        let otherQueries = [];
        for (let i = 2; i < carsInfo.pageCount + 1; i++) {
            otherQueries.push(`${CARS_INFO_LINK}?${firstQueries}&page=${i}`);
        }
        let additionalInform = [];
        if (otherQueries.length > 0) {
            additionalInform = await Promise.all(otherQueries.map((link, i) => this.getResponseFromLink(link, i * 300)));
        }
        const statuses = ['removed', 'archived', 'purged'];
        const allCars = carsInfo.adverts.filter(car => !(car.organizationId || car.organizationTitle) && !statuses.includes(car.status));
        additionalInform.forEach(info => { allCars.push(...info.adverts.filter(car => !(car.organizationId || car.organizationTitle) && !statuses.includes(car.status))); });
        const ids = allCars.map(car => car.id);
        const result = this.converCarsInfoToServerCars(allCars, [], carFieldConfigs, carOwnerFieldConfigs, userId);
        return result;
    }
    async getCarsInfoByManualInfo(carsManualInfo, carFieldConfigs, carOwnerFieldConfigs, userId) {
        const carsInfo = JSON.parse(carsManualInfo[0]);
        let additionalInform = carsManualInfo.filter((a, i) => i !== 0).map(a => JSON.parse(a));
        const statuses = ['removed', 'archived', 'purged'];
        const allCars = carsInfo.adverts.filter(car => !(car.organizationId || car.organizationTitle) && !statuses.includes(car.status));
        additionalInform.forEach(info => { allCars.push(...info.adverts.filter(car => !(car.organizationId || car.organizationTitle) && !statuses.includes(car.status))); });
        const result = this.converCarsInfoToServerCars(allCars, [], carFieldConfigs, carOwnerFieldConfigs, userId);
        return result;
    }
    async getResponseFromLink(link, timeout) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this.get(link)
                    .then(res => {
                    resolve(res);
                })
                    .catch(e => {
                    resolve(null);
                });
            }, timeout);
        });
    }
    async get(link) {
        return await request_promise_1.default.get(link, { headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            } }).then(res => JSON.parse(res));
    }
    converCarsInfoToServerCars(cars, phoneNumbers, carFieldConfigs, carOwnerFieldConfigs, userId) {
        return cars.map(carInfo => {
            return {
                ownerNumber: '0',
                fields: [...carFieldConfigs, ...carOwnerFieldConfigs].map(fieldConfig => {
                    return {
                        id: fieldConfig.id,
                        name: fieldConfig.name,
                        value: this.getCarFieldValue(fieldConfig, carInfo, userId)
                    };
                })
            };
        }).filter(c => !!c);
    }
    getCarFieldValue(fieldConfig, car, userId) {
        const name = fieldConfig.name;
        switch (name) {
            case FieldNames_1.FieldNames.Car.engine: {
                const value = `${car.properties.find(property => property.name === this.getPropertyName(name))?.value || ''}`;
                const engineValue = this.convertEngineType(value);
                const variantId = fieldConfig.variants.split(',').findIndex(variant => variant === engineValue);
                if (variantId === -1) {
                    return '';
                }
                return `${FieldNames_1.FieldNames.Car.engine}-${variantId}`;
            }
            case FieldNames_1.FieldNames.Car.engineCapacity: {
                const value = `${car.properties.find(property => property.name === this.getPropertyName(name))?.value || ''}`;
                const engineCapacity = this.convertEngineCapacity(value);
                return engineCapacity;
            }
            case FieldNames_1.FieldNames.Car.transmission: {
                const value = `${car.properties.find(property => property.name === this.getPropertyName(name))?.value || ''}`;
                const transmission = this.convertTransmission(value);
                const variantId = fieldConfig.variants.split(',').findIndex(variant => variant === transmission);
                if (variantId === -1) {
                    return '';
                }
                return `${FieldNames_1.FieldNames.Car.transmission}-${variantId}`;
            }
            case FieldNames_1.FieldNames.Car.bodyType: {
                const value = `${car.properties.find(property => property.name === this.getPropertyName(name))?.value || ''}`;
                const bodyType = value;
                const variantId = fieldConfig.variants.split(',').findIndex(variant => variant === bodyType);
                if (variantId === -1) {
                    return '';
                }
                return `${FieldNames_1.FieldNames.Car.bodyType}-${variantId}`;
            }
            case FieldNames_1.FieldNames.Car.driveType: {
                const value = `${car.properties.find(property => property.name === this.getPropertyName(name))?.value || ''}`;
                const driveType = this.convertDriveType(value);
                const variantId = fieldConfig.variants.split(',').findIndex(variant => variant === driveType);
                if (variantId === -1) {
                    return '';
                }
                return `${FieldNames_1.FieldNames.Car.driveType}-${variantId}`;
            }
            case FieldNames_1.FieldNames.Car.linkToAd: {
                return car.publicUrl;
            }
            case FieldNames_1.FieldNames.Car.carOwnerPrice: {
                return `${car.price.usd.amount}`;
            }
            case FieldNames_1.FieldNames.Car.contactCenterSpecialistId: {
                return `${userId}`;
            }
            case FieldNames_1.FieldNames.CarOwner.name: {
                return `${car.sellerName}`;
            }
            case FieldNames_1.FieldNames.Car.status: {
                return 'status-0';
            }
            case FieldNames_1.FieldNames.Car.source: {
                return ['a', 'v', '.', 'b', 'y'].join('');
            }
        }
        return `${car.properties.find(property => property.name === this.getPropertyName(name))?.value || ''}`;
    }
    getPropertyName(name) {
        switch (name) {
            case FieldNames_1.FieldNames.Car.mark: return car_info_getter_1.PropertyName.brand;
            case FieldNames_1.FieldNames.Car.model: return car_info_getter_1.PropertyName.model;
            case FieldNames_1.FieldNames.Car.driveType: return car_info_getter_1.PropertyName.drive_type;
            case FieldNames_1.FieldNames.Car.bodyType: return car_info_getter_1.PropertyName.body_type;
            case FieldNames_1.FieldNames.Car.engine: return car_info_getter_1.PropertyName.engine_type;
            case FieldNames_1.FieldNames.Car.engineCapacity: return car_info_getter_1.PropertyName.engine_capacity;
            case FieldNames_1.FieldNames.Car.mileage: return car_info_getter_1.PropertyName.mileage_km;
            case FieldNames_1.FieldNames.Car.year: return car_info_getter_1.PropertyName.year;
            case FieldNames_1.FieldNames.Car.transmission: return car_info_getter_1.PropertyName.transmission_type;
            case FieldNames_1.FieldNames.Car.color: return car_info_getter_1.PropertyName.color;
        }
        return '';
    }
    convertEngineType(value) {
        return value;
    }
    convertEngineCapacity(value) {
        return value;
    }
    convertTransmission(value) {
        switch (value) {
            case 'автомат': return 'Автомат';
            case 'механика': return 'Механика';
        }
        return value;
    }
    convertDriveType(value) {
        switch (value) {
            case 'передний привод': return 'Передний';
            case 'задний привод': return 'Задний';
            case 'подключаемый полный привод': return 'Полный';
            case 'постоянный полный привод': return 'Полный';
        }
        return value;
    }
};
exports.CarInfoGetterService = CarInfoGetterService;
exports.CarInfoGetterService = CarInfoGetterService = __decorate([
    (0, common_1.Injectable)()
], CarInfoGetterService);
//# sourceMappingURL=car-info-getter.service.js.map