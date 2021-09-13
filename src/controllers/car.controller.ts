import { Request, Response } from 'express'

// DB
import { connect } from '../database'
// Interfaces
import { RequestCar } from '../interface/Car'

export async function getCars(req: Request, res: Response): Promise<Response | void> {
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Max-Age', 2592000);

    try {
        // const conn = await connect();
        // const cars = await conn.query('SELECT * FROM cars');
        return res.json('success');
    }
    catch (e) {
        console.log(e)
    }
}

export async function createCar(req: Request, res: Response) {
    const newCar: RequestCar = req.body;
    const conn = await connect();
    await conn.query('INSERT INTO cars SET ?', [newCar]);
    res.json({
        message: 'New Car Created'
    });
}

export async function getCar(req: Request, res: Response) {
    const id = req.params.carId;
    const conn = await connect();
    const cars = await conn.query('SELECT * FROM cars WHERE id = ?', [id]);
    res.json(cars[0]);
}

export async function deleteCar(req: Request, res: Response) {
    const id = req.params.carId;
    const conn = await connect();
    await conn.query('DELETE FROM cars WHERE id = ?', [id]);
    res.json({
        message: 'Car deleted'
    });
}

export async function updateCar(req: Request, res: Response) {
    const id = req.params.carId;
    const updateCar: RequestCar = req.body;
    const conn = await connect();
    await conn.query('UPDATE cars set ? WHERE id = ?', [updateCar, id]);
    res.json({
        message: 'Car Updated'
    });
}