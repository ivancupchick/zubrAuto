"use strict";
const Models_1 = require("../../entities/Models");
const base_repository_1 = require("./base.repository");
class UserTokenRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Models_1.Models.USER_TOKENS_TABLE_NAME);
    }
}
module.exports = new UserTokenRepository();
//# sourceMappingURL=user-token.repository.js.map