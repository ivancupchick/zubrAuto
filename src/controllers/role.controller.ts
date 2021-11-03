import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator';
import { ServerRole } from '../entities/Role';
import { ApiError } from '../exceptions/api.error';
import roleService from '../services/role.service';
import { BaseController } from './base.conroller';

class RoleController {
  async getAllRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка при валидации', errors.array());
      }

      const roles = await roleService.getAll();

      return res.json(roles);
    } catch (e) {
      next(e);
    }
  }

  async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка при валидации', errors.array());
      }

      const newRole: ServerRole.CreateRequest = req.body;
      const role = await roleService.create(newRole);
      return res.json(role);
    } catch (e) {
      next(e);
    }
  }

  async getRole(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка при валидации', errors.array());
      }

      const id = +req.params.roleId;
      const role = await roleService.get(id);

      return res.json(role);
    } catch (e) {
      next(e);
    }
  }

  async deleteRole(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка при валидации', errors.array());
      }

      const id = +req.params.roleId;
      const role = await roleService.delete(id);

      return res.json(role);
    } catch (e) {
      next(e);
    }
  }

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApiError.BadRequest('Ошибка при валидации', errors.array());
      }

      const id = +req.params.roleId;
      const updatedRole: ServerRole.UpdateRequest = req.body;
      const role = await roleService.update(id, updatedRole);

      return res.json(role);
    } catch (e) {
      next(e);
    }
  }
}

export = new RoleController();
