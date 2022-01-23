"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGetAllByExpressionOrQuery = exports.getGetAllByExpressionAndQuery = exports.getGetAllByOneColumnExpressionQuery = exports.getInsertOneQuery = exports.getUpdateByAndExpressionQuery = exports.getUpdateByIdQuery = exports.getDeleteByAndExpressions = exports.getDeleteByIdQuery = exports.getGetByIdQuery = exports.getGetAllQuery = void 0;
// TODO need to refactor
const getGetAllQuery = (tableName) => {
    return `SELECT * FROM "${tableName}";`;
};
exports.getGetAllQuery = getGetAllQuery;
const getGetByIdQuery = (tableName, id) => {
    return `SELECT * FROM "${tableName}" WHERE id = ${id};`;
};
exports.getGetByIdQuery = getGetByIdQuery;
// TODO: need test!
const getDeleteByIdQuery = (tableName, id) => {
    return (0, exports.getDeleteByAndExpressions)(tableName, { id: [`${id}`] });
};
exports.getDeleteByIdQuery = getDeleteByIdQuery;
const getDeleteByAndExpressions = (tableName, expressions) => {
    return `DELETE FROM "${tableName}" WHERE (${Object.keys(expressions).map(key => `"${key}" IN (${expressions[key].map(e => `'${e}'`).join(',')})`).join(' AND ')}) RETURNING *;`;
};
exports.getDeleteByAndExpressions = getDeleteByAndExpressions;
// need type for object
const getUpdateByIdQuery = (tableName, id, entity, isField = false) => {
    const entityHash = {};
    Object.keys(entity)
        .filter(key => isField
        ? key !== 'id' && key !== 'value'
        : key !== 'id')
        .forEach(key => entityHash[key] = `${entity[key]}`);
    return `UPDATE "${tableName}" SET ${Object.keys(entityHash)
        .map((key) => `"${key}" = '${entityHash[key]}'`)
        .join(',')} WHERE id = ${id} RETURNING *;`;
};
exports.getUpdateByIdQuery = getUpdateByIdQuery;
// need type for object
const getUpdateByAndExpressionQuery = (tableName, entity, expressions, isField = false) => {
    // TODO add Object.keys(entity).reduce
    const entityHash = {};
    Object.keys(entity)
        .filter(key => isField
        ? key !== 'id' && key !== 'value'
        : key !== 'id')
        .forEach(key => entityHash[key] = `${entity[key]}`);
    return `UPDATE "${tableName}" SET ${Object.keys(entityHash)
        .map((key) => `"${key}" = '${entityHash[key]}'`)
        .join(',')} WHERE (${Object.keys(expressions).map(key => `"${key}" IN (${expressions[key].map(e => `'${e}'`).join(',')})`).join(' AND ')}) RETURNING *;`;
};
exports.getUpdateByAndExpressionQuery = getUpdateByAndExpressionQuery;
function getInsertOneQuery(tableName, entity) {
    // TODO add Object.keys(entity).reduce
    const entityHash = {};
    Object.keys(entity)
        .filter(key => key !== 'id')
        .forEach(key => entityHash[key] = `${entity[key]}`);
    const keys = Object.keys(entityHash)
        .map(key => `"${key}"`);
    const values = Object.keys(entityHash)
        .map(key => `'${entityHash[key]}'`);
    return `INSERT INTO "${tableName}" (${keys.join(',')}) VALUES(${values.join(',')}) RETURNING *;`;
}
exports.getInsertOneQuery = getInsertOneQuery;
const getGetAllByOneColumnExpressionQuery = (tableName, expressions) => {
    return (0, exports.getGetAllByExpressionAndQuery)(tableName, expressions);
};
exports.getGetAllByOneColumnExpressionQuery = getGetAllByOneColumnExpressionQuery;
const getGetAllByExpressionAndQuery = (tableName, expressions) => {
    return `WITH data AS (SELECT * FROM "${tableName}" WHERE (${Object.keys(expressions).map(key => `"${key}" IN (${expressions[key].map(e => `'${e}'`).join(',')})`).join(' AND ')})) SELECT * FROM data;`;
};
exports.getGetAllByExpressionAndQuery = getGetAllByExpressionAndQuery;
const getGetAllByExpressionOrQuery = (tableName, expressions) => {
    return `WITH data AS (SELECT * FROM "${tableName}" WHERE (${Object.keys(expressions).map(key => `"${key}" IN (${expressions[key].map(e => `'${e}'`).join(',')})`).join(' OR ')})) SELECT * FROM data;`;
};
exports.getGetAllByExpressionOrQuery = getGetAllByExpressionOrQuery;
//# sourceMappingURL=sql-queries.js.map