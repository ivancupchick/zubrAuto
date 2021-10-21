import { Client } from "pg";
import { connect } from "../database";
import { getDeleteByIdQuery, getGetAllByExpressionAndQuery, getGetAllByOneColumnExpressionQuery, getGetAllQuery, getGetByIdQuery, getInsertOneQuery, getUpdateByAndExpressionQuery, getUpdateByIdQuery } from "../utils/sql-queries";
import { ServerClient } from "./Client";
import { Database } from "./Database";
import { FieldDomains, RealField, ServerField } from "./Field";

interface WithId {
  id: number;
}

interface WithFields {
  fields: RealField.Request[];
}

abstract class BaseConnection {
  // static async create(BASE_TABLE_NAME: string) {
  //   const pgClient = await connect();

  //   const connection = new BaseConnection(pgClient, BASE_TABLE_NAME);
  //   return connection;
  // }

  constructor(private pgClient: Client, protected BASE_TABLE_NAME: string, protected fieldDomain: FieldDomains) {}

  async end() {
    await this.pgClient.end()
  }

  protected async query<TRes>(query: string) {
    return await this.pgClient.query<TRes>(query)
  }

  protected async getEntity<TRes>(id: number) {
    const query = getGetByIdQuery(this.BASE_TABLE_NAME, id);

    console.log(query);

    const clients = await this.query<TRes>(query)
    return clients.rows[0];
  }

  protected async getAllEntities<TRes>() {
    const query = getGetAllQuery(this.BASE_TABLE_NAME);

    console.log(query);

    const clients = await this.query<TRes>(query)
    return clients.rows;
  }

  protected async getEntityChaines(sourceIds: number[]) {
    const query = getGetAllByExpressionAndQuery(
      Database.FIELD_CHAINS_TABLE_NAME, {
        sourceId: sourceIds.map(id => `${id}`),
        sourceName: [`'${this.BASE_TABLE_NAME}'`]
      }
    );

    console.log(query);

    const chaines = await this.query<Database.FieldChain>(query);
    return chaines.rows;
  }

  protected async getRelatedFields() {
    const query = getGetAllByOneColumnExpressionQuery(
      Database.FIELDS_TABLE_NAME, {
        domain: [`${this.fieldDomain}`]
      }
    );

    console.log(query);

    const fields = await this.query<Database.Field>(query);
    return fields.rows;
  }

  protected async createEntity<TEntity extends WithId, TBaseEntity>(baseEntity: TBaseEntity): Promise<number> {
    const query = getInsertOneQuery<TBaseEntity>(this.BASE_TABLE_NAME, baseEntity);

    console.log(query);

    const fields = await this.query<TEntity>(query);
    return fields.rows[0].id;
  }

  protected async createEntityChaines<TCreateRequest extends WithFields>(entity: TCreateRequest, fieldsConverter: (values: RealField.Request) => ServerField.DB.CreateChain) {
    const queries = entity.fields.map(f => getInsertOneQuery<ServerField.DB.CreateChain>(
      Database.FIELD_CHAINS_TABLE_NAME, fieldsConverter(f)
    ));
    console.log(queries)

    const promises = queries.map(q => this.query<any>(q));
    const result = await Promise.all(promises);
    return [...result.map(r => r.rows)];
  }

  protected async updateEntityWithFields<TCreateRequest extends WithFields, TBaseEntity>(
    entity: TCreateRequest,
    id: number,
    entityConverter: (entity: TCreateRequest) => TBaseEntity
  ) {
    const queries = [
      getUpdateByIdQuery(this.BASE_TABLE_NAME, id, entityConverter(entity)),
      ...entity.fields.map(f => getUpdateByAndExpressionQuery(
        Database.FIELD_CHAINS_TABLE_NAME, {
          value: f.value
        }, {
          fieldId: [f.id].map(c => `${c}`),
          sourceId: [id].map(c => `${c}`),
          sourceName: [`'${this.BASE_TABLE_NAME}'`]
        }
      ))
    ];
    console.log(queries)

    const promises = queries.map(q => this.query<any>(q));
    const result = await Promise.all(promises);
    return [...result.map(r => r.rows)];
  }

  protected async deleteEntityWithFields(id: number, chaines: Database.FieldChain[]) {
    const queries = [
      getDeleteByIdQuery(this.BASE_TABLE_NAME, id),
      ...chaines.map(ch => getDeleteByIdQuery(Database.FIELD_CHAINS_TABLE_NAME, ch.id))
    ];
    console.log(queries)

    const promises = queries.map(q => this.query(q));
    const result = await Promise.all(promises);
    return [...result.map(r => r.rows)];
  }
}

export class ClientConnection extends BaseConnection {
  static async create() {
    const pgClient = await connect();

    const connection = new ClientConnection(pgClient);
    return connection;
  }

  constructor(pgClient: Client) {
    super(pgClient, Database.CLIENTS_TABLE_NAME, FieldDomains.Client);
  }

  async getClient(id: number) {
    return super.getEntity<Database.Client>(id);
  }

  async getAllClients() {
    return super.getAllEntities<Database.Client>()
  }

  async getClientChaines(sourceIds: number[]) {
    return super.getEntityChaines(sourceIds);
  }

  async getRelatedFields() {
    return super.getRelatedFields();
  }

  async createClient(newClient: ServerClient.CreateRequest): Promise<number> {
    return super.createEntity<Database.Client, ServerClient.BaseEntity>({ carIds: newClient.carIds || '' })
  }

  async createClientChaines(newClient: ServerClient.CreateRequest, id: number) {
    return super.createEntityChaines<ServerClient.CreateRequest>(
      newClient, (v => ({
        sourceId: id,
        fieldId: v.id,
        value: v.value,
        sourceName: `${this.BASE_TABLE_NAME}`
      })
    ));
  }

  async updateClient(updatedClient: ServerClient.CreateRequest, id: number) {
    return super.updateEntityWithFields<ServerClient.CreateRequest, ServerClient.BaseEntity>(updatedClient, id, () => ({ carIds: updatedClient.carIds }));
  }

  async deleteClient(id: number, chaines: Database.FieldChain[]) {
    return super.deleteEntityWithFields(id, chaines);
  }
}
