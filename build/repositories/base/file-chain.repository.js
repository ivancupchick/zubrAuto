"use strict";
const Models_1 = require("../../entities/Models");
const base_repository_1 = require("./base.repository");
class FileChainRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Models_1.Models.FILE_CHAINS_TABLE_NAME);
    }
}
module.exports = new FileChainRepository();
//# sourceMappingURL=file-chain.repository.js.map