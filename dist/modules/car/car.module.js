"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarModule = void 0;
const common_1 = require("@nestjs/common");
const car_service_1 = require("./car.service");
const car_controller_1 = require("./car.controller");
const car_image_service_1 = require("./services/car-image.service");
const car_statistic_service_1 = require("./services/car-statistic.service");
const car_info_getter_service_1 = require("./services/car-info-getter.service");
const s3_service_1 = require("../../core/files/services/s3.service");
const car_functions_cotroller_1 = require("./car-functions.cotroller");
const prisma_module_1 = require("../../prisma/prisma.module");
const user_module_1 = require("../user/user.module");
const fields_module_1 = require("../../core/fields/fields.module");
let CarModule = class CarModule {
};
exports.CarModule = CarModule;
exports.CarModule = CarModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, user_module_1.UserModule, fields_module_1.FieldsModule],
        controllers: [car_controller_1.CarController, car_functions_cotroller_1.CarFunctionsController],
        providers: [car_service_1.CarService, car_image_service_1.CarImageService, car_statistic_service_1.CarStatisticService, car_info_getter_service_1.CarInfoGetterService, s3_service_1.S3Service],
    })
], CarModule);
//# sourceMappingURL=car.module.js.map