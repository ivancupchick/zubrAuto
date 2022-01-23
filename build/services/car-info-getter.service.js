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
const request_promise_1 = __importDefault(require("request-promise"));
const FieldNames_1 = require("../entities/FieldNames");
// const CARS_INFO_LINK = process.env.CARS_INFO_LINK;
const getPhoneLink = (id) => {
    return `${process.env.CARS_PHONE_LINK}/${id}/phones`;
};
var PropertyName;
(function (PropertyName) {
    PropertyName["brand"] = "brand";
    PropertyName["model"] = "model";
    PropertyName["generation"] = "generation";
    PropertyName["year"] = "year";
    PropertyName["engine_capacity"] = "engine_capacity";
    PropertyName["engine_type"] = "engine_type";
    PropertyName["transmission_type"] = "transmission_type";
    PropertyName["generation_with_years"] = "generation_with_years";
    PropertyName["railings"] = "railings";
    PropertyName["abs"] = "abs";
    PropertyName["esp"] = "esp";
    PropertyName["anti_slip_system"] = "anti_slip_system";
    PropertyName["immobilizer"] = "immobilizer";
    PropertyName["alarm"] = "alarm";
    PropertyName["front_safebags"] = "front_safebags";
    PropertyName["side_safebags"] = "side_safebags";
    PropertyName["rear_safebags"] = "rear_safebags";
    PropertyName["rain_detector"] = "rain_detector";
    PropertyName["rear_view_camera"] = "rear_view_camera";
    PropertyName["parktronics"] = "parktronics";
    PropertyName["mirror_dead_zone_control"] = "mirror_dead_zone_control";
    PropertyName["interior_color"] = "interior_color";
    PropertyName["interior_material"] = "interior_material";
    PropertyName["drive_auto_start"] = "drive_auto_start";
    PropertyName["cruise_control"] = "cruise_control";
    PropertyName["steering_wheel_media_control"] = "steering_wheel_media_control";
    PropertyName["electro_seat_adjustment"] = "electro_seat_adjustment";
    PropertyName["front_glass_lift"] = "front_glass_lift";
    PropertyName["rear_glass_lift"] = "rear_glass_lift";
    PropertyName["seat_heating"] = "seat_heating";
    PropertyName["front_glass_heating"] = "front_glass_heating";
    PropertyName["mirror_heating"] = "mirror_heating";
    PropertyName["autonomous_heater"] = "autonomous_heater";
    PropertyName["climate_control"] = "climate_control";
    PropertyName["aux_ipod"] = "aux_ipod";
    PropertyName["bluetooth"] = "bluetooth";
    PropertyName["cd_mp3_player"] = "cd_mp3_player";
    PropertyName["usb"] = "usb";
    PropertyName["media_screen"] = "media_screen";
    PropertyName["navigator"] = "navigator";
    PropertyName["xenon_lights"] = "xenon_lights";
    PropertyName["fog_lights"] = "fog_lights";
    PropertyName["led_lights"] = "led_lights";
    PropertyName["body_type"] = "body_type";
    PropertyName["drive_type"] = "drive_type";
    PropertyName["color"] = "color";
    PropertyName["mileage_km"] = "mileage_km";
    PropertyName["condition"] = "condition";
})(PropertyName || (PropertyName = {}));
class CarInfoGetter {
    // startTime = 0;
    getCarsInfo(queries, carFieldConfigs, carOwnerFieldConfigs, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const CARS_INFO_LINK = process.env.CARS_INFO_LINK;
            // this.startTime = new Date().getTime();
            const firstQueries = queries.split('&').filter(query => !query.match('page')).join('&');
            const carsInfo = yield this.get(`${CARS_INFO_LINK}?${firstQueries}`);
            let otherQueries = [];
            for (let i = 2; i < carsInfo.pageCount + 1; i++) {
                otherQueries.push(`${CARS_INFO_LINK}?${firstQueries}&page=${i}`);
            }
            let additionalInform = [];
            if (otherQueries.length > 0) {
                additionalInform = yield Promise.all(otherQueries.map((link, i) => this.getResponseFromLink(link, i * 300)));
            }
            const allCars = carsInfo.adverts.filter(car => !(car.organizationId || car.organizationTitle));
            additionalInform.forEach(info => { allCars.push(...info.adverts.filter(car => !(car.organizationId || car.organizationTitle))); });
            const ids = allCars.map(car => car.id);
            const numbers = yield Promise.all(ids
                .map((id, i) => this.getResponseFromLink(getPhoneLink(id), i * 100).then(res => {
                var _a;
                const number = ((_a = res.find(num => num.country.id === 1)) === null || _a === void 0 ? void 0 : _a.number) || 0;
                return { id, number };
            })));
            const result = this.converCarsInfoToServerCars(allCars, numbers.map(num => ({ id: num.id, number: +num.number })), carFieldConfigs, carOwnerFieldConfigs, userId);
            return result;
        });
    }
    getResponseFromLink(link, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    // console.log(timeout);
                    this.get(link)
                        .then(res => {
                        // console.log(((new Date().getTime()) - this.startTime) / 1000);
                        resolve(res);
                    })
                        .catch(e => {
                        reject(e);
                    });
                }, timeout);
            });
        });
    }
    get(link) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield request_promise_1.default.get(link).then(res => JSON.parse(res));
        });
    }
    converCarsInfoToServerCars(cars, phoneNumbers, carFieldConfigs, carOwnerFieldConfigs, userId) {
        return cars.map(carInfo => {
            var _a;
            const number = ((_a = phoneNumbers.find(num => num.id === carInfo.id)) === null || _a === void 0 ? void 0 : _a.number) || 0;
            if (!number) {
                return null;
            }
            return {
                ownerNumber: `+375${number}`,
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
        var _a, _b, _c, _d, _e, _f;
        const name = fieldConfig.name;
        switch (name) {
            case FieldNames_1.FieldNames.Car.engine: {
                const value = `${((_a = car.properties.find(property => property.name === this.getPropertyName(name))) === null || _a === void 0 ? void 0 : _a.value) || ''}`;
                const engineValue = this.convertEngineType(value);
                const variantId = fieldConfig.variants.split(',').findIndex(variant => variant === engineValue);
                if (variantId === -1) {
                    return '';
                }
                return `${FieldNames_1.FieldNames.Car.engine}-${variantId}`;
            }
            case FieldNames_1.FieldNames.Car.engineCapacity: {
                const value = `${((_b = car.properties.find(property => property.name === this.getPropertyName(name))) === null || _b === void 0 ? void 0 : _b.value) || ''}`;
                const engineCapacity = this.convertEngineCapacity(value);
                return engineCapacity; // TODO may be replace to usual algo
            }
            case FieldNames_1.FieldNames.Car.transmission: {
                const value = `${((_c = car.properties.find(property => property.name === this.getPropertyName(name))) === null || _c === void 0 ? void 0 : _c.value) || ''}`;
                const transmission = this.convertTransmission(value);
                const variantId = fieldConfig.variants.split(',').findIndex(variant => variant === transmission);
                if (variantId === -1) {
                    return '';
                }
                return `${FieldNames_1.FieldNames.Car.transmission}-${variantId}`;
            }
            case FieldNames_1.FieldNames.Car.bodyType: {
                const value = `${((_d = car.properties.find(property => property.name === this.getPropertyName(name))) === null || _d === void 0 ? void 0 : _d.value) || ''}`;
                const bodyType = value; // this.convertTransmission(value);
                const variantId = fieldConfig.variants.split(',').findIndex(variant => variant === bodyType);
                if (variantId === -1) {
                    return '';
                }
                return `${FieldNames_1.FieldNames.Car.bodyType}-${variantId}`;
            }
            case FieldNames_1.FieldNames.Car.driveType: {
                const value = `${((_e = car.properties.find(property => property.name === this.getPropertyName(name))) === null || _e === void 0 ? void 0 : _e.value) || ''}`;
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
                // const reg = /^(?:https?:\/\/).*?([^.\r\n\/]+\.)?([^.\r\n\/]+\.[^.\r\n\/]{2,6}(?:\.[^.\r\n\/]{2,6})?).*$/g;
                // const arr = reg.exec(car.publicUrl);
                // return arr[arr.length - 1]
                return ['a', 'v', '.', 'b', 'y'].join('');
            }
        }
        return `${((_f = car.properties.find(property => property.name === this.getPropertyName(name))) === null || _f === void 0 ? void 0 : _f.value) || ''}`;
    }
    getPropertyName(name) {
        switch (name) {
            case FieldNames_1.FieldNames.Car.mark: return PropertyName.brand;
            case FieldNames_1.FieldNames.Car.model: return PropertyName.model;
            case FieldNames_1.FieldNames.Car.driveType: return PropertyName.drive_type;
            case FieldNames_1.FieldNames.Car.bodyType: return PropertyName.body_type;
            case FieldNames_1.FieldNames.Car.engine: return PropertyName.engine_type;
            case FieldNames_1.FieldNames.Car.engineCapacity: return PropertyName.engine_capacity;
            case FieldNames_1.FieldNames.Car.mileage: return PropertyName.mileage_km;
            case FieldNames_1.FieldNames.Car.year: return PropertyName.year;
            case FieldNames_1.FieldNames.Car.transmission: return PropertyName.transmission_type;
            case FieldNames_1.FieldNames.Car.color: return PropertyName.color;
            // case FieldNames.Car.linkToAd: return PropertyName.abs; // need custom converter
            // case FieldNames.Car.carOwnerPrice: return PropertyName.abs; // need custom converter
            // case FieldNames.Car.contactCenterSpecialistId: return PropertyName.model; // need custom converter
        }
        return '';
    }
    convertEngineType(value) {
        switch (value) {
            case 'дизель': return 'Дизель';
            case 'дизель (гибрид)': return 'Дизель';
            case 'бензин': return 'Бензин';
            case 'бензин (пропан-бутан)': return 'Бензин';
            case 'бензин (метан)': return 'Бензин';
            case 'бензин (гибрид)': return 'Бензин';
            case 'электро': return 'Электро';
        }
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
}
module.exports = new CarInfoGetter();
//# sourceMappingURL=car-info-getter.service.js.map