"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientModule = void 0;
const common_1 = require("@nestjs/common");
const client_service_1 = require("./client.service");
const client_controller_1 = require("./client.controller");
const prisma_module_1 = require("../../prisma/prisma.module");
const fields_module_1 = require("../../core/fields/fields.module");
const auth_module_1 = require("../../core/auth/auth.module");
const change_log_module_1 = require("../change-log/change-log.module");
let ClientModule = class ClientModule {
};
exports.ClientModule = ClientModule;
exports.ClientModule = ClientModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, fields_module_1.FieldsModule, auth_module_1.AuthModule, change_log_module_1.ChangeLogModule],
        controllers: [client_controller_1.ClientController],
        providers: [client_service_1.ClientService],
    })
], ClientModule);
//# sourceMappingURL=client.module.js.map