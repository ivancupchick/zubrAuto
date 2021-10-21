import { Request, Response } from 'express'
import { ServerCar, ServerCarOwner } from '../entities/Car';
import { CarConnection, CarOwnerConnection } from '../entities/DBConnections';
import { getFieldsWithValues } from '../utils/field.utils';

export async function getCars(req: Request, res: Response): Promise<Response | void> {
  const dbConnection = await CarConnection.create();
  const carOwnerConnection = new CarOwnerConnection(dbConnection.conn); // TODO test this

  try {
    const [cars, carFields, carOwners, carOwnerFields] = await Promise.all([
      dbConnection.getAllCars(),
      dbConnection.getRelatedFields(),
      carOwnerConnection.getAllCarOwners(),
      carOwnerConnection.getRelatedFields(),
    ]);

    const [carChaines, carOwnerChaines] = await Promise.all([
      dbConnection.getCarChaines(cars.map(c => c.id)),
      carOwnerConnection.getCarOwnerChaines(carOwners.map(c => c.id)),
    ]);

    const result: ServerCar.GetResponse[] = cars.map(car => ({
      id: car.id,
      createdDate: car.createdDate,
      ownerId: car.ownerId,
      ownerNumber: carOwners.find(co => co.id === car.ownerId)?.number || '',
      fields: [...getFieldsWithValues(carFields, carChaines, car.id), ...getFieldsWithValues(carOwnerFields, carOwnerChaines, car.ownerId)]
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

export async function createCar(req: Request<any, string, ServerCar.CreateRequest>, res: Response) {
  const newCar: ServerCar.CreateRequest = req.body;

  const dbConnection = await CarConnection.create();
  const carOwnerConnection = new CarOwnerConnection(dbConnection.conn); // TODO test this

  try {
    const carOwnerFieldsConfigs = await carOwnerConnection.getRelatedFields();
    const ownerFields = newCar.fields.filter(f => !!carOwnerFieldsConfigs.find(fc => fc.id === f.id));
    const carFields = newCar.fields.filter(f => !ownerFields.find(of => of.id === f.id));

    const existCarOwner = await carOwnerConnection.getCarOwnerByNumber(newCar.ownerNumber);
    const newCarOwner:  ServerCarOwner.CreateRequest = {
      number: newCar.ownerNumber,
      fields: ownerFields
    };
    const ownerId = !existCarOwner
      ? await carOwnerConnection.createCarOwner(newCarOwner)
      : existCarOwner.id;
    if (!existCarOwner) {
      await carOwnerConnection.createCarOwnerChaines(newCarOwner, ownerId);
    } else {
      await carOwnerConnection.updateCarOwner(newCarOwner, ownerId);
    }

    const newBDCar: ServerCar.UpdateRequest = {
      createdDate: newCar.createdDate,
      ownerId,
      fields: carFields
    };
    const id = await dbConnection.createCar(newBDCar);
    const result = await dbConnection.createCarChaines(newBDCar, id); // TODO! need this?

    await dbConnection.end();

    res.json({  // TODO! refactor
      message: 'Car Created',
      result
    });
  }
  catch (e) {
    await dbConnection.end();

    console.log(e);
    res.json({  // TODO! refactor
      message: 'Car does not Created',
      error: e
    });
  }
}

export async function updateCar(req: Request, res: Response) {
  const id = +req.params.carId;
  const updatedCar: ServerCar.UpdateRequest = req.body;

  const dbConnection = await CarConnection.create();
  const carOwnerConnection = new CarOwnerConnection(dbConnection.conn); // TODO test this

  try {
    const carOwnerFieldsConfigs = await carOwnerConnection.getRelatedFields();
    const ownerFields = updatedCar.fields.filter(f => !!carOwnerFieldsConfigs.find(fc => fc.id === f.id));
    const carFields = updatedCar.fields.filter(f => !ownerFields.find(of => of.id === f.id));

    const existCarOwner = await carOwnerConnection.getCarOwner(updatedCar.ownerId);
    const updatedCarOwner:  ServerCarOwner.CreateRequest = {
      number: existCarOwner.number,
      fields: ownerFields
    };

    const updatedBDCar: ServerCar.UpdateRequest = {
      createdDate: updatedCar.createdDate,
      ownerId: updatedCar.ownerId,
      fields: carFields
    };

    const [result,] = await Promise.all([dbConnection.updateCar(updatedBDCar, id), carOwnerConnection.updateCarOwner(updatedCarOwner, updatedCar.ownerId)]); // TODO! need this?

    await dbConnection.end();

    res.json({
      message: 'Car Updated',
      result
    });
  }
  catch (e) {
    await dbConnection.end();

    console.log(e);
    res.json({
      message: 'Car does not Updated',
      error: e
    });
  }

}

export async function deleteCar(req: Request, res: Response) {
  const id = +req.params.carId;

  const dbConnection = await CarConnection.create();

  try {
    const chaines = await dbConnection.getCarChaines([id]);
    const result = await dbConnection.deleteCar(id, chaines);

    await dbConnection.end();

    res.json({
      message: 'Car Deleted',
      result
    });
  }
  catch (e) {
    await dbConnection.end();

    console.log(e);
    res.json({
      message: 'Car does not Deleted',
      error: e
    });
  }
}

export async function getCar(req: Request, res: Response) { // TODO! works without fields!
  const id = +req.params.carId;

  const dbConnection = await CarConnection.create();

  try {
    const car = await dbConnection.getCar(id);
    // TODO: do assigning fields

    await dbConnection.end();

    res.json([car]);
  }
  catch (e) {
    await dbConnection.end();

    console.log(e);
    res.json([])
  }
}
