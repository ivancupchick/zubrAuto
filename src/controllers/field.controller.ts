import { NextFunction, Request, Response } from 'express'
import { ServerField, FieldDomains } from '../entities/Field';
import { validationResult } from 'express-validator';
import { ApiError } from '../exceptions/api.error';
import fieldService from '../services/field.service';

class FieldConntroller {
  async getAllFields(req: Request, res: Response<ServerField.Response[]>, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const fields = await fieldService.getAll();

      return res.json(fields);
    } catch (e) {
      next(e);
    }
  }

  async createField(req: Request<{}, ServerField.IdResponse, ServerField.CreateRequest>, res: Response<ServerField.IdResponse>, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const newField = req.body;
      const field = await fieldService.create(newField);

      return res.json({ id: field.id });
    } catch (e) {
      next(e);
    }
  }

  async getField(req: Request<{ fieldId: string; }>, res: Response<ServerField.Response>, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const id = +req.params.fieldId;
      const field = await fieldService.get(id);

      return res.json(field);
    } catch (e) {
      next(e);
    }
  }

  async deleteField(req: Request<{ fieldId: string; }>, res: Response<ServerField.IdResponse>, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const id = +req.params.fieldId;
      const field = await fieldService.delete(id);

      return res.json(field);
    } catch (e) {
      next(e);
    }
  }

  async updateField(req: Request<{ fieldId: string; }, ServerField.Response, ServerField.UpdateRequest>, res: Response<ServerField.Response>, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const id = +req.params.fieldId;
      const updatedField = req.body;
      const field = await fieldService.update(id, updatedField);

      return res.json(field);
    } catch (e) {
      next(e);
    }
  }

  async getFieldsByDomain(req: Request<{ domain: string; }, ServerField.Response[]>, res: Response<ServerField.Response[]>, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const domain: FieldDomains = +req.params.domain;

      const fields = await fieldService.getFieldsByDomain(domain);

      return res.json(fields);
    } catch (e) {
      next(e);
    }
  }
}

export = new FieldConntroller();
