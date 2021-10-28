import { Models } from "../../entities/Models";
import { ExpressionHash, getUpdateByAndExpressionQuery, getUpdateByIdQuery, StringHash } from "../../utils/sql-queries";
import { BaseRepository } from "./base.repository";

class FieldRepository extends BaseRepository<Models.Field> {
  constructor() {
    super(Models.FIELDS_TABLE_NAME);
  }

  async updateById(id: number, item: Models.Field): Promise<Models.Field> {
    const query = getUpdateByIdQuery(this.tableName, id, item, true)

    console.log(query)

    const dbResult = await this.query<Models.Field>(query);
    return this.getOneRow(dbResult);
  }

  async update(newValues: StringHash, expressionHash: ExpressionHash): Promise<Models.Field> {
    const query = getUpdateByAndExpressionQuery(this.tableName, newValues, expressionHash, true)

    console.log(query)

    const dbResult = await this.query<Models.Field>(query);
    return this.getOneRow(dbResult);
  }
}

export = new FieldRepository();
