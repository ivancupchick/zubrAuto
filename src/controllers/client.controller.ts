import { Request, Response } from 'express'
import { connect } from '../database'
import { ServerClient } from '../entities/Client';
import { Database } from '../entities/Database';
import { getDeleteByIdQuery, getGetAllByExpressionAndQuery, getGetAllByOneColumnExpressionQuery, getGetAllQuery, getGetByIdQuery, getInsertOneQuery, getUpdateByAndExpressionQuery, getUpdateByIdQuery } from '../utils/sql-queries';
import { getFieldsWithValues } from '../utils/field.utils';
import { ClientConnection } from '../entities/DBConnections';

const TABLE_NAME = Database.CLIENTS_TABLE_NAME;

// TODO use this, or refactor request
// type ZAResponce<T> = Response<{
//   error?: any,
//   result: T
// }>;

export async function getClients(req: Request, res: Response): Promise<Response | void> {
  const dbConnection = await ClientConnection.connect();

  try {
    const clients = await dbConnection.getAllClients();
    const chaines = await dbConnection.getClientChaines(clients.map(c => c.id));
    const fields = await dbConnection.getRelatedFields(chaines);

    const result: ServerClient.GetResponse[] = clients.map(client => ({
      id: client.id,
      carIds: client.carIds,
      fields: getFieldsWithValues(fields, chaines, client.id)
    }))

    await dbConnection.end();

    res.json(result);
  }
  catch (e) {
    await dbConnection.end();

    console.log(e);
    res.json([])
  }
}

export async function createClient(req: Request<any, string, ServerClient.CreateRequest>, res: Response) {
  const newClient: ServerClient.CreateRequest = req.body;

  const dbConnection = await ClientConnection.connect();

  try {
    const id = await dbConnection.createClient(newClient);
    const result = await dbConnection.createClientChaines(newClient, id);

    await dbConnection.end();

    res.json({  // TODO! refactor
      message: 'Client Created',
      result
    });
  }
  catch (e) {
    await dbConnection.end();

    console.log(e);
    res.json({  // TODO! refactor
      message: 'Client does not Created',
      error: e
    });
  }
}

export async function updateClient(req: Request, res: Response) {
  const id = +req.params.clientId;
  const updateClient: ServerClient.CreateRequest = req.body;

  const dbConnection = await ClientConnection.connect();

  try {
    const result = await dbConnection.updateClient(updateClient, id);

    await dbConnection.end();

    res.json({
      message: 'Client Updated',
      result
    });
  }
  catch (e) {
    await dbConnection.end();

    console.log(e);
    res.json({
      message: 'Client does not Updated',
      error: e
    });
  }

}

export async function deleteClient(req: Request, res: Response) {
  const id = +req.params.clientId;

  const dbConnection = await ClientConnection.connect();

  try {
    const chaines = await dbConnection.getClientChaines([id]);
    const result = await dbConnection.deleteClient(id, chaines);

    await dbConnection.end();

    res.json({
      message: 'Client Deleted',
      result
    });
  }
  catch (e) {
    await dbConnection.end();

    console.log(e);
    res.json({
      message: 'Client does not Deleted',
      error: e
    });
  }
}

// TODO: do assigning fields
export async function getClient(req: Request, res: Response) {
  const id = +req.params.clientId;

  const dbConnection = await ClientConnection.connect();

  try {
    const client = await dbConnection.getClient(id);

    await dbConnection.end();

    res.json([client]);
  }
  catch (e) {
    await dbConnection.end();

    console.log(e);
    res.json([])
  }
}
