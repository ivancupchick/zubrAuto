// import { OkPacket } from "mysql2";
// import { Models } from "../../entities/Models";
// import { ExpressionHash, getUpdateByAndExpressionQuery, getUpdateByIdQuery } from "../../utils/sql-queries";
// import { BaseRepository } from "./base.repository";

// class FieldRepository extends BaseRepository<Models.Field> {
//   constructor() {
//     super(Models.Table.Fields);
//   }

//   async updateById(id: number, item: Partial<Omit<Models.Field, 'id'>>): Promise<Models.Field> {
//     const query = getUpdateByIdQuery(this.tableName, id, item, true)

//     console.log(query)

//     const dbResult = await this.query<OkPacket>(query);

//     return this.findById(id);
//   }

//   async update(newValues: Partial<Omit<Models.Field, 'id'>>, expressionHash: ExpressionHash<Models.Field>): Promise<Models.Field[]> {
//     const query = getUpdateByAndExpressionQuery(this.tableName, newValues, expressionHash, true)

//     console.log(query)

//     const dbResult = await this.query<OkPacket>(query);

//     return this.find(expressionHash);
//   }
// }

// export = new FieldRepository();
