"use strict";
const Models_1 = require("../../entities/Models");
const base_repository_1 = require("./base.repository");
class ClientRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Models_1.Models.CLIENTS_TABLE_NAME);
    }
}
module.exports = new ClientRepository();
//# sourceMappingURL=client.repository.js.map