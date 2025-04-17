"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
const common_1 = require("@nestjs/common");
class ApiError extends common_1.HttpException {
    constructor(status, message, errors = []) {
        super(message, status);
        this.errors = errors;
    }
    static UnauthorizedError() {
        return new common_1.UnauthorizedException(null, 'Пользователь не авторизован');
    }
    static BadRequest(message, errors = []) {
        return new common_1.BadRequestException(errors, message);
    }
}
exports.ApiError = ApiError;
//# sourceMappingURL=api.error.js.map