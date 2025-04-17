"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallRequestModule = void 0;
const common_1 = require("@nestjs/common");
const call_request_service_1 = require("./call-request.service");
const call_request_controller_1 = require("./call-request.controller");
const prisma_module_1 = require("../../prisma/prisma.module");
let CallRequestModule = class CallRequestModule {
};
exports.CallRequestModule = CallRequestModule;
exports.CallRequestModule = CallRequestModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [call_request_controller_1.CallRequestController],
        providers: [call_request_service_1.CallRequestService],
    })
], CallRequestModule);
//# sourceMappingURL=call-request.module.js.map