"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setHeaders = setHeaders;
function setHeaders(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Max-Age', 2592000);
    next();
}
//# sourceMappingURL=set-headers.middleware.js.map