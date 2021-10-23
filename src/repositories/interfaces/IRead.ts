import { ExpressionHash } from "../../utils/sql-queries";

export interface IRead<T> {
  getAll(): Promise<T[]>;
  find(expressionHash: ExpressionHash): Promise<T[]>;
  findOne(expressionHash: ExpressionHash): Promise<T>;
  findById(id: number): Promise<T>;
}
