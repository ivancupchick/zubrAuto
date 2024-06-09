import { IWrite } from '../interfaces/write.interface';
import { IRead } from '../interfaces/read.interface';
import { ExpressionHash, getDeleteByAndExpressions, getDeleteByIdQuery, getGetAllByExpressionAndQuery, getGetAllQuery, getGetByIdQuery, getGetSortedAllByExpressionAndQuery, getGetSortedAllQuery, getInsertOneQuery, getResultInsertOneQuery, getUpdateByAndExpressionQuery, getUpdateByIdQuery } from '../../utils/sql-queries';
import { ApiError } from '../../exceptions/api.error';
import { SSHConnection } from '../../mysql-connect';
import { OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2';

export abstract class BaseRepository<T> implements IWrite<T>, IRead<T> {
  constructor(protected tableName: string) {}

  protected async query<TRes extends (RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader)>(query: string): Promise<TRes> {
    // const start = new Date().getTime();
    const conn = await SSHConnection;

    return await (new Promise((resolve , reject) => {

      const c = conn.query(query, (err, res) => {
        if (err) {
          reject(err);
          return;
        }

        // const end = new Date().getTime();
        // console.log(`${query.slice(0, 80)}...: ${end - start}ms`);

        resolve(res as any);

      });
    }));
  }

  async create(item: Omit<T, 'id'>): Promise<T> {
    const query = getInsertOneQuery<T>(this.tableName, item);

    const dbResult = await this.query<OkPacket>(query);

    const id = dbResult.insertId;

    const query2 = getResultInsertOneQuery(this.tableName, id);

    const result = await this.query<RowDataPacket[]>(query2);

    return this.getOneRow(result);
  }

  async updateById(id: number, item: Partial<Omit<T, 'id'>>): Promise<T> {
    const query = getUpdateByIdQuery<T>(this.tableName, id, item)

    const dbResult = await this.query<OkPacket>(query);

    return await this.findById(id);
  }

  async update(newValues: Partial<Omit<T, 'id'>>, expressionHash: ExpressionHash<T>): Promise<T[]> {
    const query = getUpdateByAndExpressionQuery<T>(this.tableName, newValues, expressionHash)

    const dbResult = await this.query<OkPacket>(query);

    return await this.find(expressionHash);
  }

  async deleteById(id: number): Promise<T> {
    const result2 = await this.findById(id);

    const query = getDeleteByIdQuery(this.tableName, id);

    const dbResult = await this.query<OkPacket>(query);

    return result2;
  }

  async delete(expressionHash: ExpressionHash<T>): Promise<T[]> {
    const result2 = await this.find(expressionHash);

    const query = getDeleteByAndExpressions<T>(this.tableName, expressionHash);

    const dbResult = await this.query<OkPacket>(query);

    return result2;
  }

  async find(expressionHash: ExpressionHash<T>, sortField?: string, sortOrder?: string): Promise<T[]> {
    let query = getGetAllByExpressionAndQuery<T>(this.tableName, expressionHash);

    if (sortField && sortOrder) {
      query = getGetSortedAllByExpressionAndQuery<T>(this.tableName, expressionHash, sortField, sortOrder);
    }

    const dbResult = await this.query<RowDataPacket[]>(query);
    return this.getAllRows(dbResult);
  }

  async findOne(expressionHash: ExpressionHash<T>): Promise<T | null> {
    const query = getGetAllByExpressionAndQuery<T>(this.tableName, expressionHash);

    const dbResult = await this.query<RowDataPacket[]>(query);

    return this.getOneRow(dbResult);
  }

  async findById(id: number): Promise<T> {
    const query = getGetByIdQuery(this.tableName, id);

    const dbResult = await this.query<RowDataPacket[]>(query);

    return this.getOneRow(dbResult);
  }

  async getAll(sortField?: string, sortOrder?: string): Promise<T[]> {
    let query = getGetAllQuery(this.tableName);

    if (sortField && sortOrder) {
      query = getGetSortedAllQuery(this.tableName, sortField, sortOrder);
    }

    const dbResult = await this.query<RowDataPacket[]>(query)
    return this.getAllRows(dbResult);
  }

  protected getAllRows(rows: RowDataPacket[]): T[] {
    return rows as T[] || [];
  }

  protected getOneRow(rows: RowDataPacket[]): T {
    if (rows.length > 1) {
      // throw new ApiError(400, 'Ошибка бд'); // TODO restore after improoving code
    }

    if (rows.length === 0 || !rows[0]) {
      return null;
    }

    return (rows as T[])[0];
  }

  // pg
  // async getAll(): Promise<T[]> {
  //   const query = getGetAllQuery(this.tableName);

  //   console.log(query);

  //   const dbResult = await this.query<T>(query)
  //   return this.getAllRows(dbResult);
  // }

  // protected getAllRows(queryResult: QueryResult<T>): T[] {
  //   return queryResult.rows || [];
  // }

  // protected getOneRow(queryResult: QueryResult<T>): T {
  //   if (queryResult.rows.length > 1) {
  //     throw new ApiError(400, 'Ошибка бд');
  //   }

  //   if (queryResult.rows.length === 0 || !queryResult.rows[0]) {
  //     return null;
  //   }

  //   return queryResult.rows[0];
  // }
}
