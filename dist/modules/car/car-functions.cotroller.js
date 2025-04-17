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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarFunctionsController = void 0;
const common_1 = require("@nestjs/common");
const car_service_1 = require("./car.service");
const constansts_1 = require("../../core/constants/constansts");
const car_statistic_service_1 = require("./services/car-statistic.service");
const car_image_service_1 = require("./services/car-image.service");
const add_customer_discount_dto_1 = require("./dto/add-customer-discount.dto");
let CarFunctionsController = class CarFunctionsController {
    constructor(carService, carStatisticService, carImageService) {
        this.carService = carService;
        this.carStatisticService = carStatisticService;
        this.carImageService = carImageService;
    }
    async addCustomerCall(params) {
        return await this.carStatisticService.addCustomerCall(+params.carId);
    }
    async addCustomerDiscount(params, body) {
        return await this.carStatisticService.addCustomerDiscount(+params.carId, body.discount, body.amount);
    }
    async addCall(body) {
        return await this.carStatisticService.addCall(body.carIds);
    }
    async getAllCarStatistic(params) {
        return await this.carStatisticService.getAllCarStatistic(+params.carId);
    }
    async getCarShowingStatistic(params) {
        return await this.carStatisticService.getCarShowingStatistic(+params.carId);
    }
    async createCarShowing(params, body) {
        return await this.carStatisticService.createCarShowing(+params.carId, body.showingContent);
    }
    async updateCarShowing(params, body) {
        return await this.carStatisticService.updateCarShowing(body.showingId, +params.carId, body.showingContent);
    }
    async createCarsByLink(body) {
        return await this.carService.createCarsByLink(body);
    }
    async createCarsByManager(body) {
        return await this.carService.createCarsByManager(body);
    }
    async getCarFiles(params) {
        return await this.carImageService.getCarFiles(+params.carId);
    }
    async deleteCarImage(params) {
        return await this.carImageService.deleteCarImage(+params.carId, +params.imageId);
    }
    async uploadCarImages(body, uploadedFile, uploadedFiles) {
        let files = [];
        if (uploadedFile) {
            files = Array.isArray(uploadedFile)
                ? uploadedFile
                : [uploadedFile];
        }
        if (uploadedFiles) {
            files = uploadedFiles;
        }
        return await this.carImageService.uploadCarImages(+body.carId, files, body.metadata || '{}');
    }
    async uploadCarStateImages(body, uploadedFile, uploadedFiles) {
        let files = [];
        if (uploadedFile) {
            files = Array.isArray(uploadedFile)
                ? uploadedFile
                : [uploadedFile];
        }
        if (uploadedFiles) {
            files = uploadedFiles;
        }
        return await this.carImageService.uploadCarStateImages(+body.carId, files, body.metadata || '{}');
    }
    async uploadCarImage360(body, uploadedFile, uploadedFiles) {
        let files = [];
        if (uploadedFile) {
            files = Array.isArray(uploadedFile)
                ? uploadedFile
                : [uploadedFile];
        }
        if (uploadedFiles) {
            files = uploadedFiles;
        }
        return await this.carImageService.uploadCarImage360(+body.carId, files[0], body.metadata || '{}');
    }
};
exports.CarFunctionsController = CarFunctionsController;
__decorate([
    (0, common_1.Post)(`/${constansts_1.Constants.API.STATISTIC}/${constansts_1.Constants.API.ADD_CUSTOMER_CALL}/:carId`),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CarFunctionsController.prototype, "addCustomerCall", null);
__decorate([
    (0, common_1.Post)(`/${constansts_1.Constants.API.STATISTIC}/${constansts_1.Constants.API.ADD_CUSTOMER_DISCOUNT}/:carId`),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, add_customer_discount_dto_1.AddCustomerDiscountDto]),
    __metadata("design:returntype", Promise)
], CarFunctionsController.prototype, "addCustomerDiscount", null);
__decorate([
    (0, common_1.Post)(`/${constansts_1.Constants.API.STATISTIC}/${constansts_1.Constants.API.ADD_CALL}`),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CarFunctionsController.prototype, "addCall", null);
__decorate([
    (0, common_1.Get)(`/${constansts_1.Constants.API.STATISTIC}/:carId`),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CarFunctionsController.prototype, "getAllCarStatistic", null);
__decorate([
    (0, common_1.Get)(`/${constansts_1.Constants.API.STATISTIC}/${constansts_1.Constants.API.CAR_SHOWING}/:carId`),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CarFunctionsController.prototype, "getCarShowingStatistic", null);
__decorate([
    (0, common_1.Post)(`/${constansts_1.Constants.API.STATISTIC}/${constansts_1.Constants.API.CAR_SHOWING}/:carId`),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CarFunctionsController.prototype, "createCarShowing", null);
__decorate([
    (0, common_1.Put)(`/${constansts_1.Constants.API.STATISTIC}/${constansts_1.Constants.API.CAR_SHOWING}/:carId`),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CarFunctionsController.prototype, "updateCarShowing", null);
__decorate([
    (0, common_1.Post)(constansts_1.Constants.API.CREATE_CARS_BY_LINK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CarFunctionsController.prototype, "createCarsByLink", null);
__decorate([
    (0, common_1.Post)(constansts_1.Constants.API.CREATE_CARS_BY_MANAGER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CarFunctionsController.prototype, "createCarsByManager", null);
__decorate([
    (0, common_1.Get)(`/${constansts_1.Constants.API.IMAGES}/:carId`),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CarFunctionsController.prototype, "getCarFiles", null);
__decorate([
    (0, common_1.Delete)(`/${constansts_1.Constants.API.IMAGES}/:carId/:imageId`),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CarFunctionsController.prototype, "deleteCarImage", null);
__decorate([
    (0, common_1.Post)(constansts_1.Constants.API.IMAGES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Array]),
    __metadata("design:returntype", Promise)
], CarFunctionsController.prototype, "uploadCarImages", null);
__decorate([
    (0, common_1.Post)(constansts_1.Constants.API.STATE_IMAGES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Array]),
    __metadata("design:returntype", Promise)
], CarFunctionsController.prototype, "uploadCarStateImages", null);
__decorate([
    (0, common_1.Post)(constansts_1.Constants.API.IMAGE360),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Array]),
    __metadata("design:returntype", Promise)
], CarFunctionsController.prototype, "uploadCarImage360", null);
exports.CarFunctionsController = CarFunctionsController = __decorate([
    (0, common_1.Controller)(constansts_1.Constants.API.CARS),
    __metadata("design:paramtypes", [car_service_1.CarService, car_statistic_service_1.CarStatisticService, car_image_service_1.CarImageService])
], CarFunctionsController);
//# sourceMappingURL=car-functions.cotroller.js.map