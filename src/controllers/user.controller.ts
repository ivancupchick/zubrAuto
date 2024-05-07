import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator';
import { ServerUser } from '../entities/User';
import { ApiError } from '../exceptions/api.error';
import userService from '../services/user.service';
import { ControllerActivity } from '../decorators/activity.decorator';
import { ActivityType } from '../enums/activity-type.enum';
import { Models } from '../entities/Models';

class UserController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const users = await userService.getAll();

      return res.json(users);
    } catch (e) {
      next(e);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const id = +req.params.userId;
      const user = await userService.get(id);

      return res.json(user);
    } catch (e) {
      next(e);
    }
  }

  @ControllerActivity({ type: ActivityType.CreateUser, sourceName: Models.Table.Users })
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const newUser: ServerUser.CreateRequest = req.body;
      const user = await userService.create(newUser);

      return res.json(user);
    } catch (e) {
      next(e);
    }
  }

  @ControllerActivity({ type: ActivityType.UpdateUser, sourceName: Models.Table.Users })
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const id = +req.params.userId;
      const updatedUser: ServerUser.CreateRequest = req.body;
      const user = await userService.update(id, updatedUser);

      return res.json(user);
    } catch (e) {
      next(e);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const id = +req.params.userId;
      const user = await userService.delete(id);

      return res.json(user);
    } catch (e) {
      next(e);
    }
  }
}

export = new UserController();
