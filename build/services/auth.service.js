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
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const mail_service_1 = __importDefault(require("./mail.service"));
const token_service_1 = __importDefault(require("./token.service"));
const api_error_1 = require("../exceptions/api.error");
const user_repository_1 = __importDefault(require("../repositories/base/user.repository"));
const Role_1 = require("../entities/Role");
const Auth_1 = require("../entities/Auth");
const role_repository_1 = __importDefault(require("../repositories/base/role.repository"));
class AuthService {
    registration(email, password) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const existUser = yield user_repository_1.default.findOne({ email: [email] });
            if (existUser) {
                throw api_error_1.ApiError.BadRequest(`User with ${email} exists`); // Error codes
            }
            const hashPassword = yield bcrypt_1.default.hash(password, 3);
            const activationLink = (0, uuid_1.v4)();
            const customRoles = yield role_repository_1.default.getAll();
            const user = yield user_repository_1.default.create({
                email,
                isActivated: false,
                password: hashPassword,
                activationLink,
                roleLevel: Role_1.ServerRole.System.None,
            });
            const payloadUser = Object.assign(Object.assign({}, user), { customRoleName: ((_a = customRoles.find(cr => (cr.id + 1000) === user.roleLevel)) === null || _a === void 0 ? void 0 : _a.systemName) || '' });
            yield mail_service_1.default.sendActivationMail(email, `${process.env.API_URL}/activate/` + activationLink); // need test
            const userPayload = new Auth_1.ServerAuth.Payload(payloadUser);
            const tokens = token_service_1.default.generateTokens(Object.assign({}, userPayload));
            yield token_service_1.default.saveToken(userPayload.id, tokens.refreshToken);
            return Object.assign(Object.assign({}, tokens), { user: userPayload });
        });
    }
    activate(activationLink) {
        return __awaiter(this, void 0, void 0, function* () {
            const existUser = yield user_repository_1.default.findOne({ activationLink: [activationLink] });
            if (!existUser) {
                throw api_error_1.ApiError.BadRequest(`User not exists`); // Error codes
            }
            existUser.isActivated = true;
            user_repository_1.default.updateById(existUser.id, existUser);
        });
    }
    login(email, password) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_repository_1.default.findOne({ email: [email] });
            if (!user) {
                throw api_error_1.ApiError.BadRequest('Пользователь с таким email не найден'); // Error codes
            }
            const isPassEquals = yield bcrypt_1.default.compare(password, user.password);
            if (!isPassEquals) {
                throw api_error_1.ApiError.BadRequest('Неверный пароль'); // Error codes
            }
            const customRoles = yield role_repository_1.default.getAll();
            const payloadUser = Object.assign(Object.assign({}, user), { customRoleName: ((_a = customRoles.find(cr => (cr.id + 1000) === user.roleLevel)) === null || _a === void 0 ? void 0 : _a.systemName) || '' });
            const userPayload = new Auth_1.ServerAuth.Payload(payloadUser);
            const tokens = token_service_1.default.generateTokens(Object.assign({}, userPayload));
            yield token_service_1.default.saveToken(userPayload.id, tokens.refreshToken);
            return Object.assign(Object.assign({}, tokens), { user: userPayload });
        });
    }
    logout(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield token_service_1.default.removeToken(refreshToken);
            return token;
        });
    }
    refresh(refreshToken) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!refreshToken) {
                throw api_error_1.ApiError.UnauthorizedError();
            }
            const userData = token_service_1.default.validateRefreshToken(refreshToken);
            const tokenFromDb = yield token_service_1.default.findToken(refreshToken);
            if (!userData || !tokenFromDb) {
                throw api_error_1.ApiError.UnauthorizedError();
            }
            const user = yield user_repository_1.default.findById(userData.id);
            const customRoles = yield role_repository_1.default.getAll();
            const userPayload = new Auth_1.ServerAuth.Payload(Object.assign(Object.assign({}, user), { customRoleName: ((_a = customRoles.find(cr => (cr.id + 1000) === user.roleLevel)) === null || _a === void 0 ? void 0 : _a.systemName) || '' }));
            const tokens = token_service_1.default.generateTokens(Object.assign({}, userPayload));
            yield token_service_1.default.saveToken(userPayload.id, tokens.refreshToken);
            return Object.assign(Object.assign({}, tokens), { user: userPayload });
        });
    }
}
module.exports = new AuthService();
//# sourceMappingURL=auth.service.js.map