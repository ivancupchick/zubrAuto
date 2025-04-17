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
exports.ClientController = void 0;
const common_1 = require("@nestjs/common");
const client_service_1 = require("./client.service");
const constansts_1 = require("../../core/constants/constansts");
const activity_decorator_1 = require("../../core/decorators/activity.decorator");
const activity_type_enum_1 = require("../../core/enums/activity-type.enum");
const Models_1 = require("../../temp/entities/Models");
const complete_deal_dto_1 = require("./dto/complete-deal.dto");
const auth_guard_1 = require("../../core/guards/auth.guard");
let ClientController = class ClientController {
    constructor(clientService) {
        this.clientService = clientService;
    }
    create(createClientDto) {
        return this.clientService.create(createClientDto);
    }
    findAll(query) {
        const queryKeys = Object.keys(query);
        return queryKeys.length > 0
            ? this.clientService.findMany(query)
            : this.clientService.findAll();
    }
    findOne(id) {
        return this.clientService.findOne(+id);
    }
    update(id, updateClientDto) {
        return this.clientService.update(+id, updateClientDto);
    }
    remove(id) {
        return this.clientService.remove(+id);
    }
    async completeDeal(dto) {
        return this.clientService.completeDeal(dto.clientId, dto.carId);
    }
};
exports.ClientController = ClientController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, activity_decorator_1.ControllerActivity)({ type: activity_type_enum_1.ActivityType.CreateClient, sourceName: Models_1.Models.Table.Clients }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ClientController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ClientController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ClientController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, activity_decorator_1.ControllerActivity)({ type: activity_type_enum_1.ActivityType.UpdateClient, sourceName: Models_1.Models.Table.Clients }),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ClientController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, activity_decorator_1.ControllerActivity)({ type: activity_type_enum_1.ActivityType.DeleteClient, sourceName: Models_1.Models.Table.Clients }),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ClientController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)(constansts_1.Constants.API.COMPLETE_DEAL),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [complete_deal_dto_1.CompleteDealDto]),
    __metadata("design:returntype", Promise)
], ClientController.prototype, "completeDeal", null);
exports.ClientController = ClientController = __decorate([
    (0, common_1.Controller)(constansts_1.Constants.API.CLIENTS),
    __metadata("design:paramtypes", [client_service_1.ClientService])
], ClientController);
//# sourceMappingURL=client.controller.js.map