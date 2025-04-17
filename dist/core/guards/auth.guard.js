"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const api_error_1 = require("../exceptions/api.error");
const token_service_1 = require("../auth/token.service");
let AuthGuard = class AuthGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        if (+process.env.UNSECURE_AUTH) {
            return true;
        }
        try {
            const authorizationHeader = request.headers.authorization;
            if (!authorizationHeader) {
                throw api_error_1.ApiError.UnauthorizedError();
            }
            const accessToken = authorizationHeader.split(' ')[1];
            if (!accessToken) {
                throw api_error_1.ApiError.UnauthorizedError();
            }
            const userData = token_service_1.TokenService.validateAccessToken(accessToken);
            if (!userData) {
                throw api_error_1.ApiError.UnauthorizedError();
            }
            return true;
        }
        catch (e) {
            throw api_error_1.ApiError.UnauthorizedError();
        }
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)()
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map