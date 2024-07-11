import { RowDataPacket } from "mysql2";
import { Models } from "../../entities/Models";
import { ExpressionHash, getGetAllByExpressionAndQuery, getGetSortedAllByExpressionAndQuery } from "../../utils/sql-queries";
import { BaseRepository } from "./base.repository";

const getGetAllByExpressionAndQueryWithValue = <T>(tableName: string, expressions: ExpressionHash<T>, value: string[]) => {
  return `SELECT * FROM \`${tableName}\` WHERE (${
    Object.keys(expressions).map(key => `${key} IN (${expressions[key].map(e => `'${e}'`).join(',')})`).join(' AND ')
  }) AND value IN (${value.map(e => `'${e}'`).join(',')});`
}

const getGetSortedAllByExpressionAndQueryWithValue = <T>(tableName: string, expressions: ExpressionHash<T>, value: string[], sortField: string, sortOrder: string) => {
  return `SELECT * FROM \`${tableName}\` WHERE (${
    Object.keys(expressions).map(key => `${key} IN (${expressions[key].map(e => `'${e}'`).join(',')})`).join(' AND ')
  }) AND value IN (${value.map(e => `'${e}'`).join(',')}) ORDER BY ${sortField} ${sortOrder};`
}

class FieldChainRepository extends BaseRepository<Models.FieldChain> {
  constructor() {
    super(Models.Table.FieldChains);
  }

  async findWithValue(expressionHash: ExpressionHash<Models.FieldChain>, value: string[], sortField?: string, sortOrder?: string): Promise<Models.FieldChain[]> {
    let query = getGetAllByExpressionAndQueryWithValue<Models.FieldChain>(this.tableName, expressionHash, value);

    if (sortField && sortOrder) {
      query = getGetSortedAllByExpressionAndQueryWithValue<Models.FieldChain>(this.tableName, expressionHash, value, sortField, sortOrder);
    }

    const dbResult = await this.query<RowDataPacket[]>(query);
    return this.getAllRows(dbResult);
  }
}

export = new FieldChainRepository();
