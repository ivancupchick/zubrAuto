import { Request, Response } from 'express'
import { connect } from '../database'
import { CreateField, IField } from '../interface/Field';
import { Database } from '../interface/Database';

// TODO: replace all sql queries to separate file or place(constants in top of this file)
// TODO: owner feature (maybe never)

export async function getFields(req: Request, res: Response): Promise<Response | void> {
  let fields: IField[] = [];
  let objectFields: Database.Field[] = [];

  try {
    const conn = await connect();
    conn.query('SELECT * FROM public.fields')
      .then(resFields => {
        console.log(resFields.rows[0]);
        objectFields = resFields.rows;

        fields = [...objectFields];

        console.log(fields);
        res.json(fields);
      })

  }
  catch (e) {
    console.log(e)
    res.json(e)
  }
}

export async function createField(req: Request<any, string, CreateField>, res: Response) {
  const newField: CreateField = req.body;
  try {
    const conn = await connect();
    conn.query('INSERT INTO fields SET ?', [newField])
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
  // const id = req.params.fieldId;
  // const conn = await connect();
  // const fields = await conn.query('SELECT * FROM fields WHERE id = ?', [id]);
  // res.json(fields.rows[0]);
}

export async function deleteField(req: Request, res: Response) {
  const id = req.params.fieldId;
  const conn = await connect();
  await conn.query('DELETE FROM fields WHERE id = ?', [id]);
  res.json({
      message: 'Field deleted'
  });
  // res.json({
  //   message: 'Field does not deleted'
  // });
}

export async function updateField(req: Request, res: Response) {
  const id = req.params.fieldId;
  const updateField: any = req.body;
  const conn = await connect();
  await conn.query('UPDATE fields set ? WHERE id = ?', [updateField, id]);
  res.json({
      message: 'Field Updated'
  });

  // res.json({
  //   message: 'Field does not updated'
  // });
}
