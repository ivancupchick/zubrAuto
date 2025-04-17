// import { OkPacket } from "mysql2";
// import { Models } from "../../entities/Models";
// import { ExpressionHash, getUpdateByAndExpressionQuery, getUpdateByIdQuery } from "../../utils/sql-queries";
// import { BaseRepository } from "./base.repository";

// class FileRepository extends BaseRepository<Models.File> {
//   constructor() {
//     super(Models.Table.Files);
//   }

//   async updateById(id: number, item: Partial<Omit<Models.File, 'id'>>): Promise<Models.File> {
//     const query = getUpdateByIdQuery(this.tableName, id, item, true)

//     console.log(query)

//     const dbResult = await this.query<OkPacket>(query);

//     return await this.findById(id);
//   }

//   async update(newValues: Partial<Omit<Models.File, 'id'>>, expressionHash: ExpressionHash<Models.File>): Promise<Models.File[]> {
//     const query = getUpdateByAndExpressionQuery(this.tableName, newValues, expressionHash, true)

//     console.log(query)

//     const dbResult = await this.query<OkPacket>(query);

//     return await this.find(expressionHash);
//   }
// }

// export = new FileRepository();
