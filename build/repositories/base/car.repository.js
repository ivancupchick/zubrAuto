"use strict";
const Models_1 = require("../../entities/Models");
const base_repository_1 = require("./base.repository");
class CarRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Models_1.Models.CARS_TABLE_NAME);
    }
}
module.exports = new CarRepository();
//# sourceMappingURL=car.repository.js.map