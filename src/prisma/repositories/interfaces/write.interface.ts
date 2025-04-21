import { ExpressionHash } from 'src/core/utils/sql-queries';

export interface IWrite<T> {
  create(item: T): Promise<T>;
  updateById(id: number, item: Partial<T>): Promise<T>;
  deleteById(id: number): Promise<T>;
  delete(expressionHash: ExpressionHash<T>): Promise<T[]>;
}
