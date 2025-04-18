"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldsModule = void 0;
const common_1 = require("@nestjs/common");
const fields_service_1 = require("./fields.service");
const fields_controller_1 = require("./fields.controller");
const field_chain_service_1 = require("./services/field-chain.service");
const prisma_module_1 = require("../../prisma/prisma.module");
let FieldsModule = class FieldsModule {
};
exports.FieldsModule = FieldsModule;
exports.FieldsModule = FieldsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [fields_controller_1.FieldsController],
        providers: [fields_service_1.FieldsService, field_chain_service_1.FieldChainService],
        exports: [field_chain_service_1.FieldChainService, fields_service_1.FieldsService]
    })
], FieldsModule);
//# sourceMappingURL=fields.module.js.map