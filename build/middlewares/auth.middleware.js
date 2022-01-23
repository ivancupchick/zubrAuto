"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const api_error_1 = require("../exceptions/api.error");
const token_service_1 = __importDefault(require("../services/token.service"));
function authMiddleware(req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return next(api_error_1.ApiError.UnauthorizedError());
        }
        const accessToken = authorizationHeader.split(' ')[1];
        if (!accessToken) {
            return next(api_error_1.ApiError.UnauthorizedError());
        }
        const userData = token_service_1.default.validateAccessToken(accessToken);
        if (!userData) {
            return next(api_error_1.ApiError.UnauthorizedError());
        }
        // req.body.SERVER_DATA = {};
        // req.body.SERVER_DATA.user = userData;
        next();
    }
    catch (e) {
        return next(api_error_1.ApiError.UnauthorizedError());
    }
}
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map