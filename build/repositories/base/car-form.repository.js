"use strict";
const Models_1 = require("../../entities/Models");
const base_repository_1 = require("./base.repository");
class CarFormRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Models_1.Models.CAR_FORMS_TABLE_NAME);
    }
}
module.exports = new CarFormRepository();
//# sourceMappingURL=car-form.repository.js.map