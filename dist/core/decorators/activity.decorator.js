"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerActivity = ControllerActivity;
const change_log_service_1 = require("../../modules/change-log/change-log.service");
const token_service_1 = require("../auth/token.service");
const common_1 = require("@nestjs/common");
function ControllerActivity(object) {
    const injectTokenService = (0, common_1.Inject)(token_service_1.TokenService);
    const injectChangeLogService = (0, common_1.Inject)(change_log_service_1.ChangeLogService);
    return (target, propertyName, descriptor) => {
        injectTokenService(target, 'tokenService');
        injectChangeLogService(target, 'changeLogService');
        const method = descriptor.value;
        descriptor.value = function (...args) {
            const tokenService = this.tokenService;
            const changeLogService = this.changeLogService;
            const req = args[0];
            const authorizationHeader = req.headers.authorization;
            const accessToken = authorizationHeader.split(' ')[1];
            const userData = tokenService.decodeAccessToken(accessToken);
            const params = req.params;
            const body = req.body;
            const result = method.apply(this, args);
            result.then(res => {
                changeLogService.createActivity({
                    userId: userData?.id || 0,
                    sourceId: res?.id || res?.clientId || 0,
                    sourceName: object.sourceName,
                    date: BigInt(+(new Date())),
                    type: object.type,
                    activities: JSON.stringify({
                        request: {
                            params,
                            body
                        }
                    })
                }).then();
            });
            return result;
        };
    };
}
//# sourceMappingURL=activity.decorator.js.map