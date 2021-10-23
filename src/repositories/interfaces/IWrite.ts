import { ExpressionHash } from "../../utils/sql-queries";

export interface IWrite<T> {
  create(item: T): Promise<T>;
  updateById(id: number, item: T): Promise<T>;
  deleteById(id: number): Promise<T>;
  deleteOne(expressionHash: ExpressionHash): Promise<T>;
}
