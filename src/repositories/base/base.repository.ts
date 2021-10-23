import { IWrite } from '../interfaces/IWrite';
import { IRead } from '../interfaces/IRead';
import { ExpressionHash, getDeleteByAndExpressions, getDeleteByIdQuery, getGetAllByExpressionAndQuery, getGetAllQuery, getGetByIdQuery, getInsertOneQuery, getUpdateByIdQuery } from '../../utils/sql-queries';
import { db } from '../../database';
import { ApiError } from '../../exceptions/api.error';
import { QueryResult } from 'pg';

export abstract class BaseRepository<T> implements IWrite<T>, IRead<T> {
  constructor(protected tableName: string) {}

  protected async query<TRes>(query: string) {
    return await db.query<TRes>(query)
  }

  async create(item: T): Promise<T> {
    const query = getInsertOneQuery<T>(this.tableName, item);

    console.log(query);

    const dbResult = await this.query<T>(query);
    return this.getOneRow(dbResult);
  }

  async updateById(id: number, item: T): Promise<T> {
    const query = getUpdateByIdQuery(this.tableName, id, item)

    console.log(query)

    const dbResult = await this.query<T>(query);
    return this.getOneRow(dbResult);
  }

  async deleteById(id: number): Promise<T> {
    const query = getDeleteByIdQuery(this.tableName, id);

    console.log(query)

    const dbResult = await this.query<T>(query);
    return this.getOneRow(dbResult);
  }

  async deleteOne(expressionHash: ExpressionHash): Promise<T> {
    const query = getDeleteByAndExpressions(this.tableName, expressionHash);

    console.log(query)

    const dbResult = await this.query<T>(query);

    return this.getOneRow(dbResult);
  }

  async find(expressionHash: ExpressionHash): Promise<T[]> {
    const query = getGetAllByExpressionAndQuery(this.tableName, expressionHash);

    console.log(query);

    const dbResult = await this.query<T>(query);
    return this.getAllRows(dbResult);
  }

  async findOne(expressionHash: ExpressionHash): Promise<T> {
    const query = getGetAllByExpressionAndQuery(this.tableName, expressionHash);

    console.log(query);

    const dbResult = await this.query<T>(query);
    
    if (dbResult.rows.length > 1) {
      throw new ApiError(400, 'Ошибка бд');
    }

    return this.getOneRow(dbResult);
  }

  async findById(id: number): Promise<T> {
    const query = getGetByIdQuery(this.tableName, id);

    console.log(query);

    const dbResult = await this.query<T>(query);

    return this.getOneRow(dbResult);
  }

  async getAll(): Promise<T[]> {
    const query = getGetAllQuery(this.tableName);

    console.log(query);

    const dbResult = await this.query<T>(query)
    return this.getAllRows(dbResult);
  }

  private getAllRows(queryResult: QueryResult<T>): T[] {
    return queryResult.rows;
  }

  private getOneRow(queryResult: QueryResult<T>): T {
    if (queryResult.rows.length > 1) {
      throw new ApiError(400, 'Ошибка бд');
    }

    return queryResult.rows[0];
  }
}