import { Models } from "../../entities/Models";
import { ExpressionHash, getUpdateByAndExpressionQuery, getUpdateByIdQuery } from "../../utils/sql-queries";
import { BaseRepository } from "./base.repository";

class FileRepository extends BaseRepository<Models.File> {
  constructor() {
    super(Models.FILES_TABLE_NAME);
  }

  async updateById(id: number, item: Partial<Omit<Models.File, 'id'>>): Promise<Models.File> {
    const query = getUpdateByIdQuery(this.tableName, id, item, true)

    console.log(query)

    const dbResult = await this.query<Models.File>(query);
    return this.getOneRow(dbResult);
  }

  async update(newValues: Partial<Omit<Models.File, 'id'>>, expressionHash: ExpressionHash<Models.File>): Promise<Models.File> {
    const query = getUpdateByAndExpressionQuery(this.tableName, newValues, expressionHash, true)

    console.log(query)

    const dbResult = await this.query<Models.File>(query);
    return this.getOneRow(dbResult);
  }
}

export = new FileRepository();
