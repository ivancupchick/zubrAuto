import { NextFunction, Request, Response } from 'express'
import { FileArray, UploadedFile } from 'express-fileupload';
import { validationResult } from 'express-validator';
import { ServerCar } from '../entities/Car';
import { CarStatistic } from '../entities/CarStatistic';
import { ApiError } from '../exceptions/api.error';
import carImageService from '../services/car-image.service';
import carStatisticService from '../services/car-statistic.service';
import carService from '../services/car.service';
import { StringHash } from '../utils/sql-queries';
import { BaseCrudController } from './base.conroller';
// import { Activity } from '../decorators/activity.decorator';

class CarController extends BaseCrudController<ServerCar.Response> {
  // @Activity()
  protected getAllEntities(req: Request, res: Response, next: NextFunction) {
    const query: StringHash = req.query as StringHash;
    const queryKeys = Object.keys(query);

    return queryKeys.length > 0
      ? carService.getCarsByQuery(query)
      : carService.getAll();
  }

  protected getEntity(req: Request<{ carId: string }>, res: Response, next: NextFunction) {
    const car = carService.get(+req.params.carId);

    return car;
  }

  protected createEntity(req: Request<any, any, ServerCar.CreateRequest>, res: Response, next: NextFunction) {
    const car = carService.create(req.body);

    return car;
  }

  async updateEntity(req: Request, res: Response, next: NextFunction) {
    const id = +req.params.carId;
    const updatedCar: ServerCar.UpdateRequest = req.body;
    const car = await carService.update(id, updatedCar);

    return car;
  }

  protected deleteEntity(req: Request, res: Response, next: NextFunction) {
    const id = +req.params.carId;
    const car = carService.delete(id);

    return car;
  }

  async deleteCars(req: Request, res: Response, next: NextFunction) {
    const rusultFn = (reqq: Request) => {
      const carIds = reqq.body.carIds;
      return carService.deleteCars(carIds);
    }

    return await this.request(req, res, next, rusultFn)
  }
}

export = new CarController();
