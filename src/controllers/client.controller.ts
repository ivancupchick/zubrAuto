import { Request, Response } from 'express'
import { connect } from '../database'
import {  CreateClientDB, RequestCreateClient, ResponseCLient } from '../entities/Client';
import { Database } from '../entities/Database';
import { Client, QueryResult } from 'pg';
import { getDeleteByIdQuery, getGetAllByOneColumnExpressionQuery, getGetAllQuery, getGetByIdQuery, getInsertOneQuery, getUpdateByIdQuery } from '../utils/sql-queries';
import { getFieldsWithValues } from '../utils/field.utils';
import { createFieldChain } from './field.controller';

// TODO: need test all methods

const TABLE_NAME = 'public.clients';

export async function getClients(req: Request, res: Response): Promise<Response | void> {
  let clients: ResponseCLient[] = [];
  let objectClients: Database.Client[] = [];
  let chaines: Database.FieldId[] = [];
  let chainedFields: Database.Field[] = [];

  try {
    const conn = await connect();
    conn.query<Database.Client>(getGetAllQuery(TABLE_NAME))
      .then(resClients => {
        objectClients = resClients.rows;

        clients = objectClients.map(oc => ({
          id: oc.id,
          carIds: oc.carIds,
          fields: []
        }));

        const query = getGetAllByOneColumnExpressionQuery('public.fieldsIds', { sourceId: objectClients.map(c => `${c.id}`) })

        console.log(query);
        return conn.query<Database.FieldId>(query)
      })
      .then(resFieldIds => {
        chaines = resFieldIds.rows;

        const query = getGetAllByOneColumnExpressionQuery('public.fields', { id: chaines.map((ch: Database.FieldId) => `${ch.fieldId}`) })

        console.log(query);

        return conn.query<Database.Field>(query)
      })
      .then(resFields => {
        chainedFields = resFields.rows;

        clients = clients.map(client => ({
          id: client.id,
          carIds: client.carIds,
          fields: getFieldsWithValues(chainedFields, chaines, client.id)
        }))

        console.log(clients);
        conn.end();
        return res.json(clients);
      })
      .catch(e => {
        res.json([]);
        conn.end();
      });
  }
  catch (e) {
    res.json(e)
  }
}

export async function createClient(req: Request<any, string, RequestCreateClient>, res: Response) {
  const newClient: RequestCreateClient = req.body;
  try {
    const conn = await connect();
    conn.query<Database.Client>(getInsertOneQuery<CreateClientDB>(TABLE_NAME, { carIds: newClient.carIds || '' }))
      .then(resultWithId => {
        console.log(resultWithId);

        return Promise.all(newClient.fields.map(f => createFieldChain(conn, resultWithId.rows[0].id, f.id, f.value)))
      })
      .then(result => {
        console.log(result);

        conn.end();
        res.json({
          message: 'New Client Created',
          result
        });
      })
      .catch(result => {
        console.log(result)

        conn.end();
        res.json({ result })
      })
  }
  catch (e) {
    console.log(e)
    res.json(e)
  }
}

// TODO: do assigning fields
export async function getClient(req: Request, res: Response) {
  const id = +req.params.clientId;
  const conn = await connect();
  const clients = await conn.query(getGetByIdQuery(TABLE_NAME, id));
  res.json(clients.rows[0]);
}

export async function deleteClient(req: Request, res: Response) {
  const id = +req.params.clientId;
  const conn = await connect();
  await conn.query(getDeleteByIdQuery(TABLE_NAME, id));
  res.json({
    message: 'Client deleted'
  });
  // res.json({
  //   message: 'Client does not deleted'
  // });
}

export async function updateClient(req: Request, res: Response) {
  const id = +req.params.clientId;
  const updateClient: RequestCreateClient = req.body;
  const conn = await connect();
  conn.query(getUpdateByIdQuery(TABLE_NAME, id, { carIds: updateClient.carIds }))

    .then(result => {
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
