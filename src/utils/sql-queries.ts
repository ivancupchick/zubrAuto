export interface ExpressionHash {
  [key: string]: string[];
}

export interface StringHash {
  [key: string]: string;
}

// TODO need to refactor

export const getGetAllQuery = (tableName: string) => {
  return `SELECT * FROM "${tableName}";`
}

export const getGetByIdQuery = (tableName: string, id: number) => {
  return `SELECT * FROM "${tableName}" WHERE id = ${id};`
}

// TODO: need test!
export const getDeleteByIdQuery = (tableName: string, id: number) => {
  return getDeleteByAndExpressions(tableName, { id: [`${id}`]});
}

export const getDeleteByAndExpressions = (tableName: string, expressions: ExpressionHash) => {
  return `DELETE FROM "${tableName}" WHERE (${
    Object.keys(expressions).map(key => `"${key}" IN (${expressions[key].map(e => `'${e}'`).join(',')})`).join(' AND ')
  }) RETURNING *;`
}

// need type for object
export const getUpdateByIdQuery = <T>(tableName: string, id: number, entity: T, isField: boolean = false) => {
  const entityHash: StringHash = {};

  Object.keys(entity).forEach(key => entityHash[key] = `${entity[key]}`);

  return `UPDATE "${tableName}" SET ${
    Object.keys(entityHash)
      .filter(key => {
        if (isField) {
          return key !== 'id' && key !== 'value';
        }

        return key !== 'id';
      })
      .map((key) => `"${key}" = '${entityHash[key]}'`)
      .join(',')
    } WHERE id = ${id} RETURNING *;`
}

// need type for object
export const getUpdateByAndExpressionQuery = <T>(tableName: string, entity: T, expressions: ExpressionHash, isField: boolean = false) => {
  // TODO add Object.keys(entity).reduce
  const entityHash: StringHash = {};

  Object.keys(entity).forEach(key => entityHash[key] = `${entity[key]}`);

  return `UPDATE "${tableName}" SET ${
    Object.keys(entityHash)
      // Need this filter?
      .filter(key => isField
        ? key !== 'id' && key !== 'value'
        : key !== 'id')
      .map((key) => `"${key}" = '${entityHash[key]}'`)
      .join(',')
    } WHERE (${
      Object.keys(expressions).map(key => `"${key}" IN (${expressions[key].map(e => `'${e}'`).join(',')})`).join(' AND ')
    }) RETURNING *;`
}

export function getInsertOneQuery<T> (tableName: string, entity: T) {
  // TODO add Object.keys(entity).reduce
  const entityHash: StringHash = {};

  Object.keys(entity).forEach(key => entityHash[key] = `${entity[key]}`);

  const keys: string[] = Object.keys(entityHash)
    .map(key => `"${key}"`);
  const values: string[] = Object.keys(entityHash)
    .map(key => `'${entityHash[key]}'`);

  return `INSERT INTO "${tableName}" (${keys.join(',')}) VALUES(${values.join(',')}) RETURNING *;`
}

export const getGetAllByOneColumnExpressionQuery = (tableName: string, expressions: ExpressionHash) => {
  return getGetAllByExpressionAndQuery(tableName, expressions);
}

export const getGetAllByExpressionAndQuery = (tableName: string, expressions: ExpressionHash) => {
  return `WITH data AS (SELECT * FROM "${tableName}" WHERE (${
    Object.keys(expressions).map(key => `"${key}" IN (${expressions[key].map(e => `'${e}'`).join(',')})`).join(' AND ')
  })) SELECT * FROM data;`
}

export const getGetAllByExpressionOrQuery = (tableName: string, expressions: ExpressionHash) => {
  return `WITH data AS (SELECT * FROM "${tableName}" WHERE (${
    Object.keys(expressions).map(key => `"${key}" IN (${expressions[key].map(e => `'${e}'`).join(',')})`).join(' OR ')
  })) SELECT * FROM data;`
}
