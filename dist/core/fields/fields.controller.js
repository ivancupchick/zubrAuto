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
exports.FieldsController = void 0;
const common_1 = require("@nestjs/common");
const fields_service_1 = require("./fields.service");
const create_field_dto_1 = require("./dto/create-field.dto");
const constansts_1 = require("../constants/constansts");
const fields_1 = require("./fields");
const auth_guard_1 = require("../guards/auth.guard");
let FieldsController = class FieldsController {
    constructor(fieldsService) {
        this.fieldsService = fieldsService;
    }
    create(createFieldDto) {
        return this.fieldsService.create(createFieldDto);
    }
    findAll() {
        return this.fieldsService.findAll();
    }
    findOne(id) {
        return this.fieldsService.findOne(+id);
    }
    update(id, updateFieldDto) {
        return this.fieldsService.update(+id, updateFieldDto);
    }
    remove(id) {
        return this.fieldsService.remove(+id);
    }
    getFieldsByDomain(domain) {
        return this.fieldsService.getFieldsByDomain(domain);
    }
};
exports.FieldsController = FieldsController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)(constansts_1.Constants.API.CRUD),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_field_dto_1.CreateFieldDto]),
    __metadata("design:returntype", void 0)
], FieldsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(constansts_1.Constants.API.CRUD),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FieldsController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(`/${constansts_1.Constants.API.CRUD}/:id`),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FieldsController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Put)(`/${constansts_1.Constants.API.CRUD}/:id`),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FieldsController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Delete)(`/${constansts_1.Constants.API.CRUD}/:id`),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FieldsController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(`/getFieldsByDomain/:domain`),
    __param(0, (0, common_1.Param)('domain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FieldsController.prototype, "getFieldsByDomain", null);
exports.FieldsController = FieldsController = __decorate([
    (0, common_1.Controller)(constansts_1.Constants.API.FIELDS),
    __metadata("design:paramtypes", [fields_service_1.FieldsService])
], FieldsController);
//# sourceMappingURL=fields.controller.js.map