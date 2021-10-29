import { NextFunction, Request, Response } from 'express'
import { ServerCar } from '../entities/Car';
import carService from '../services/car.service';
import { BaseController } from './base.conroller';

class CarController extends BaseController {
  async getAllCars(req: Request, res: Response, next: NextFunction) {
    try {
      this.checkValidation(req);

      const cars = await carService.getAllCars();

      return res.json(cars);
    } catch (e) {
      next(e);
    }
  }

  async createCar(req: Request, res: Response, next: NextFunction) {
    try {
      this.checkValidation(req);

      const newCar: ServerCar.CreateRequest = req.body;
      const car = await carService.createCar(newCar);
      return res.json(car);
    } catch (e) {
      next(e);
    }
  }

  async getCar(req: Request, res: Response, next: NextFunction) {
    try {
      this.checkValidation(req);

      const id = +req.params.carId;
      const car = await carService.getCar(id);

      return res.json(car);
    } catch (e) {
      next(e);
    }
  }

  async deleteCar(req: Request, res: Response, next: NextFunction) {
    try {
      this.checkValidation(req);

      const id = +req.params.carId;
      const car = await carService.deleteCar(id);

      return res.json(car);
    } catch (e) {
      next(e);
    }
  }

  async updateCar(req: Request, res: Response, next: NextFunction) {
    try {
      this.checkValidation(req);

      const id = +req.params.carId;
      const updatedCar: ServerCar.UpdateRequest = req.body;
      const car = await carService.updateCar(id, updatedCar);

      return res.json(car);
    } catch (e) {
      next(e);
    }
  }
}

export = new CarController();
