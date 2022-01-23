"use strict";
const Models_1 = require("../../entities/Models");
const base_repository_1 = require("./base.repository");
class CarOwnerRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Models_1.Models.CAR_OWNERS_TABLE_NAME);
    }
}
module.exports = new CarOwnerRepository();
//# sourceMappingURL=car-owner.repository.js.map