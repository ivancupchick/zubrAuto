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
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const jsonwebtoken_1 = require("jsonwebtoken");
const refresh_token_max_age_constant_1 = require("../constants/refresh-token-max-age.constant");
const prisma_service_1 = require("../../prisma/prisma.service");
let TokenService = class TokenService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateTokens(payload) {
        const accessToken = (0, jsonwebtoken_1.sign)(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
        const refreshToken = (0, jsonwebtoken_1.sign)(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: refresh_token_max_age_constant_1.REFRESH_TOKEN_MAX_AGE_MS });
        return {
            accessToken,
            refreshToken
        };
    }
    static validateAccessToken(token) {
        try {
            const userData = (0, jsonwebtoken_1.verify)(token, process.env.JWT_ACCESS_SECRET);
            return userData;
        }
        catch (e) {
            console.log(e);
            return null;
        }
    }
    decodeAccessToken(token) {
        try {
            const userData = (0, jsonwebtoken_1.decode)(token);
            return userData;
        }
        catch (e) {
            return null;
        }
    }
    validateRefreshToken(token) {
        try {
            const userData = (0, jsonwebtoken_1.verify)(token, process.env.JWT_REFRESH_SECRET);
            return userData;
        }
        catch (e) {
            return null;
        }
    }
    async saveToken(userId, refreshToken) {
        const tokenData = await this.prisma.userTokens.findFirst({ where: { userId: userId } });
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return await this.prisma.userTokens.update({ where: { id: tokenData.id }, data: tokenData });
        }
        const token = await this.prisma.userTokens.create({ data: {
                userId,
                refreshToken
            } });
        return token;
    }
    async removeToken(refreshToken) {
        return await this.prisma.userTokens.deleteMany({ where: { refreshToken } });
    }
    async findToken(refreshToken) {
        return await this.prisma.userTokens.findFirst({ where: { refreshToken: refreshToken } });
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TokenService);
//# sourceMappingURL=token.service.js.map