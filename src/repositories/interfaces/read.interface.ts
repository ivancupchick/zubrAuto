import { ExpressionHash } from "../../utils/sql-queries";

export interface IRead<T> {
  getAll(): Promise<T[]>;
  find(expressionHash: ExpressionHash<T>): Promise<T[]>;
  findOne(expressionHash: ExpressionHash<T>): Promise<T | null>;
  findById(id: number): Promise<T>;
}
