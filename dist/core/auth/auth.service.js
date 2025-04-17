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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const Auth_1 = require("../../temp/entities/Auth");
const api_error_1 = require("../exceptions/api.error");
const uuid_1 = require("uuid");
const Role_1 = require("../../temp/entities/Role");
const token_service_1 = require("./token.service");
const bcryptjs_1 = require("bcryptjs");
let AuthService = class AuthService {
    constructor(prisma, tokenService) {
        this.prisma = prisma;
        this.tokenService = tokenService;
    }
    async registration(email, password) {
        const existUser = await this.prisma.users.findFirst({ where: { email: email } });
        if (existUser) {
            throw api_error_1.ApiError.BadRequest(`User with ${email} exists`);
        }
        const hashPassword = await (0, bcryptjs_1.hash)(password, 3);
        const activationLink = (0, uuid_1.v4)();
        const customRoles = await this.prisma.roles.findMany();
        const user = await this.prisma.users.create({ data: {
                email,
                isActivated: false,
                password: hashPassword,
                activationLink,
                roleLevel: Role_1.ServerRole.System.None,
                deleted: false,
            } });
        const payloadUser = {
            ...user,
            customRoleName: customRoles.find(cr => (cr.id + 1000) === user.roleLevel)?.systemName || '',
        };
        const userPayload = new Auth_1.ServerAuth.Payload(payloadUser);
        const tokens = this.tokenService.generateTokens({ ...userPayload });
        await this.tokenService.saveToken(userPayload.id, tokens.refreshToken);
        return {
            ...tokens,
            user: userPayload
        };
    }
    async activate(activationLink) {
        const existUser = await this.prisma.users.findFirst({ where: { activationLink: activationLink } });
        if (!existUser) {
            throw api_error_1.ApiError.BadRequest(`User not exists`);
        }
        existUser.isActivated = true;
        this.prisma.users.update({ where: { id: existUser.id }, data: existUser });
    }
    async login(email, password) {
        const user = await this.prisma.users.findFirst({ where: { email: email } });
        if (!user) {
            throw api_error_1.ApiError.BadRequest('Пользователь с таким email не найден');
        }
        const isPassEquals = await (0, bcryptjs_1.compare)(password, user.password);
        if (!isPassEquals) {
            throw api_error_1.ApiError.BadRequest('Неверный пароль');
        }
        const customRoles = await this.prisma.roles.findMany();
        const payloadUser = {
            ...user,
            customRoleName: customRoles.find(cr => (cr.id + 1000) === user.roleLevel)?.systemName || '',
        };
        const userPayload = new Auth_1.ServerAuth.Payload(payloadUser);
        const tokens = this.tokenService.generateTokens({ ...userPayload });
        await this.tokenService.saveToken(userPayload.id, tokens.refreshToken);
        return {
            ...tokens,
            user: userPayload
        };
    }
    async logout(refreshToken) {
        return await this.tokenService.removeToken(refreshToken);
    }
    async refresh(refreshToken) {
        if (!refreshToken) {
            throw api_error_1.ApiError.UnauthorizedError();
        }
        const userData = this.tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await this.tokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb) {
            throw api_error_1.ApiError.UnauthorizedError();
        }
        const user = await this.prisma.users.findUnique({ where: { id: userData.id } });
        const customRoles = await this.prisma.roles.findMany();
        const userPayload = new Auth_1.ServerAuth.Payload({
            ...user,
            customRoleName: customRoles.find(cr => (cr.id + 1000) === user.roleLevel)?.systemName || '',
        });
        const tokens = this.tokenService.generateTokens({ ...userPayload });
        await this.tokenService.saveToken(userPayload.id, tokens.refreshToken);
        return {
            ...tokens,
            user: userPayload
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, token_service_1.TokenService])
], AuthService);
//# sourceMappingURL=auth.service.js.map