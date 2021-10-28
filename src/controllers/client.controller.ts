import { NextFunction, Request, Response } from 'express'
import { ServerClient } from '../entities/Client';
import { validationResult } from 'express-validator';
import { ApiError } from '../exceptions/api.error';
import clientService from '../services/client.service';

class ClientConntroller {
  async getAllClient(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const clients = await clientService.getAllClients();

      return res.json(clients);
    } catch (e) {
      next(e);
    }
  }

  async getClient(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const id = +req.params.clientId;
      const client = await clientService.getClient(id);

      return res.json(client);
    } catch (e) {
      next(e);
    }
  }

  async createClient(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const newClient: ServerClient.CreateRequest = req.body;
      const client = await clientService.createClient(newClient);

      return res.json(client);
    } catch (e) {
      next(e);
    }
  }

  async updateClient(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const id = +req.params.clientId;
      const updatedClient: ServerClient.CreateRequest = req.body;
      const client = await clientService.updateClient(id, updatedClient);

      return res.json(client);
    } catch (e) {
      next(e);
    }
  }

  async deleteClient(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const id = +req.params.clientId;
      const client = await clientService.deleteClient(id);

      return res.json(client);
    } catch (e) {
      next(e);
    }
  }
}

export = new ClientConntroller();
