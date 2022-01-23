"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const Models_1 = require("../../entities/Models");
const sql_queries_1 = require("../../utils/sql-queries");
const base_repository_1 = require("./base.repository");
class FileRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Models_1.Models.FILES_TABLE_NAME);
    }
    updateById(id, item) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = (0, sql_queries_1.getUpdateByIdQuery)(this.tableName, id, item, true);
            console.log(query);
            const dbResult = yield this.query(query);
            return this.getOneRow(dbResult);
        });
    }
    update(newValues, expressionHash) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = (0, sql_queries_1.getUpdateByAndExpressionQuery)(this.tableName, newValues, expressionHash, true);
            console.log(query);
            const dbResult = yield this.query(query);
            return this.getOneRow(dbResult);
        });
    }
}
module.exports = new FileRepository();
//# sourceMappingURL=file.repository.js.map