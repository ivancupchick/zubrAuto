export const getGetAllQuery = (tableName: string) => {
  return `SELECT * FROM "${tableName}";`
}

export const getGetByIdQuery = (tableName: string, id: number) => {
  return `SELECT * FROM "${tableName}" WHERE id = ${id};`
}

export const getDeleteByIdQuery = (tableName: string, id: number) => {
  return `DELETE FROM "${tableName}" WHERE id = ${id};`
}

export const getUpdateByIdQuery = (tableName: string, id: number, object: any) => {
  return `UPDATE "${tableName}" SET ${
    Object.keys(object)
      .map((key) => `"${key}" = '${object[key]}'`)
      .join(',')
    } WHERE id = ${id};`
}

export const getInsertQuery = (tableName: string, object: any) => {
  let values = [];

  for (const iterator of object) {
    values.push(iterator)
  }
  return `INSERT INTO "${tableName}" (${
    Object.keys(object)
      .map(f => `"${f}"`)
      .join(',')}) VALUES(${values
      .map(f => `'${f}'`)
      .join(',')
    }) RETURNING id;`
}
