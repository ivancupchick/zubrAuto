import { NextFunction, Request, Response } from 'express'
import { ServerField, FieldDomains } from '../entities/Field';
import { validationResult } from 'express-validator';
import { ApiError } from '../exceptions/api.error';
import fieldService from '../services/field.service';

class FieldConntroller {
  async getAllFields(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const fields = fieldService.getAllFields();

      return res.json(fields);
    } catch (e) {
      next(e);
    }
  }

  async createField(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const newField: ServerField.BaseEntity = req.body;
      const field = fieldService.createField(newField);

      return res.json(field);
    } catch (e) {
      next(e);
    }
  }

  async getField(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const id = +req.params.fieldId;
      const field = fieldService.getField(id);

      return res.json(field);
    } catch (e) {
      next(e);
    }
  }

  async deleteField(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const id = +req.params.fieldId;
      const field = fieldService.deleteField(id);

      return res.json(field);
    } catch (e) {
      next(e);
    }
  }

  async updateField(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const id = +req.params.fieldId;
      const updatedField: ServerField.Entity = req.body;
      const field = fieldService.updateField(id, updatedField);

      return res.json(field);
    } catch (e) {
      next(e);
    }
  }

  async getFieldsByDomain(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const domain: FieldDomains = +req.params.domain;

      const fields = fieldService.getFieldsByDomain(domain);

      return res.json(fields);
    } catch (e) {
      next(e);
    }
  }
}

export = new FieldConntroller();
