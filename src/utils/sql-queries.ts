interface Hash {
  [key: string]: string[];
}

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

export const getDeleteByAndExpressions = (tableName: string, object: Hash) => {
  return `DELETE FROM "${tableName}" WHERE (${
    Object.keys(object).map(key => `${key} IN (${object[key].join(',')})`).join(' AND ')
  });`
}

export const getUpdateByIdQuery = (tableName: string, id: number, object: any) => {
  return `UPDATE "${tableName}" SET ${
    Object.keys(object)
      .map((key) => `"${key}" = '${object[key]}'`)
      .join(',')
    } WHERE id = ${id};`
}

export function getInsertOneQuery<P = any> (tableName: string, object: P) {
  return `INSERT INTO "${tableName}" (${
    Object.keys(object)
      .map(f => `"${f}"`)
      .join(',')}) VALUES(${
        Object.keys(object)
          .map(o => object[o])
          .map(f => `'${f}'`)
          .join(',')
        }) RETURNING id;`
}

export const getGetAllByOneColumnExpressionQuery = (tableName: string, object: Hash) => {
  return getGetAllByExpressionAndQuery(tableName, object);
}

export const getGetAllByExpressionAndQuery = (tableName: string, object: Hash) => {
  return `SELECT * FROM "${tableName}" WHERE (${
    Object.keys(object).map(key => `${key} IN (${object[key].join(',')})`).join(' AND ')
  });`
}

export const getGetAllByExpressionOrQuery = (tableName: string, object: Hash) => {
  return `SELECT * FROM "${tableName}" WHERE (${
    Object.keys(object).map(key => `${key} IN (${object[key].join(',')})`).join(' OR ')
  });`
}
