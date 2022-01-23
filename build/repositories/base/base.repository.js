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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const sql_queries_1 = require("../../utils/sql-queries");
const database_1 = require("../../database");
const api_error_1 = require("../../exceptions/api.error");
class BaseRepository {
    constructor(tableName) {
        this.tableName = tableName;
    }
    query(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield database_1.db.query(query);
        });
    }
    create(item) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = (0, sql_queries_1.getInsertOneQuery)(this.tableName, item);
            console.log(query);
            const dbResult = yield this.query(query);
            return this.getOneRow(dbResult);
        });
    }
    updateById(id, item) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = (0, sql_queries_1.getUpdateByIdQuery)(this.tableName, id, item);
            console.log(query);
            const dbResult = yield this.query(query);
            return this.getOneRow(dbResult);
        });
    }
    update(newValues, expressionHash) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = (0, sql_queries_1.getUpdateByAndExpressionQuery)(this.tableName, newValues, expressionHash);
            console.log(query);
            const dbResult = yield this.query(query);
            return this.getOneRow(dbResult);
        });
    }
    deleteById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = (0, sql_queries_1.getDeleteByIdQuery)(this.tableName, id);
            console.log(query);
            const dbResult = yield this.query(query);
            return this.getOneRow(dbResult);
        });
    }
    deleteOne(expressionHash) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = (0, sql_queries_1.getDeleteByAndExpressions)(this.tableName, expressionHash);
            console.log(query);
            const dbResult = yield this.query(query);
            return this.getOneRow(dbResult);
        });
    }
    find(expressionHash) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = (0, sql_queries_1.getGetAllByExpressionAndQuery)(this.tableName, expressionHash);
            console.log(query);
            const dbResult = yield this.query(query);
            return this.getAllRows(dbResult);
        });
    }
    findOne(expressionHash) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = (0, sql_queries_1.getGetAllByExpressionAndQuery)(this.tableName, expressionHash);
            console.log(query);
            const dbResult = yield this.query(query);
            return this.getOneRow(dbResult);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = (0, sql_queries_1.getGetByIdQuery)(this.tableName, id);
            console.log(query);
            const dbResult = yield this.query(query);
            return this.getOneRow(dbResult);
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = (0, sql_queries_1.getGetAllQuery)(this.tableName);
            console.log(query);
            const dbResult = yield this.query(query);
            return this.getAllRows(dbResult);
        });
    }
    getAllRows(queryResult) {
        return queryResult.rows || [];
    }
    getOneRow(queryResult) {
        if (queryResult.rows.length > 1) {
            throw new api_error_1.ApiError(400, 'Ошибка бд');
        }
        if (queryResult.rows.length === 0 || !queryResult.rows[0]) {
            return null;
        }
        return queryResult.rows[0];
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=base.repository.js.map