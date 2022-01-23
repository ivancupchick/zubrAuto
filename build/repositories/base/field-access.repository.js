"use strict";
const Models_1 = require("../../entities/Models");
const base_repository_1 = require("./base.repository");
class FieldAccessRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Models_1.Models.FIELD_ACCESSES_TABLE_NAME);
    }
}
module.exports = new FieldAccessRepository();
//# sourceMappingURL=field-access.repository.js.map