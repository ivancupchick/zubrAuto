import { Request, Response } from 'express'
import { connect } from '../database'
import { ServerClient } from '../entities/Client';
import { Database } from '../entities/Database';
import { getDeleteByIdQuery, getGetAllByExpressionAndQuery, getGetAllByOneColumnExpressionQuery, getGetAllQuery, getGetByIdQuery, getInsertOneQuery, getUpdateByIdQuery } from '../utils/sql-queries';
import { getFieldsWithValues } from '../utils/field.utils';
import { createFieldChain, updateFieldChain } from './field.controller';

const TABLE_NAME = Database.CLIENTS_TABLE_NAME;

export async function getClients(req: Request, res: Response): Promise<Response | void> {
  let clients: ServerClient.GetResponse[] = [];
  let objectClients: Database.Client[] = [];
  let chaines: Database.FieldChain[] = [];
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

        const query = getGetAllByExpressionAndQuery(
          Database.FIELD_CHAINS_TABLE_NAME, {
            sourceId: objectClients.map(c => `${c.id}`), 
            sourceName: [`'${Database.CLIENTS_TABLE_NAME}'`] 
          })

        console.log(query);
        return conn.query<Database.FieldChain>(query)
      })
      .then(resFieldIds => {
        console.log(resFieldIds.rows);
        chaines = resFieldIds.rows;

        const query = getGetAllByOneColumnExpressionQuery(Database.FIELDS_TABLE_NAME, { id: chaines.map((ch: Database.FieldChain) => `${ch.fieldId}`) })

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
        console.log(e);
        res.json([]);
        conn.end();
      });
  }
  catch (e) {
    res.json(e)
  }
}

export async function createClient(req: Request<any, string, ServerClient.CreateRequest>, res: Response) {
  const newClient: ServerClient.CreateRequest = req.body;
  try {
    const conn = await connect();
    conn.query<Database.Client>(getInsertOneQuery<ServerClient.BaseEntity>(TABLE_NAME, { carIds: newClient.carIds || '' }))
      .then(resultWithId => {
        console.log(resultWithId);

        return Promise.all(newClient.fields.map(f => createFieldChain(conn, resultWithId.rows[0].id, f.id, f.value, `${Database.CLIENTS_TABLE_NAME}`)))
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
