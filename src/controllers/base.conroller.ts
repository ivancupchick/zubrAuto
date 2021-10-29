import { NextFunction, Request, Response } from 'express'
import { validationResult } from "express-validator";
import { ApiError } from "../exceptions/api.error";

// interface CrudService<TGetResponse, TCreateRequest, TCreateResponse, TUpdateRequest, TUpdateResponse, TDeleteResponse> {
//   getAll: () => Promise<TGetResponse[]>;
//   get: () => Promise<TGetResponse>;
//   create: (entity: TCreateRequest) => Promise<TCreateResponse>;
//   update: (id: number, entity: TUpdateRequest) => Promise<TUpdateResponse>;
//   delete: (id: number) => Promise<TDeleteResponse>;
// }

export class BaseController<TGetResponse = any, TCreateRequest = any, TCreateResponse = any, TUpdateRequest = any, TUpdateResponse = any, TDeleteResponse = any> {
  protected checkValidation(req: Request) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw ApiError.BadRequest('Ошибка при валидации', errors.array());
    }
  }

  // constructor(private crudService: CrudService<TGetResponse, TCreateRequest, TCreateResponse, TUpdateRequest, TUpdateResponse, TDeleteResponse>) {}

  // async getAll(req: Request, res: Response<TGetResponse[]>, next: NextFunction): Promise<Response<TGetResponse[]>> {
  //   try {
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       throw ApiError.BadRequest('Ошибка при валидации', errors.array());
  //     }

  //     const result = await this.crudService.getAll();

  //     const r = res.json(result);

  //     return res.json(result);
  //   } catch (e) {
  //     next(e);
  //   }
  // }

  // async getOne(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
  //     }

  //     const id = +req.params.carId;
  //     const car = await carService.getCar(id);

  //     return res.json(car);
  //   } catch (e) {
  //     next(e);
  //   }
  // }

  // async create(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
  //     }

  //     const newCar: ServerCar.CreateRequest = req.body;
  //     const car = await carService.createCar(newCar);
  //     return res.json(car);
  //   } catch (e) {
  //     next(e);
  //   }
  // }

  // async update(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
  //     }

  //     const id = +req.params.carId;
  //     const updatedCar: ServerCar.UpdateRequest = req.body;
  //     const car = await carService.updateCar(id, updatedCar);

  //     return res.json(car);
  //   } catch (e) {
  //     next(e);
  //   }
  // }

  // async delete(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
  //     }

  //     const id = +req.params.carId;
  //     const car = await carService.deleteCar(id);

  //     return res.json(car);
  //   } catch (e) {
  //     next(e);
  //   }
  // }
}
