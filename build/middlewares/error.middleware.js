"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const api_error_1 = require("../exceptions/api.error");
function errorMiddleware(err, req, res, next) {
    if (err instanceof api_error_1.ApiError) {
        return res.status(err.status)
            .json({
            message: err.message,
            errors: err.errors
        });
    }
    console.error(err);
    return res.status(500)
        .json({
        message: 'Непридвиденная ошибка'
    });
}
exports.errorMiddleware = errorMiddleware;
//# sourceMappingURL=error.middleware.js.map