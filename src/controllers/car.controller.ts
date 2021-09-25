import { Request, Response } from 'express'
import { connect } from '../database'
import { ResponseCar } from '../interface/Car';
import { Database } from '../interface/Database';

// TODO: CRUD
// TODO: replace all sql queries to separate file or place(constants in top of this file)
// TODO: owner feature (maybe never)

export async function getCars(req: Request, res: Response): Promise<Response | void> {
    let cars: ResponseCar[] = [];
    let objectCars: Database.Car[] = [];
    let chaines: Database.FieldId[] = [];
    let chainedFields: Database.Field[] = [];

    try {
        const conn = await connect();
        conn.query('SELECT * FROM public.cars')
            .then(resCars => {
                console.log(resCars.rows[0]);
                objectCars = resCars.rows;

                return conn.query(`SELECT * FROM public.fieldsIds WHERE sourceId IN (${objectCars.map((c: Database.Car) => c.id).join(',')})`)
            })
            .then(resFieldIds => {
                chaines = resFieldIds.rows;

                return conn.query(`SELECT * FROM public.fields WHERE id IN (${chaines.map((ch: Database.FieldId) => ch.fieldId).join(',')})`)
            })
            .then(resFields => {
                chainedFields = resFields.rows;

                cars = objectCars.map(databaseCar => {
                    return {
                        id: databaseCar.id,
                        createdDate: +databaseCar.createdDate,
                        ownerId: databaseCar.ownerId || 0,
                        fields: chainedFields
                            .filter(cf => !!chaines
                                .filter(ch => ch.sourceId === databaseCar.id)
                                .find(ch => ch.fieldId === cf.id)
                            )
                            .map(cf => {
                                return {
                                    id: cf.id,
                                    name: cf.name,
                                    flags: cf.flags,
                                    type: cf.type,
                                    domain: cf.domain,
                                    variants: cf.variants,
                                    showUserLevel: cf.showUserLevel,
                                    value: chaines.find(c => c.fieldId === cf.id)?.value || ''
                                }
                            })
                    }
                })

                console.log(cars);
                return res.json(cars);
            })

    }
    catch (e) {
        console.log(e)
        return res.json(e)
    }
}

export async function createCar(req: Request, res: Response) {
    // const newCar: ResponseCar = req.body;
    // const conn = await connect();
    // await conn.query('INSERT INTO cars SET ?', [newCar]);
    // res.json({
    //     message: 'New Car Created'
    // });

    res.json({
        message: 'New car does not created'
    });
}

export async function getCar(req: Request, res: Response) {
    // const id = req.params.carId;
    // const conn = await connect();
    // const cars = await conn.query('SELECT * FROM cars WHERE id = ?', [id]);
    // res.json(cars.rows[0]);
    res.json({});
}

export async function deleteCar(req: Request, res: Response) {
    // const id = req.params.carId;
    // const conn = await connect();
    // await conn.query('DELETE FROM cars WHERE id = ?', [id]);
    // res.json({
    //     message: 'Car deleted'
    // });
    res.json({
        message: 'Car does not deleted'
    });
}

export async function updateCar(req: Request, res: Response) {
    // const id = req.params.carId;
    // const updateCar: any = req.body;
    // const conn = await connect();
    // await conn.query('UPDATE cars set ? WHERE id = ?', [updateCar, id]);
    // res.json({
    //     message: 'Car Updated'
    // });

    res.json({
        message: 'Car does not updated'
    });
}
