"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_service_1 = require("./prisma/prisma.service");
const client_module_1 = require("./modules/client/client.module");
const fields_module_1 = require("./core/fields/fields.module");
const user_module_1 = require("./modules/user/user.module");
const car_module_1 = require("./modules/car/car.module");
const call_request_module_1 = require("./modules/call-request/call-request.module");
const phone_call_module_1 = require("./modules/phone-call/phone-call.module");
const role_module_1 = require("./modules/role/role.module");
const change_log_module_1 = require("./modules/change-log/change-log.module");
const files_module_1 = require("./core/files/files.module");
const token_service_1 = require("./core/auth/token.service");
const auth_module_1 = require("./core/auth/auth.module");
const prisma_module_1 = require("./prisma/prisma.module");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), '/ui/dist/', ''),
            }),
            client_module_1.ClientModule,
            fields_module_1.FieldsModule,
            user_module_1.UserModule,
            car_module_1.CarModule,
            call_request_module_1.CallRequestModule,
            phone_call_module_1.PhoneCallModule,
            role_module_1.RoleModule,
            change_log_module_1.ChangeLogModule,
            files_module_1.FilesModule,
            auth_module_1.AuthModule,
            prisma_module_1.PrismaModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, prisma_service_1.PrismaService, token_service_1.TokenService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map