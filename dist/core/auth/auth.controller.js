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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const refresh_token_max_age_constant_1 = require("../constants/refresh-token-max-age.constant");
const auth_registration_dto_1 = require("./dto/auth-registration.dto");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async registration(body, res) {
        const { email, password } = body;
        const userData = await this.authService.registration(email, password);
        res.cookie('refreshToken', userData.refreshToken, { maxAge: refresh_token_max_age_constant_1.REFRESH_TOKEN_MAX_AGE_MS, httpOnly: true });
        return userData;
    }
    async login(body, res) {
        const { email, password } = body;
        const userData = await this.authService.login(email, password);
        res.cookie('refreshToken', userData.refreshToken, { maxAge: refresh_token_max_age_constant_1.REFRESH_TOKEN_MAX_AGE_MS, httpOnly: true });
        return userData;
    }
    async logout(req, res) {
        const { refreshToken } = req.cookies;
        await this.authService.logout(refreshToken);
        res.clearCookie('refreshToken');
        return true;
    }
    async activate(params, res) {
        const activationLink = params.link;
        await this.authService.activate(activationLink);
        return res.redirect(process.env.CLIENT_URL);
    }
    async refresh(req, res) {
        const { refreshToken } = req.cookies;
        const userData = await this.authService.refresh(refreshToken);
        res.cookie('refreshToken', userData.refreshToken, { maxAge: refresh_token_max_age_constant_1.REFRESH_TOKEN_MAX_AGE_MS, httpOnly: true });
        return userData;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('registration'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_registration_dto_1.RegistationUserDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registration", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('activate/:link'),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "activate", null);
__decorate([
    (0, common_1.Get)('refresh'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map