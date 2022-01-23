"use strict";
const Models_1 = require("../../entities/Models");
const base_repository_1 = require("./base.repository");
class RoleRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Models_1.Models.ROLES_TABLE_NAME);
    }
}
module.exports = new RoleRepository();
//# sourceMappingURL=role.repository.js.map