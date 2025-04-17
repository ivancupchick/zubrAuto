"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePhoneCallDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_phone_call_dto_1 = require("./create-phone-call.dto");
class UpdatePhoneCallDto extends (0, mapped_types_1.PartialType)(create_phone_call_dto_1.CreatePhoneCallDto) {
}
exports.UpdatePhoneCallDto = UpdatePhoneCallDto;
//# sourceMappingURL=update-phone-call.dto.js.map