import { Request, Response } from 'express'
import { connect } from '../database'
import { CreateFieldRequest, IField } from '../interface/Field';
import { Database } from '../interface/Database';
import { Client } from 'pg';
import { getDeleteByIdQuery, getGetAllQuery, getGetByIdQuery, getInsertQuery, getUpdateByIdQuery } from '../utils/sql-queries';

// TODO: replace all sql queries to separate file or place(constants in top of this file)
// TODO: owner feature (maybe never)

const TABLE_NAME = 'public.fields';

export async function getFields(req: Request, res: Response): Promise<Response | void> {
  let fields: IField[] = [];
  let objectFields: Database.Field[] = [];

  let client: Client;

  try {
    connect()
      .then(conn => {
        client = conn;
        return conn.query(getGetAllQuery(TABLE_NAME))
      })
      .then(resFields => {
        objectFields = resFields.rows;

        fields = [...objectFields];

        res.json(fields);
      })
      .catch(e => {
        res.json(e);
      })
      .finally(() => {
        client.end();
      });
  }
  catch (e) {
    res.json(e)
  }
}

export async function createField(req: Request<any, string, CreateFieldRequest>, res: Response) {
  const newField: CreateFieldRequest = req.body;
  try {
    const conn = await connect();
    conn.query( getInsertQuery(TABLE_NAME, newField) )
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
  const conn = await connect();
  const fields = await conn.query(getGetByIdQuery(TABLE_NAME, id));
  res.json(fields.rows[0]);
}

export async function deleteField(req: Request, res: Response) {
  const id = +req.params.fieldId;
  const conn = await connect();
  await conn.query(getDeleteByIdQuery(TABLE_NAME, id));
  res.json({
      message: 'Field deleted'
  });
  // res.json({
  //   message: 'Field does not deleted'
  // });
}

export async function updateField(req: Request, res: Response) {
  const id = +req.params.fieldId;
  const updateField: any = req.body;
  const conn = await connect();
  conn.query(getUpdateByIdQuery(TABLE_NAME, id, updateField))
    .then(result => {
      res.json({
        message: 'Field Updated',
        result
      });
    })
    .catch(e => {
      res.json({
        message: 'Field not Updated',
        error: e
      });
    });


  // res.json({
  //   message: 'Field does not updated'
  // });
}
