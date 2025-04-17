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
exports.CallRequestController = void 0;
const common_1 = require("@nestjs/common");
const call_request_service_1 = require("./call-request.service");
const constansts_1 = require("../../core/constants/constansts");
const auth_guard_1 = require("../../core/guards/auth.guard");
let CallRequestController = class CallRequestController {
    constructor(callRequestService) {
        this.callRequestService = callRequestService;
    }
    callRequest(callRequest) {
        return this.callRequestService.callRequest(callRequest);
    }
    findAll(query) {
        const queryKeys = Object.keys(query);
        return queryKeys.length > 0
            ? this.callRequestService.findMany(query)
            : this.callRequestService.findAll();
    }
    findOne(id) {
        return this.callRequestService.findOne(+id);
    }
    update(id, updateCallRequestDto) {
        return this.callRequestService.update(+id, updateCallRequestDto);
    }
    remove(id) {
        return this.callRequestService.remove(+id);
    }
};
exports.CallRequestController = CallRequestController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)(constansts_1.Constants.API.CALL_REQUEST),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CallRequestController.prototype, "callRequest", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CallRequestController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CallRequestController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CallRequestController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CallRequestController.prototype, "remove", null);
exports.CallRequestController = CallRequestController = __decorate([
    (0, common_1.Controller)(constansts_1.Constants.API.CALL_REQUESTS),
    __metadata("design:paramtypes", [call_request_service_1.CallRequestService])
], CallRequestController);
//# sourceMappingURL=call-request.controller.js.map