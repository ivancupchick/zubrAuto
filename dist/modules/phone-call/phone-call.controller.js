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
exports.PhoneCallController = void 0;
const common_1 = require("@nestjs/common");
const phone_call_service_1 = require("./phone-call.service");
const create_phone_call_dto_1 = require("./dto/create-phone-call.dto");
const update_phone_call_dto_1 = require("./dto/update-phone-call.dto");
const constansts_1 = require("../../core/constants/constansts");
const auth_guard_1 = require("../../core/guards/auth.guard");
let PhoneCallController = class PhoneCallController {
    constructor(phoneCallService) {
        this.phoneCallService = phoneCallService;
    }
    create(createPhoneCallDto) {
        return this.phoneCallService.create(createPhoneCallDto);
    }
    findAll(query) {
        const queryKeys = Object.keys(query);
        return queryKeys.length > 0
            ? this.phoneCallService.findMany(query)
            : this.phoneCallService.findAll();
    }
    findOne(id) {
        return this.phoneCallService.findOne(+id);
    }
    update(id, updatePhoneCallDto) {
        return this.phoneCallService.update(+id, updatePhoneCallDto);
    }
    remove(id) {
        return this.phoneCallService.remove(+id);
    }
    webHookNotify(body) {
        const notification = typeof body === 'string' ? JSON.parse(body) : body;
        return this.phoneCallService.webHookNotify(notification);
    }
};
exports.PhoneCallController = PhoneCallController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_phone_call_dto_1.CreatePhoneCallDto]),
    __metadata("design:returntype", void 0)
], PhoneCallController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PhoneCallController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PhoneCallController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_phone_call_dto_1.UpdatePhoneCallDto]),
    __metadata("design:returntype", void 0)
], PhoneCallController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PhoneCallController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)(constansts_1.Constants.API.WEB_HOOK),
    (0, common_1.Get)(constansts_1.Constants.API.WEB_HOOK),
    (0, common_1.Put)(constansts_1.Constants.API.WEB_HOOK),
    (0, common_1.Put)(constansts_1.Constants.API.WEB_HOOK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PhoneCallController.prototype, "webHookNotify", null);
exports.PhoneCallController = PhoneCallController = __decorate([
    (0, common_1.Controller)('phone-call'),
    __metadata("design:paramtypes", [phone_call_service_1.PhoneCallService])
], PhoneCallController);
//# sourceMappingURL=phone-call.controller.js.map