export type ExpressionHash<T> = {
  [P in keyof Partial<T>]: string[];
} & Object;
export interface StringHash {
  [key: string]: string;
}

export interface NumberHash {
  [key: string]: number;
}

// TODO need to refactor

// pg
// export const getGetAllQuery = (tableName: string) => {
//   return `SELECT * FROM "${tableName}";`
// }

// export const getGetByIdQuery = (tableName: string, id: number) => {
//   return `SELECT * FROM "${tableName}" WHERE id = ${id};`
// }

// // TODO: need test!
// export const getDeleteByIdQuery = (tableName: string, id: number) => {
//   return getDeleteByAndExpressions(tableName, { id: [`${id}`]});
// }

// export const getDeleteByAndExpressions = <T>(tableName: string, expressions: ExpressionHash<T>) => {
//   return `DELETE FROM "${tableName}" WHERE (${
//     Object.keys(expressions).map(key => `"${key}" IN (${expressions[key].map(e => `'${e}'`).join(',')})`).join(' AND ')
//   }) RETURNING *;`
// }

// // need type for object
// export const getUpdateByIdQuery = <T>(tableName: string, id: number, entity: Partial<Omit<T, 'id'>>, isField: boolean = false) => {
//   const entityHash: StringHash = {};

//   Object.keys(entity)
//     .filter(key => isField
//       ? key !== 'id' && key !== 'value'
//       : key !== 'id')
//     .forEach(key => entityHash[key] = `${entity[key]}`);

//   return `UPDATE "${tableName}" SET ${
//     Object.keys(entityHash)
//       .map((key) => `"${key}" = '${entityHash[key]}'`)
//       .join(',')
//     } WHERE id = ${id} RETURNING *;`
// }

// // need type for object
// export const getUpdateByAndExpressionQuery = <T>(tableName: string, entity: Partial<Omit<T, 'id'>>, expressions: ExpressionHash<Omit<T, 'id'>>, isField: boolean = false) => {
//   // TODO add Object.keys(entity).reduce
//   const entityHash: StringHash = {};

//   Object.keys(entity)
//     .filter(key => isField
//       ? key !== 'id' && key !== 'value'
//       : key !== 'id')
//     .forEach(key => entityHash[key] = `${entity[key]}`);

//   return `UPDATE "${tableName}" SET ${
//     Object.keys(entityHash)
//       .map((key) => `"${key}" = '${entityHash[key]}'`)
//       .join(',')
//     } WHERE (${
//       Object.keys(expressions).map(key => `"${key}" IN (${expressions[key].map(e => `'${e}'`).join(',')})`).join(' AND ')
//     }) RETURNING *;`
// }

// export function getInsertOneQuery<T> (tableName: string, entity: Omit<T, 'id'>) {
//   // TODO add Object.keys(entity).reduce
//   const entityHash: StringHash = {};

//   Object.keys(entity)
//     .filter(key => key !== 'id')
//     .forEach(key => entityHash[key] = `${entity[key]}`);

//   const keys: string[] = Object.keys(entityHash)
//     .map(key => `"${key}"`);
//   const values: string[] = Object.keys(entityHash)
//     .map(key => `'${entityHash[key]}'`);

//   return `INSERT INTO "${tableName}" (${keys.join(',')}) VALUES(${values.join(',')}) RETURNING *;`
// }

// export const getGetAllByOneColumnExpressionQuery = <T>(tableName: string, expressions: ExpressionHash<T>) => {
//   return getGetAllByExpressionAndQuery(tableName, expressions);
// }

// export const getGetAllByExpressionAndQuery = <T>(tableName: string, expressions: ExpressionHash<T>) => {
//   return `WITH data AS (SELECT * FROM "${tableName}" WHERE (${
//     Object.keys(expressions).map(key => `"${key}" IN (${expressions[key].map(e => `'${e}'`).join(',')})`).join(' AND ')
//   })) SELECT * FROM data;`
// }

// export const getGetAllByExpressionOrQuery = <T>(tableName: string, expressions: ExpressionHash<T>) => {
//   return `WITH data AS (SELECT * FROM "${tableName}" WHERE (${
//     Object.keys(expressions).map(key => `"${key}" IN (${expressions[key].map(e => `'${e}'`).join(',')})`).join(' OR ')
//   })) SELECT * FROM data;`
// }

// mysql

export const getGetAllQuery = (tableName: string) => {
  return `SELECT * FROM \`${tableName}\`;`
}

export const getGetByIdQuery = (tableName: string, id: number) => {
  return `SELECT * FROM \`${tableName}\` WHERE id = ${id};`
}

// TODO: need test!
export const getDeleteByIdQuery = (tableName: string, id: number) => {
  return getDeleteByAndExpressions(tableName, { id: [`${id}`]});
}

export const getDeleteByAndExpressions = <T>(tableName: string, expressions: ExpressionHash<T>) => {
  return `DELETE FROM \`${tableName}\` WHERE (${
    Object.keys(expressions).map(key => `${key} IN (${expressions[key].map(e => `'${e}'`).join(',')})`).join(' AND ')
  });`
}

// need type for object
export const getUpdateByIdQuery = <T>(tableName: string, id: number, entity: Partial<Omit<T, 'id'>>, isField: boolean = false) => {
  const entityHash: StringHash = {};

  Object.keys(entity)
    .filter(key => isField
      ? key !== 'id' && key !== 'value'
      : key !== 'id')
    .forEach(key => entityHash[key] = `${entity[key]}`);

  return `UPDATE \`${tableName}\` SET ${
    Object.keys(entityHash)
      .map((key) => `${key} = '${entityHash[key]}'`)
      .join(',')
    } WHERE id = ${id};`
}

// need type for object
export const getUpdateByAndExpressionQuery = <T>(tableName: string, entity: Partial<Omit<T, 'id'>>, expressions: ExpressionHash<Omit<T, 'id'>>, isField: boolean = false) => {
  // TODO add Object.keys(entity).reduce
  const entityHash: StringHash = {};

  Object.keys(entity)
    .filter(key => isField
      ? key !== 'id' && key !== 'value'
      : key !== 'id')
    .forEach(key => entityHash[key] = `${entity[key]}`);

  return `UPDATE \`${tableName}\` SET ${
    Object.keys(entityHash)
      .map((key) => `${key} = '${entityHash[key]}'`)
      .join(',')
    } WHERE (${
      Object.keys(expressions).map(key => `${key} IN (${expressions[key].map(e => `'${e}'`).join(',')})`).join(' AND ')
    });`
}

export function getInsertOneQuery<T> (tableName: string, entity: Omit<T, 'id'>) {
  // TODO add Object.keys(entity).reduce
  const entityHash: StringHash = {};

  Object.keys(entity)
    .filter(key => key !== 'id')
    .forEach(key => entityHash[key] = `${entity[key]}`);

  const keys: string[] = Object.keys(entityHash)
    .map(key => `${key}`);
  const values: string[] = Object.keys(entityHash)
    .map(key => `'${entityHash[key]}'`);

  return `INSERT INTO \`${tableName}\` (${keys.join(',')}) VALUES(${values.join(',')});`
}

export function getResultInsertOneQuery<T>(tableName: string, id) {
  return `SELECT * FROM \`${tableName}\` WHERE id IN ('${id}')`
}

export const getGetAllByOneColumnExpressionQuery = <T>(tableName: string, expressions: ExpressionHash<T>) => {
  return getGetAllByExpressionAndQuery(tableName, expressions);
}

export const getGetAllByExpressionAndQuery = <T>(tableName: string, expressions: ExpressionHash<T>) => {
  // expressions = Object.keys(expressions).reduce((prev, curKey) => {

  // }, {})
  return `SELECT * FROM \`${tableName}\` WHERE (${
    Object.keys(expressions).map(key => `${key} IN (${expressions[key].map(e => `'${e}'`).join(',')})`).join(' AND ')
  });`
}

export const getGetAllByExpressionOrQuery = <T>(tableName: string, expressions: ExpressionHash<T>) => {
  return `SELECT * FROM \`${tableName}\` WHERE (${
    Object.keys(expressions).map(key => `${key} IN (${expressions[key].map(e => `'${e}'`).join(',')})`).join(' OR ')
  });`
}
