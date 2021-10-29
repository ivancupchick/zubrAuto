import { NextFunction, Request, Response } from 'express'
import { ServerRole } from '../entities/Role';
import roleService from '../services/role.service';
import { BaseController } from './base.conroller';

class RoleController extends BaseController {
  async getAllRoles(req: Request, res: Response, next: NextFunction) {
    try {
      this.checkValidation(req);

      const roles = await roleService.getAllRoles();

      return res.json(roles);
    } catch (e) {
      next(e);
    }
  }

  async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      this.checkValidation(req);

      const newRole: ServerRole.CreateRequest = req.body;
      const role = await roleService.createRole(newRole);
      return res.json(role);
    } catch (e) {
      next(e);
    }
  }

  async getRole(req: Request, res: Response, next: NextFunction) {
    try {
      this.checkValidation(req);

      const id = +req.params.roleId;
      const role = await roleService.getRole(id);

      return res.json(role);
    } catch (e) {
      next(e);
    }
  }

  async deleteRole(req: Request, res: Response, next: NextFunction) {
    try {
      this.checkValidation(req);

      const id = +req.params.roleId;
      const role = await roleService.deleteRole(id);

      return res.json(role);
    } catch (e) {
      next(e);
    }
  }

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      this.checkValidation(req);

      const id = +req.params.roleId;
      const updatedRole: ServerRole.UpdateRequest = req.body;
      const role = await roleService.updateRole(id, updatedRole);

      return res.json(role);
    } catch (e) {
      next(e);
    }
  }
}

export = new RoleController();
