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
exports.CarController = void 0;
const common_1 = require("@nestjs/common");
const car_service_1 = require("./car.service");
const constansts_1 = require("../../core/constants/constansts");
const car_remove_dto_1 = require("./dto/car-remove.dto");
const auth_guard_1 = require("../../core/guards/auth.guard");
let CarController = class CarController {
    constructor(carService) {
        this.carService = carService;
    }
    create(createCarDto) {
        return this.carService.createCarInDB(createCarDto);
    }
    findAll(query) {
        const queryKeys = Object.keys(query);
        return queryKeys.length > 0
            ? this.carService.findMany(query)
            : this.carService.findAll();
    }
    findOne(id) {
        return this.carService.findOne(+id);
    }
    update(id, updateCarDto) {
        return this.carService.update(+id, updateCarDto);
    }
    remove(id) {
        return this.carService.remove(+id);
    }
    removeMany(body) {
        return this.carService.removeMany(body.carIds);
    }
};
exports.CarController = CarController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)(constansts_1.Constants.API.CRUD),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CarController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(constansts_1.Constants.API.CRUD),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CarController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(`/${constansts_1.Constants.API.CRUD}/:id`),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CarController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Put)(`/${constansts_1.Constants.API.CRUD}/:id`),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CarController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Delete)(`/${constansts_1.Constants.API.CRUD}/:id`),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CarController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)(constansts_1.Constants.API.DELETE_CARS),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [car_remove_dto_1.CarRemoveDto]),
    __metadata("design:returntype", void 0)
], CarController.prototype, "removeMany", null);
exports.CarController = CarController = __decorate([
    (0, common_1.Controller)(constansts_1.Constants.API.CARS),
    __metadata("design:paramtypes", [car_service_1.CarService])
], CarController);
//# sourceMappingURL=car.controller.js.map