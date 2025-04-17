"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseQuery = void 0;
exports.getEntityIdsByNaturalQuery = getEntityIdsByNaturalQuery;
class BaseQuery {
}
exports.BaseQuery = BaseQuery;
async function getEntityIdsByNaturalQuery(repository, query) {
    const ids = new Set((query['id'])?.split(',') || []);
    delete query['id'];
    const { sortOrder, sortField } = query;
    delete query['sortOrder'];
    delete query['sortField'];
    let columnsNames = Object.keys(query);
    const specialColumnNameOperators = columnsNames.filter((fn) => fn.includes("filter-operator"));
    const specialColumnNames = specialColumnNameOperators.map((n) => n.split("filter-operator-")[1]);
    columnsNames = columnsNames.filter((n) => !specialColumnNameOperators.includes(n) && !specialColumnNames.includes(n));
    if (columnsNames.length === 0 && specialColumnNames.length === 0) {
        if (ids.size > 0) {
            return [...ids].map(id => +id);
        }
        else {
            const entities = await repository.findMany({ orderBy: { [sortField]: sortOrder.toLowerCase() } });
            return entities.map(e => +e.id);
        }
    }
    let specialColumnEntities = [];
    if (specialColumnNames.length) {
        const where = {};
        const orderBy = {};
        if (sortOrder) {
            orderBy[sortField] = sortOrder.toLocaleLowerCase();
        }
        specialColumnNames.forEach((cn, chIndex) => {
            const operatorName = specialColumnNameOperators[chIndex];
            switch (query[operatorName]) {
                case '<':
                    where[cn] = {
                        lte: query[cn],
                    };
                    break;
                case '>':
                    where[cn] = {
                        gte: query[cn],
                    };
                    break;
                case 'range':
                    const values = query[cn].split('-');
                    where[cn] = {
                        lte: values[1],
                        gte: values[0],
                    };
                    break;
                case 'like':
                case 'LIKE':
                    where[cn] = {
                        contains: query[cn],
                    };
                    break;
            }
        });
        specialColumnEntities = await repository.findMany({ where: where, orderBy });
    }
    const specialIds = specialColumnEntities.map(e => +e.id);
    let entitiesByQuery = [];
    if (columnsNames.length) {
        const where = {};
        const orderBy = {};
        if (sortOrder) {
            orderBy[sortField] = sortOrder.toLocaleLowerCase();
        }
        columnsNames.forEach((cn, chIndex) => {
            switch (query[cn]) {
                case 'true':
                    where[cn] = true;
                    break;
                case 'false':
                    where[cn] = false;
                    break;
                default:
                    where[cn] = query[cn];
                    break;
            }
            switch (cn) {
                case 'userId':
                case 'id':
                    where[cn] = +query[cn];
                    break;
            }
        });
        entitiesByQuery = await repository.findMany({ where: where, orderBy });
    }
    const searchIds = new Set();
    if (ids.size > 0) {
        entitiesByQuery.forEach(entity => {
            if (ids.has(`${entity.id}`)) {
                if (specialColumnNames.length) {
                    if (specialIds.includes(+entity.id)) {
                        searchIds.add(`${entity.id}`);
                    }
                }
                else {
                    searchIds.add(`${entity.id}`);
                }
            }
        });
    }
    else {
        entitiesByQuery.forEach(entity => {
            if (specialColumnNames.length) {
                if (specialIds.includes(+entity.id)) {
                    searchIds.add(`${entity.id}`);
                }
            }
            else {
                searchIds.add(`${entity.id}`);
            }
        });
    }
    if (!entitiesByQuery.length) {
        if (ids.size > 0) {
            specialIds.forEach(id => {
                if (ids.has(`${id}`)) {
                    searchIds.add(`${id}`);
                }
            });
        }
        else {
            specialIds.forEach(id => {
                searchIds.add(`${id}`);
            });
        }
    }
    return [...searchIds].map(id => +id);
}
//# sourceMappingURL=enitities-functions.js.map