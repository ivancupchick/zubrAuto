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
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
// Routes
const index_routes_1 = __importDefault(require("./routes/index.routes"));
const car_routes_1 = __importDefault(require("./routes/car.routes"));
const field_routes_1 = __importDefault(require("./routes/field.routes"));
const client_routes_1 = __importDefault(require("./routes/client.routes"));
const role_routes_1 = __importDefault(require("./routes/role.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const express_fileupload_1 = __importDefault(require("express-fileupload"));
class App {
    constructor(port) {
        this.port = port;
        this.routes = () => {
            this.app.use(express_1.default.static(process.cwd() + "/build/ui/zubr-auto/"));
            this.app.use('/uploads/', express_1.default.static(process.cwd() + "/build/uploads/"));
            this.app.use(index_routes_1.default);
            this.app.use('/cars', car_routes_1.default);
            this.app.use('/fields', field_routes_1.default);
            this.app.use('/clients', client_routes_1.default);
            this.app.use('/auth', auth_routes_1.default);
            this.app.use('/roles', role_routes_1.default);
            this.app.use('/users', user_routes_1.default);
        };
        this.app = (0, express_1.default)();
        this.settings();
        this.middlewares(this.routes);
    }
    settings() {
        this.app.set('port', this.port || process.env.PORT || 3080);
    }
    middlewares(routesHandler) {
        this.app.use((0, express_fileupload_1.default)({}));
        this.app.use(express_1.default.json());
        this.app.use((0, cookie_parser_1.default)());
        if (process.env.NODE_ENV !== 'production') {
            this.app.use((0, cors_1.default)({
                credentials: true,
                origin: 'http://localhost:4200' // delete in dev and nice to have if client and server have dirent adreses
            }));
            // this.app.use(setHeaders);
        }
        routesHandler();
        this.app.use(error_middleware_1.errorMiddleware);
    }
    listen() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.app.listen(this.app.get('port'));
            console.log('Server on port', this.app.get('port'));
        });
    }
}
exports.App = App;
//# sourceMappingURL=app.js.map