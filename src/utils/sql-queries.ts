interface Hash {
  [key: string]: string[];
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

export const getDeleteByAndExpressions = (tableName: string, object: Hash) => {
  return `DELETE FROM "${tableName}" WHERE (${
    Object.keys(object).map(key => `${key} IN (${object[key].join(',')})`).join(' AND ')
  });`
}

// need type for object
export const getUpdateByIdQuery = (tableName: string, id: number, object: any, isField: boolean = false) => {
  return `UPDATE "${tableName}" SET ${
    Object.keys(object)
      .filter(key => {
        if (isField) {
          return key !== 'id' && key !== 'value';
        }

        return key !== 'id';
      })
      .map((key) => `"${key}" = '${object[key]}'`)
      .join(',')
    } WHERE id = ${id};`
}

// need type for object
export const getUpdateByAndExpressionQuery = (tableName: string, object: any, expressionsObject: Hash, isField: boolean = false) => {
  return `UPDATE "${tableName}" SET ${
    Object.keys(object)
      // Need this filter? 
      .filter(key => {
        if (isField) {
          return key !== 'id' && key !== 'value';
        }

        return key !== 'id';
      })
      .map((key) => `"${key}" = '${object[key]}'`)
      .join(',')
    } WHERE (${
      Object.keys(expressionsObject).map(key => `"${key}" IN (${expressionsObject[key].join(',')})`).join(' AND ')
    });`
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

export const getGetAllByOneColumnExpressionQuery = (tableName: string, expressionsObject: Hash) => {
  return getGetAllByExpressionAndQuery(tableName, expressionsObject);
}

export const getGetAllByExpressionAndQuery = (tableName: string, expressionsObject: Hash) => {
  return `SELECT * FROM "${tableName}" WHERE (${
    Object.keys(expressionsObject).map(key => `"${key}" IN (${expressionsObject[key].join(',')})`).join(' AND ')
  });`
}

export const getGetAllByExpressionOrQuery = (tableName: string, expressionsObject: Hash) => {
  return `SELECT * FROM "${tableName}" WHERE (${
    Object.keys(expressionsObject).map(key => `${key} IN (${expressionsObject[key].join(',')})`).join(' OR ')
  });`
}
