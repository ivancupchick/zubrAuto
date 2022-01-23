"use strict";
const Models_1 = require("../../entities/Models");
const base_repository_1 = require("./base.repository");
class UserRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Models_1.Models.USERS_TABLE_NAME);
    }
}
module.exports = new UserRepository();
//# sourceMappingURL=user.repository.js.map