import { Client } from "pg";
import { connect } from "../database";
import { getDeleteByIdQuery, getGetAllByExpressionAndQuery, getGetAllByOneColumnExpressionQuery, getGetAllQuery, getGetByIdQuery, getInsertOneQuery, getUpdateByAndExpressionQuery, getUpdateByIdQuery } from "../utils/sql-queries";
import { ServerClient } from "./Client";
import { Database } from "./Database";
import { ServerField } from "./Field";

export class ClientConnection {
  private pgClient: Client;
  private TABLE_NAME: string;

  static async connect() {
    const pgClient = await connect();

    const connection = new ClientConnection(pgClient);
    return connection;
  }

  async end() {
    await this.pgClient.end()
  }

  async query<TRes>(query: string) {
    return await this.pgClient.query<TRes>(query)
  }

  constructor(pgClient: Client) {
    this.pgClient = pgClient;
    this.TABLE_NAME = Database.CLIENTS_TABLE_NAME;
  }

  async getClient(id: number) {
    const query = getGetByIdQuery(this.TABLE_NAME, id);

    console.log(query);

    const clients = await this.query<Database.Client>(query)
    return clients.rows[0];
  }

  async getAllClients() {
    const query = getGetAllQuery(this.TABLE_NAME);

    console.log(query);

    const clients = await this.query<Database.Client>(query)
    return clients.rows;
  }

  async getClientChaines(ids: number[]) {
    const query = getGetAllByExpressionAndQuery(
      Database.FIELD_CHAINS_TABLE_NAME, {
        sourceId: ids.map(id => `${id}`),
        sourceName: [`'${Database.CLIENTS_TABLE_NAME}'`]
      }
    );

    console.log(query);

    const chaines = await this.query<Database.FieldChain>(query);
    return chaines.rows;
  }

  async getRelatedFields(chaines: Database.FieldChain[]) {
    // TODO replace input chaines to exprassion by domain
    const query = getGetAllByOneColumnExpressionQuery(
      Database.FIELDS_TABLE_NAME, {
        id: chaines.map((ch: Database.FieldChain) => `${ch.fieldId}`)
      }
    );

    console.log(query);

    const fields = await this.query<Database.Field>(query);
    return fields.rows;
  }

  async createClient(newClient: ServerClient.CreateRequest): Promise<number> {
    const query = getInsertOneQuery<ServerClient.BaseEntity>(this.TABLE_NAME, { carIds: newClient.carIds || '' });

    console.log(query);

    const fields = await this.query<Database.Client>(query);
    return fields.rows[0].id;
  }

  async createClientChaines(newClient: ServerClient.CreateRequest, id: number) {
    const queries = newClient.fields.map(f => getInsertOneQuery<ServerField.DB.CreateChain>(
      Database.FIELDS_TABLE_NAME, {
        sourceId: id,
        fieldId: f.id,
        value: f.value,
        sourceName: `${Database.CLIENTS_TABLE_NAME}`
      }
    ));
    console.log(queries)

    const promises = queries.map(q => this.query(q));
    const result = await Promise.all(promises);
    return result;
  }

  async updateClient(updateClient: ServerClient.CreateRequest, id: number) {
    const queries = [
      getUpdateByIdQuery(this.TABLE_NAME, id, { carIds: updateClient.carIds }),
      ...updateClient.fields.map(f => getUpdateByAndExpressionQuery(
        Database.FIELDS_TABLE_NAME, {
          value: f.value
        }, {
          fieldId: [f.id].map(c => `${c}`),
          sourceId: [id].map(c => `${c}`),
          sourceName: [`${Database.CLIENTS_TABLE_NAME}`]
        }
      ))
    ];
    console.log(queries)

    const promises = queries.map(q => this.query(q));
    const result = await Promise.all(promises);
    return result;
  }

  async deleteClient(id: number, chaines: Database.FieldChain[]) {
    const queries = [
      getDeleteByIdQuery(this.TABLE_NAME, id),
      ...chaines.map(ch => getDeleteByIdQuery(Database.FIELD_CHAINS_TABLE_NAME, ch.id))
    ];
    console.log(queries)

    const promises = queries.map(q => this.query(q));
    const result = await Promise.all(promises);
    return result;
  }
}
