import { NextFunction, Request, Response } from 'express'
import { ServerCar } from '../entities/Car';
import carService from '../services/car.service';
import { StringHash } from '../utils/sql-queries';
import { BaseCrudController } from './base.conroller';
// import { Activity } from '../decorators/activity.decorator';

class CarController extends BaseCrudController<ServerCar.Response> {
  // protected async request<TResponse>(
  //   req: Request,
  //   res: Response<TResponse>,
  //   next: NextFunction,
  //   getResults: (
  //     (
  //       req: Request,
  //       res: Response<TResponse>,
  //       next: NextFunction
  //     ) => Promise<TResponse>
  //   )
  // ): Promise<Response<TResponse>> {
  //   return super.request(req, res, next, getResults);
  // }

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
    const car = carService.manualCreate(req.body);

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

  protected deleteEntities(req: Request, res: Response, next: NextFunction) {
    const carIds: number[] = req.body.carIds;
    const result = carService.deleteCars(carIds);

    return result;
  }

  // async deleteCars(req: Request, res: Response, next: NextFunction) {
  //   const rusultFn = (reqq: Request) => {
  //     const carIds = reqq.body.carIds;
  //     return carService.deleteCars(carIds);
  //   }

  //   return await this.request(req, res, next, rusultFn)
  // }
}

export = new CarController();
