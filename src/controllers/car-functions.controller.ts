import { NextFunction, Request, Response } from 'express'
import { FileArray, UploadedFile } from 'express-fileupload';
import { validationResult } from 'express-validator';
import { ServerCar } from '../entities/Car';
import { CarStatistic } from '../entities/CarStatistic';
import { ApiError } from '../exceptions/api.error';
import carImageService from '../services/car-image.service';
import carStatisticService from '../services/car-statistic.service';
import carService from '../services/car.service';
import { BaseController } from './base.conroller';

class CarFunctionsController extends BaseController {
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

  async getImages(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка при валидации', errors.array());
      }

      const id = +req.params.carId;

      const result = await carImageService.getCarFiles(id)

      // const body: ServerCar.CreateByLink = req.body;
      // const cars = await carService.createCarsByLink(body);
      return res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async deleteCarImage(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка при валидации', errors.array());
      }

      const carId = +req.params.carId;
      const imageId = +req.params.imageId;

      const result = await carImageService.deleteCarImage(carId, imageId)
;
      return res.json(true);
    } catch (e) {
      next(e);
    }
  }

  async uploadImages(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка при валидации', errors.array());
      }

      const file = ((req as any).files as FileArray)['file'];

      let files: UploadedFile[] = Array.isArray(file)
        ? file
        : [file];

      const id = +req.body.carId;
      const metadata = req.body.metadata || '{}';

      const result = await carImageService.uploadCarImage(id, files, metadata);

      return res.json(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }

  async uploadStateImages(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка при валидации', errors.array());
      }

      const file = ((req as any).files as FileArray)['file'];

      let files: UploadedFile[] = Array.isArray(file)
        ? file
        : [file];

      const id = +req.body.carId;
      const metadata = req.body.metadata || '{}';

      const result = await carImageService.uploadCarStateImages(id, files, metadata);

      return res.json(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }

  async uploadImage360(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка при валидации', errors.array());
      }

      const file = ((req as any).files as FileArray)['file'];

      let files: UploadedFile[] = Array.isArray(file)
        ? file
        : [file];

      const id = +req.body.carId;
      const metadata = req.body.metadata || '{}';

      const result = await carImageService.uploadCarImage360(id, files[0], metadata);

      return res.json(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }

  // async uploadImages(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const errors = validationResult(req);

  //     if (!errors.isEmpty()) {
  //       throw ApiError.BadRequest('Ошибка при валидации', errors.array());
  //     }

  //     // const file = Array.isArray(((req as any).files as any).file)
  //     //   ? ((req as any).files as any).file[0]
  //     //   : ((req as any).files as any).file;

  //     const file = req.file;
  //     const metadata = req.body.metadata || '{}';
  //     const id = +req.body.carId;


  //     const result = await carImageService.uploadCarImage(id, file, metadata);

  //     return res.json(result);
  //   } catch (e) {
  //     next(e);
  //   }
  // }

  async addCall(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка при валидации', errors.array());
      }

      const carIds = req.body.carIds

      const result = await carStatisticService.addCall(carIds);

      return res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async addCustomerCall(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка при валидации', errors.array());
      }

      const carId = +req.params.carId;

      const result = await carStatisticService.addCustomerCall(carId);

      return res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async addCustomerDiscount(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка при валидации', errors.array());
      }

      const carId = +req.params.carId;
      const discount = +req.body.discount
      const amount = +req.body.amount

      const result = await carStatisticService.addCustomerDiscount(carId, discount, amount);

      return res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async createCarShowing(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка при валидации', errors.array());
      }

      const carId = +req.params.carId;
      const carShowingContent: CarStatistic.ShowingContent = req.body.showingContent;

      const result = await carStatisticService.createCarShowing(carId, carShowingContent);

      return res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async updateCarShowing(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка при валидации', errors.array());
      }

      const carId = +req.params.carId;
      const carShowingId: number = req.body.showingId;
      const carShowingContent: CarStatistic.ShowingContent = req.body.showingContent;

      const result = await carStatisticService.updateCarShowing(carShowingId, carId, carShowingContent);

      return res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async getCarStatistic(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка при валидации', errors.array());
      }

      const carId = +req.params.carId;

      const result = await carStatisticService.getCarShowingStatistic(carId);

      return res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async getAllCarStatistic(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка при валидации', errors.array());
      }

      const carId = +req.params.carId;

      const result = await carStatisticService.getAllCarStatistic(carId);

      return res.json(result);
    } catch (e) {
      next(e);
    }
  }
}

export = new CarFunctionsController();
