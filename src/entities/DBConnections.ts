import { db } from "../database";
import { getDeleteByIdQuery, getGetAllByExpressionAndQuery, getGetAllByOneColumnExpressionQuery, getGetAllQuery, getGetByIdQuery, getInsertOneQuery, getUpdateByAndExpressionQuery, getUpdateByIdQuery } from "../utils/sql-queries";
import { ServerCarOwner, ServerCar } from "./Car";
import { ServerClient } from "./Client";
import { Models } from "./Models";
import { FieldDomains, RealField, ServerField } from "./Field";

interface WithId {
  id: number;
}

interface WithFields {
  fields: RealField.Request[];
}

abstract class BaseConnection {
  constructor(protected BASE_TABLE_NAME: string, protected fieldDomain: FieldDomains) {}

  protected async query<TRes>(query: string) {
    
    return await db.query<TRes>(query)
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
      Models.FIELD_CHAINS_TABLE_NAME, {
        sourceId: sourceIds.map(id => `${id}`),
        sourceName: [`'${this.BASE_TABLE_NAME}'`]
      }
    );

    console.log(query);

    const chaines = await this.query<Models.FieldChain>(query);
    return chaines.rows;
  }

  protected async getRelatedFields() {
    const query = getGetAllByOneColumnExpressionQuery(
      Models.FIELDS_TABLE_NAME, {
        domain: [`${this.fieldDomain}`]
      }
    );

    console.log(query);

    const fields = await this.query<Models.Field>(query);
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
      Models.FIELD_CHAINS_TABLE_NAME, fieldsConverter(f)
    ));
    console.log(queries)

    const promises = queries.map(q => this.query<any>(q));
    const result = await Promise.all(promises);
    return [...result.map(r => r.rows)];
  }

  protected async updateEntityWithFields<TCreateRequest extends WithFields, TBaseEntity>(
    entity: TCreateRequest,
    id: number,
    baseEntity: TBaseEntity
  ) {
    const queries = [
      getUpdateByIdQuery(this.BASE_TABLE_NAME, id, baseEntity),
      ...entity.fields.map(f => getUpdateByAndExpressionQuery(
        Models.FIELD_CHAINS_TABLE_NAME, {
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

  protected async deleteEntityWithFields(id: number, chaines: Models.FieldChain[]) {
    const queries = [
      getDeleteByIdQuery(this.BASE_TABLE_NAME, id),
      ...chaines.map(ch => getDeleteByIdQuery(Models.FIELD_CHAINS_TABLE_NAME, ch.id))
    ];
    console.log(queries)

    const promises = queries.map(q => this.query(q));
    const result = await Promise.all(promises);
    return [...result.map(r => r.rows)];
  }
}

export class ClientConnection extends BaseConnection {
  constructor() {
    super(Models.CLIENTS_TABLE_NAME, FieldDomains.Client);
  }

  async getClient(id: number) {
    return super.getEntity<Models.Client>(id);
  }

  async getAllClients() {
    return super.getAllEntities<Models.Client>()
  }

  async getClientChaines(sourceIds: number[]) {
    return super.getEntityChaines(sourceIds);
  }

  async getRelatedFields() {
    return super.getRelatedFields();
  }

  async createClient(newClient: ServerClient.CreateRequest): Promise<number> {
    return super.createEntity<Models.Client, ServerClient.BaseEntity>({ carIds: newClient.carIds || '' })
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
    return super.updateEntityWithFields<ServerClient.CreateRequest, ServerClient.BaseEntity>(updatedClient, id, { carIds: updatedClient.carIds });
  }

  async deleteClient(id: number, chaines: Models.FieldChain[]) {
    return super.deleteEntityWithFields(id, chaines);
  }
}

export class CarOwnerConnection extends BaseConnection {
  constructor() {
    super(Models.CAR_OWNERS_TABLE_NAME, FieldDomains.CarOwner);
  }

  async getCarOwner(id: number) {
    return super.getEntity<Models.CarOwner>(id);
  }

  async getCarOwnerByNumber(number: string): Promise<Models.CarOwner | null> {
    if (!number) {
      return null;
    }

    const query = getGetAllByOneColumnExpressionQuery(this.BASE_TABLE_NAME, { number: [`${number}`]})

    console.log(query);

    const clients = await this.query<Models.CarOwner>(query)
    const result = clients.rows[0];
    return result || null;
  }

  async getAllCarOwners() {
    return super.getAllEntities<Models.CarOwner>()
  }

  async getCarOwnerChaines(sourceIds: number[]) {
    return super.getEntityChaines(sourceIds);
  }

  async getRelatedFields() {
    return super.getRelatedFields();
  }

  async createCarOwner(newCarOwner: ServerCarOwner.CreateRequest): Promise<number> {
    return super.createEntity<Models.CarOwner, ServerCarOwner.BaseEntity>({ number: newCarOwner.number || '' })
  }

  async createCarOwnerChaines(newCarOwner: ServerCarOwner.CreateRequest, id: number) {
    return super.createEntityChaines<ServerCarOwner.CreateRequest>(
      newCarOwner, (v => ({
        sourceId: id,
        fieldId: v.id,
        value: v.value,
        sourceName: `${this.BASE_TABLE_NAME}`
      })
    ));
  }

  async updateCarOwner(updatedCarOwner: ServerCarOwner.CreateRequest, id: number) {
    return super.updateEntityWithFields<ServerCarOwner.CreateRequest, ServerCarOwner.BaseEntity>(updatedCarOwner, id, { number: updatedCarOwner.number });
  }

  async deleteCarOwner(id: number, chaines: Models.FieldChain[]) {
    return super.deleteEntityWithFields(id, chaines);
  }
}

export class CarConnection extends BaseConnection {
  constructor() {
    super(Models.CARS_TABLE_NAME, FieldDomains.Car);
  }

  async getCar(id: number) {
    return super.getEntity<Models.Car>(id);
  }

  async getAllCars() {
    return super.getAllEntities<Models.Car>()
  }

  async getCarChaines(sourceIds: number[]) {
    return super.getEntityChaines(sourceIds);
  }

  async getRelatedFields() {
    return super.getRelatedFields();
  }

  async createCar(newCar: ServerCar.UpdateRequest): Promise<number> {
    return super.createEntity<Models.Car, (ServerCar.BaseEntity & ServerCar.WithOwnerId)>({ createdDate: newCar.createdDate || '', ownerId: newCar.ownerId })
  }

  async createCarChaines(newCar: ServerCar.UpdateRequest, id: number) {
    return super.createEntityChaines<ServerCar.UpdateRequest>(
      newCar, (v => ({
        sourceId: id,
        fieldId: v.id,
        value: v.value,
        sourceName: `${this.BASE_TABLE_NAME}`
      })
    ));
  }

  async updateCar(updatedCar: ServerCar.UpdateRequest, id: number) { // TODO! remove () => ({ createdDate: updatedCar.createdDate || '', ownerId: updatedCar.ownerId }))
    return super.updateEntityWithFields<ServerCar.UpdateRequest, (ServerCar.BaseEntity & ServerCar.WithOwnerId)>(updatedCar, id, { createdDate: updatedCar.createdDate || '', ownerId: updatedCar.ownerId });
  }

  async deleteCar(id: number, chaines: Models.FieldChain[]) {
    return super.deleteEntityWithFields(id, chaines);
  }
}
