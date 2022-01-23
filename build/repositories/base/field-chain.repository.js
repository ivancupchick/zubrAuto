"use strict";
const Models_1 = require("../../entities/Models");
const base_repository_1 = require("./base.repository");
class FieldChainRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Models_1.Models.FIELD_CHAINS_TABLE_NAME);
    }
}
module.exports = new FieldChainRepository();
//# sourceMappingURL=field-chain.repository.js.map