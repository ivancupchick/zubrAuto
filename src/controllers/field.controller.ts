import { Request, Response } from 'express'
import { ServerField, FieldDomains } from '../entities/Field';
import { Models } from '../entities/Models';
import { Client } from 'pg';
import { getDeleteByIdQuery, getGetAllByOneColumnExpressionQuery, getGetAllQuery, getGetByIdQuery, getInsertOneQuery, getUpdateByAndExpressionQuery, getUpdateByIdQuery } from '../utils/sql-queries';
import { db } from '../database';

// TODO: replace all sql queries to separate file or place(constants in top of this file)
// TODO: owner feature (maybe never)

export const TABLE_NAME = Models.FIELDS_TABLE_NAME;

export async function getFields(req: Request, res: Response): Promise<Response | void> {
  let fields: ServerField.Entity[] = [];
  let objectFields: Models.Field[] = [];

  let client: Client;

  try {
    Promise.resolve()
      .then(() => {
        return db.query<Models.Field>(getGetAllQuery(TABLE_NAME))
      })
      .then(resFields => {
        objectFields = resFields.rows;

        fields = [...objectFields];

        res.json(fields);
        client.end();
      })
      .catch(e => {
        res.json(e);
        client.end();
      });
  }
  catch (e) {
    res.json(e)
  }
}

export async function getFieldsByDomain(req: Request, res: Response): Promise<Response | void> {
  const domain: FieldDomains = +req.params.domain;

  let fields: ServerField.Entity[] = [];
  let objectFields: Models.Field[] = [];

  let client: Client;

  try {
    Promise.resolve()
      .then(conn => {
        const query = getGetAllByOneColumnExpressionQuery(TABLE_NAME, { domain: [`${domain}`]})

        return db.query(query)
      })
      .then(resFields => {
        objectFields = resFields.rows;

        fields = [...objectFields];

        res.json(fields);
        client.end();
      })
      .catch(e => {
        res.json(e);
        client.end();
      });
  }
  catch (e) {
    res.json(e)
  }
}

export async function createField(req: Request<any, string, ServerField.BaseEntity>, res: Response) {
  const newField: ServerField.BaseEntity = req.body;
  try {
    db.query( getInsertOneQuery(TABLE_NAME, newField) )
      .then(result => {
        console.log(result);
        res.json({
          message: 'New Field Created',
          result
        });
      })
      .catch(result => {
        console.log(result)
        res.json({result})
      })
  }
  catch (e) {
    console.log(e)
    res.json(e)
  }
}

export async function getField(req: Request, res: Response) {
  const id = +req.params.fieldId;
  const fields = await db.query(getGetByIdQuery(TABLE_NAME, id));
  res.json(fields.rows[0]);
}

export async function deleteField(req: Request, res: Response) {
  const id = +req.params.fieldId;
  db.query(getDeleteByIdQuery(TABLE_NAME, id))
    .then(result => {
      res.json({
        message: 'Field deleted',
        result
      });
    })
    .catch(e => {
      res.json({
        message: 'Field does not deleted',
        error: e
      });
    });
}

export async function updateField(req: Request, res: Response) {
  const id = +req.params.fieldId;
  const updateField: any = req.body;
  db.query(getUpdateByIdQuery(TABLE_NAME, id, updateField, true))
    .then(result => {
      res.json({
        message: 'Field Updated',
        result
      });
    })
    .catch(e => {
      res.json({
        message: 'Field does not Updated',
        error: e
      });
    });
}

export async function createFieldChain(sourceId: number, fieldId: number, value: string, sourceName: string) {
  return db.query(getInsertOneQuery<ServerField.DB.CreateChain>('public.fieldIds', { sourceId, fieldId, value, sourceName}) )
}

export async function updateFieldChain(sourceId: number, fieldId: number, value: string, sourceName: string) {
  const query = getUpdateByAndExpressionQuery(
    'public.fieldIds',
    {
      value
    },
    {
      fieldId: [fieldId].map(c => `${c}`),
      sourceId: [sourceId].map(c => `${c}`),
      sourceName: [`'${sourceName}'`]
    }
  );

  console.log(query);
  return db.query(query);
}

// export async function deleteFieldChain(conn: Client, sourceId: number, fieldId: number, sourceName: string) {
//   const query = getDeleteByAndExpressionQuery(
//     'public.fieldIds',
//     {
//       fieldId: [fieldId].map(c => `${c}`),
//       sourceId: [sourceId].map(c => `${c}`),
//       sourceName: [`'${sourceName}'`]
//     }
//   );

//   console.log(query);
//   return conn.query(query);
// }
