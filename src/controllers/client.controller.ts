import { Request, Response } from 'express'
import { connect } from '../database'
import { ServerClient } from '../entities/Client';
import { Database } from '../entities/Database';
import { getDeleteByIdQuery, getGetAllByExpressionAndQuery, getGetAllByOneColumnExpressionQuery, getGetAllQuery, getGetByIdQuery, getInsertOneQuery, getUpdateByIdQuery } from '../utils/sql-queries';
import { getFieldsWithValues } from '../utils/field.utils';
import { createFieldChain, updateFieldChain } from './field.controller';
import { Client } from 'pg';
import { ServerField } from '../entities/Field';

const TABLE_NAME = Database.CLIENTS_TABLE_NAME;

// TODO use this, or refactor request
// type ZAResponce<T> = Response<{
//   error?: any,
//   result: T
// }>;

class ClientHelper {
  private conn: Client;

  async connect(): Promise<void> {
    this.conn = await connect()
  }

  async endConnect() {
    if (!!this.conn) {
      this.conn.end();
    }
  }

  async getAllClients() {
    const query = getGetAllQuery(TABLE_NAME);

    console.log(query);

    const clients = await this.conn.query<Database.Client>(query)
    return clients.rows;
  }

  async getClientChaines(clients: Database.Client[]) {
    const query = getGetAllByExpressionAndQuery(
      Database.FIELD_CHAINS_TABLE_NAME, {
        sourceId: clients.map(c => `${c.id}`),
        sourceName: [`'${Database.CLIENTS_TABLE_NAME}'`]
      }
    );

    console.log(query);

    const chaines = await this.conn.query<Database.FieldChain>(query);
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

    const fields = await this.conn.query<Database.Field>(query);
    return fields.rows;
  }

  async createClient(newClient: ServerClient.CreateRequest): Promise<number> {
    const query = getInsertOneQuery<ServerClient.BaseEntity>(TABLE_NAME, { carIds: newClient.carIds || '' });

    console.log(query);

    const fields = await this.conn.query<Database.Client>(query);
    return fields.rows[0].id;
  }

  async createClientChaines(newClient: ServerClient.CreateRequest, id: number) {
    const queries = newClient.fields.map(f => getInsertOneQuery<ServerField.DB.CreateChain>('public.fieldIds', { sourceId: id, fieldId: f.id, value: f.value, sourceName: `${Database.CLIENTS_TABLE_NAME}`}))
    // const queries = newClient.fields.map(f => createFieldChain(this.conn, id, f.id, f.value, `${Database.CLIENTS_TABLE_NAME}`))
    console.log(queries)

    const promises = queries.map(q => this.conn.query(q));
    const result = await Promise.all(promises);
    return result;
  }
}

export async function getClients(req: Request, res: Response): Promise<Response | void> {
  const clientHelper = new ClientHelper();

  try {
    await clientHelper.connect();

    const clients = await clientHelper.getAllClients();
    const chaines = await clientHelper.getClientChaines(clients);
    const fields = await clientHelper.getRelatedFields(chaines);

    const result: ServerClient.GetResponse[] = clients.map(client => ({
      id: client.id,
      carIds: client.carIds,
      fields: getFieldsWithValues(fields, chaines, client.id)
    }))

    await clientHelper.endConnect();

    res.json(result);
  }
  catch (e) {
    await clientHelper.endConnect();

    console.log(e);
    res.json([])
  }
}

export async function createClient(req: Request<any, string, ServerClient.CreateRequest>, res: Response) {
  const newClient: ServerClient.CreateRequest = req.body;

  const clientHelper = new ClientHelper();

  try {
    await clientHelper.connect();

    const id = await clientHelper.createClient(newClient);
    const result = await clientHelper.createClientChaines(newClient, id);

    await clientHelper.endConnect();

    res.json({  // TODO! refactor
      message: 'New Client Created',
      result
    });
  }
  catch (e) {
    await clientHelper.endConnect();

    console.log(e);
    res.json({  // TODO! refactor
      message: 'New Client Not Created',
      error: e
    });
  }
}

export async function updateClient(req: Request, res: Response) {
  const id = +req.params.clientId;
  const updateClient: ServerClient.CreateRequest = req.body;
  const conn = await connect();
  Promise.all([
    conn.query(getUpdateByIdQuery(TABLE_NAME, id, { carIds: updateClient.carIds })),
    updateClient.fields.map(f => updateFieldChain(conn, id, f.id, f.value, `${Database.CLIENTS_TABLE_NAME}`))
  ])
    .then(result => {
      console.log(result)
      res.json({
        message: 'Client Updated',
        result
      });
    })
    .catch(e => {
      res.json({
        message: 'Client not Updated',
        error: e
      });
    });


  // res.json({
  //   message: 'Client does not updated'
  // });
}

export async function deleteClient(req: Request, res: Response) {
  const id = +req.params.clientId;
  const conn = await connect();

  let chaines: Database.FieldChain[] = [];

  const getChainesQuery = getGetAllByExpressionAndQuery(
    Database.FIELD_CHAINS_TABLE_NAME, {
      sourceId: [`${id}`],
      sourceName: [`'${Database.CLIENTS_TABLE_NAME}'`]
    })

  console.log(getChainesQuery);
  conn.query<Database.FieldChain>(getChainesQuery)
    .then(fieldIdsRes => {
      chaines = fieldIdsRes.rows;

      const queries = [
        conn.query(getDeleteByIdQuery(TABLE_NAME, id)),
        ...chaines.map(ch =>
          conn.query(getDeleteByIdQuery(Database.FIELD_CHAINS_TABLE_NAME, ch.id))
        )
      ];

      return Promise.all(queries);
    })
    .then(result => {
      console.log(result)
      res.json({
        message: 'Client Deleted',
        result
      });
    })
    .catch(e => {
      res.json({
        message: 'Client not Deleted',
        error: e
      });
    });

  // res.json({
  //   message: 'Client does not deleted'
  // });
}

// TODO: do assigning fields
export async function getClient(req: Request, res: Response) {
  const id = +req.params.clientId;
  const conn = await connect();
  const clients = await conn.query(getGetByIdQuery(TABLE_NAME, id));
  res.json(clients.rows[0]);
}
