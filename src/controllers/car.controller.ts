import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator';
import { ServerCar } from '../entities/Car';
import { ApiError } from '../exceptions/api.error';
import carService from '../services/car.service';
import { BaseController } from './base.conroller';

class CarController {
  getAllCars = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка при валидации', errors.array());
      }

      const cars = await carService.getAll();

      return res.json(cars);
    } catch (e) {
      next(e);
    }
  }

  async createCar(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw ApiError.BadRequest('Ошибка при валидации', errors.array());
    }

      const newCar: ServerCar.CreateRequest = req.body;
      const car = await carService.create(newCar);
      return res.json(car);
    } catch (e) {
      next(e);
    }
  }

  async getCar(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка при валидации', errors.array());
      }

      const id = +req.params.carId;
      const car = await carService.get(id);

      return res.json(car);
    } catch (e) {
      next(e);
    }
  }

  async deleteCar(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка при валидации', errors.array());
      }

      const id = +req.params.carId;
      const car = await carService.delete(id);

      return res.json(car);
    } catch (e) {
      next(e);
    }
  }

  async updateCar(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка при валидации', errors.array());
      }

      const id = +req.params.carId;
      const updatedCar: ServerCar.UpdateRequest = req.body;
      const car = await carService.update(id, updatedCar);

      return res.json(car);
    } catch (e) {
      next(e);
    }
  }

  async createCarsByLink(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw ApiError.BadRequest('Ошибка при валидации', errors.array());
    }

      const body: ServerCar.CreateByLink = req.body;
      const cars = await carService.createCarsByLink(body);
      return res.json(cars);
    } catch (e) {
      next(e);
    }
  }
}

export = new CarController();
