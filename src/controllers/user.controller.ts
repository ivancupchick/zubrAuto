import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator';
import { ServerUser } from '../entities/User';
import { ApiError } from '../exceptions/api.error';
import userService from '../services/user.service';

class UserController {
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const users = await userService.getAllUsers();

      return res.json(users);
    } catch (e) {
      next(e);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const id = +req.params.userId;
      const user = await userService.getUser(id);

      return res.json(user);
    } catch (e) {
      next(e);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const newUser: ServerUser.CreateRequest = req.body;
      const user = await userService.createUser(newUser);

      return res.json(user);
    } catch (e) {
      next(e);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const id = +req.params.userId;
      const updatedUser: ServerUser.CreateRequest = req.body;
      const user = await userService.updateUser(id, updatedUser);

      return res.json(user);
    } catch (e) {
      next(e);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const id = +req.params.userId;
      const user = await userService.deleteUser(id);

      return res.json(user);
    } catch (e) {
      next(e);
    }
  }
}

export = new UserController();
