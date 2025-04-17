"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const cookieParser = require("cookie-parser");
const http_exception_filter_1 = require("./core/filters/http-exception/http-exception.filter");
BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
};
async function bootstrap() {
    let app = null;
    if (process.env.NODE_ENV !== 'production') {
        app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: {
                credentials: true,
                origin: 'http://localhost:4200'
            } });
    }
    else {
        app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: true });
    }
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.use(cookieParser());
    await app.listen(process.env.PORT);
}
bootstrap();
//# sourceMappingURL=main.js.map