"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_token_repository_1 = __importDefault(require("../repositories/base/user-token.repository"));
// TODO! only one session can exist
class TokenService {
    generateTokens(payload) {
        const accessToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '30m' });
        const refreshToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
        return {
            accessToken,
            refreshToken
        };
    }
    validateAccessToken(token) {
        try {
            const userData = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
            return userData;
        }
        catch (e) {
            return null;
        }
    }
    validateRefreshToken(token) {
        try {
            // ServerUser.Payload
            const userData = jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
            return userData;
        }
        catch (e) {
            return null;
        }
    }
    saveToken(userId, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenData = yield user_token_repository_1.default.findOne({ userId: [`${userId}`] });
            if (tokenData) {
                tokenData.refreshToken = refreshToken;
                return yield user_token_repository_1.default.updateById(tokenData.id, tokenData);
            }
            const token = yield user_token_repository_1.default.create({
                userId,
                refreshToken
            });
            return token;
        });
    }
    removeToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenData = user_token_repository_1.default.deleteOne({ refreshToken: [`${refreshToken}`] });
            return tokenData;
        });
    }
    findToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenData = user_token_repository_1.default.findOne({ refreshToken: [`${refreshToken}`] });
            return tokenData;
        });
    }
}
module.exports = new TokenService();
//# sourceMappingURL=token.service.js.map