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
exports.ChangeLogController = void 0;
const common_1 = require("@nestjs/common");
const change_log_service_1 = require("./change-log.service");
const auth_guard_1 = require("../../core/guards/auth.guard");
let ChangeLogController = class ChangeLogController {
    constructor(changeLogService) {
        this.changeLogService = changeLogService;
    }
    create(createChangeLogDto) {
        return this.changeLogService.create(createChangeLogDto);
    }
    findAll(query) {
        const queryKeys = Object.keys(query);
        return queryKeys.length > 0
            ? this.changeLogService.findMany(query)
            : this.changeLogService.findAll();
    }
    findOne(id) {
        return this.changeLogService.findOne(+id);
    }
    update(id, updateChangeLogDto) {
        return this.changeLogService.update(+id, updateChangeLogDto);
    }
};
exports.ChangeLogController = ChangeLogController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChangeLogController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChangeLogController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChangeLogController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ChangeLogController.prototype, "update", null);
exports.ChangeLogController = ChangeLogController = __decorate([
    (0, common_1.Controller)('change-log'),
    __metadata("design:paramtypes", [change_log_service_1.ChangeLogService])
], ChangeLogController);
//# sourceMappingURL=change-log.controller.js.map