"use strict";
const Models_1 = require("../../entities/Models");
const base_repository_1 = require("./base.repository");
class CarStatisticRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Models_1.Models.CAR_STATISTIC_TABLE_NAME);
    }
}
module.exports = new CarStatisticRepository();
//# sourceMappingURL=car-statistic.repository.js.map