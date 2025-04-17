"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGetAllByExpressionOrQuery = exports.getGetSortedAllByExpressionAndQuery = exports.getGetAllByExpressionAndQuery = exports.getGetAllByOneColumnExpressionQuery = exports.getUpdateByAndExpressionQuery = exports.getUpdateByIdQuery = exports.getDeleteByAndExpressions = exports.getDeleteByIdQuery = exports.getGetByIdQuery = exports.getGetSortedAllQuery = exports.getGetAllQuery = void 0;
exports.getInsertOneQuery = getInsertOneQuery;
exports.getResultInsertOneQuery = getResultInsertOneQuery;
const getGetAllQuery = (tableName) => {
    return `SELECT * FROM \`${tableName}\`;`;
};
exports.getGetAllQuery = getGetAllQuery;
const getGetSortedAllQuery = (tableName, sortField, sortOrder) => {
    return `SELECT * FROM \`${tableName}\` ORDER BY ${sortField} ${sortOrder};`;
};
exports.getGetSortedAllQuery = getGetSortedAllQuery;
const getGetByIdQuery = (tableName, id) => {
    return `SELECT * FROM \`${tableName}\` WHERE id = ${id};`;
};
exports.getGetByIdQuery = getGetByIdQuery;
const getDeleteByIdQuery = (tableName, id) => {
    return (0, exports.getDeleteByAndExpressions)(tableName, { id: [`${id}`] });
};
exports.getDeleteByIdQuery = getDeleteByIdQuery;
const getDeleteByAndExpressions = (tableName, expressions) => {
    return `DELETE FROM \`${tableName}\` WHERE (${Object.keys(expressions).map(key => `${key} IN (${expressions[key].map(e => `'${e}'`).join(',')})`).join(' AND ')});`;
};
exports.getDeleteByAndExpressions = getDeleteByAndExpressions;
const getUpdateByIdQuery = (tableName, id, entity, isField = false) => {
    const entityHash = {};
    Object.keys(entity)
        .filter(key => isField
        ? key !== 'id' && key !== 'value'
        : key !== 'id')
        .forEach(key => entityHash[key] = `${entity[key]}`);
    return `UPDATE \`${tableName}\` SET ${Object.keys(entityHash)
        .map((key) => `${key} = '${entityHash[key]}'`)
        .join(',')} WHERE id = ${id};`;
};
exports.getUpdateByIdQuery = getUpdateByIdQuery;
const getUpdateByAndExpressionQuery = (tableName, entity, expressions, isField = false) => {
    const entityHash = {};
    Object.keys(entity)
        .filter(key => isField
        ? key !== 'id' && key !== 'value'
        : key !== 'id')
        .forEach(key => entityHash[key] = `${entity[key]}`);
    return `UPDATE \`${tableName}\` SET ${Object.keys(entityHash)
        .map((key) => `${key} = '${entityHash[key]}'`)
        .join(',')} WHERE (${Object.keys(expressions).map(key => `${key} IN (${expressions[key].map(e => `'${e}'`).join(',')})`).join(' AND ')});`;
};
exports.getUpdateByAndExpressionQuery = getUpdateByAndExpressionQuery;
function getInsertOneQuery(tableName, entity) {
    const entityHash = {};
    Object.keys(entity)
        .filter(key => key !== 'id')
        .forEach(key => entityHash[key] = `${entity[key]}`);
    const keys = Object.keys(entityHash)
        .map(key => `${key}`);
    const values = Object.keys(entityHash)
        .map(key => `'${entityHash[key]}'`);
    return `INSERT INTO \`${tableName}\` (${keys.join(',')}) VALUES(${values.join(',')});`;
}
function getResultInsertOneQuery(tableName, id) {
    return `SELECT * FROM \`${tableName}\` WHERE id IN ('${id}')`;
}
const getGetAllByOneColumnExpressionQuery = (tableName, expressions) => {
    return (0, exports.getGetAllByExpressionAndQuery)(tableName, expressions);
};
exports.getGetAllByOneColumnExpressionQuery = getGetAllByOneColumnExpressionQuery;
const getGetAllByExpressionAndQuery = (tableName, expressions) => {
    return `SELECT * FROM \`${tableName}\` WHERE (${Object.keys(expressions).map(key => `${key} IN (${expressions[key].map(e => `'${e}'`).join(',')})`).join(' AND ')});`;
};
exports.getGetAllByExpressionAndQuery = getGetAllByExpressionAndQuery;
const getGetSortedAllByExpressionAndQuery = (tableName, expressions, sortField, sortOrder) => {
    return `SELECT * FROM \`${tableName}\` WHERE (${Object.keys(expressions).map(key => `${key} IN (${expressions[key].map(e => `'${e}'`).join(',')})`).join(' AND ')}) ORDER BY ${sortField} ${sortOrder};`;
};
exports.getGetSortedAllByExpressionAndQuery = getGetSortedAllByExpressionAndQuery;
const getGetAllByExpressionOrQuery = (tableName, expressions) => {
    return `SELECT * FROM \`${tableName}\` WHERE (${Object.keys(expressions).map(key => `${key} IN (${expressions[key].map(e => `'${e}'`).join(',')})`).join(' OR ')});`;
};
exports.getGetAllByExpressionOrQuery = getGetAllByExpressionOrQuery;
//# sourceMappingURL=sql-queries.js.map