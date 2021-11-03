import { IWrite } from '../interfaces/write.interface';
import { IRead } from '../interfaces/read.interface';
import { ExpressionHash, getDeleteByAndExpressions, getDeleteByIdQuery, getGetAllByExpressionAndQuery, getGetAllQuery, getGetByIdQuery, getInsertOneQuery, getUpdateByAndExpressionQuery, getUpdateByIdQuery } from '../../utils/sql-queries';
import { db } from '../../database';
import { ApiError } from '../../exceptions/api.error';
import { QueryResult } from 'pg';

export abstract class BaseRepository<T> implements IWrite<T>, IRead<T> {
  constructor(protected tableName: string) {}

  protected async query<TRes>(query: string) {
    return await db.query<TRes>(query)
  }

  async create(item: Omit<T, 'id'>): Promise<T> {
    const query = getInsertOneQuery<T>(this.tableName, item);

    console.log(query);

    const dbResult = await this.query<T>(query);
    return this.getOneRow(dbResult);
  }

  async updateById(id: number, item: Partial<Omit<T, 'id'>>): Promise<T> {
    const query = getUpdateByIdQuery<T>(this.tableName, id, item)

    console.log(query)

    const dbResult = await this.query<T>(query);
    return this.getOneRow(dbResult);
  }

  async update(newValues: Partial<Omit<T, 'id'>>, expressionHash: ExpressionHash<Omit<T, 'id'>>): Promise<T> {
    const query = getUpdateByAndExpressionQuery<T>(this.tableName, newValues, expressionHash)

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

  async deleteOne(expressionHash: ExpressionHash<T>): Promise<T> {
    const query = getDeleteByAndExpressions<T>(this.tableName, expressionHash);

    console.log(query)

    const dbResult = await this.query<T>(query);

    return this.getOneRow(dbResult);
  }

  async find(expressionHash: ExpressionHash<T>): Promise<T[]> {
    const query = getGetAllByExpressionAndQuery<T>(this.tableName, expressionHash);

    console.log(query);

    const dbResult = await this.query<T>(query);
    return this.getAllRows(dbResult);
  }

  async findOne(expressionHash: ExpressionHash<T>): Promise<T | null> {
    const query = getGetAllByExpressionAndQuery<T>(this.tableName, expressionHash);

    console.log(query);

    const dbResult = await this.query<T>(query);

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

  protected getAllRows(queryResult: QueryResult<T>): T[] {
    return queryResult.rows || [];
  }

  protected getOneRow(queryResult: QueryResult<T>): T {
    if (queryResult.rows.length > 1) {
      throw new ApiError(400, 'Ошибка бд');
    }

    if (queryResult.rows.length === 0 || !queryResult.rows[0]) {
      return null;
    }

    return queryResult.rows[0];
  }
}
