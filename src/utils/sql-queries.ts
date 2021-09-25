export const getGetAllQuery = (tableName: string) => {
  return `SELECT * FROM "${tableName}";`
}

export const getGetByIdQuery = (tableName: string, id: number) => {
  return `SELECT * FROM "${tableName}" WHERE id = ${id};`
}

export const getDeleteByIdQuery = (tableName: string, id: number) => {
  return `DELETE FROM "${tableName}" WHERE id = ${id};`
}

export const getUpdateByIdQuery = (tableName: string, id: number, object: Object) => {
  return `UPDATE "${tableName}" (${Object.keys(object)
    .map(f => `"${f}"`)
    .join(',')}) VALUES(${Object.values(object)
    .map(f => `'${f}'`)
    .join(',')}) WHERE id = ${id};`
}

// 'UPDATE "public.fields" set ? WHERE id = ?', [updateField, id]

export const getInsertQuery = (tableName: string, object: Object) => {
  return `INSERT INTO "${tableName}" (${Object.keys(object)
    .map(f => `"${f}"`)
    .join(',')}) VALUES(${Object.values(object)
    .map(f => `'${f}'`)
    .join(',')});`
}
