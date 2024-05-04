import { NextFunction, Request, Response } from "express";
import { ServerClient } from "../entities/Client";
import { validationResult } from "express-validator";
import { ApiError } from "../exceptions/api.error";
import clientService from "../services/client.service";
import { BaseCrudController } from "./base.conroller";
import { ParsedQs } from "qs";
import { StringHash } from "../models/hashes";

class ClientConntroller extends BaseCrudController<ServerClient.Response> {
  protected getAllEntities(req: Request, res: Response, next: NextFunction) {
    const query: StringHash = req.query as StringHash;
    const queryKeys = Object.keys(query);

    return queryKeys.length > 0
      ? clientService.getClientsByQuery(query)
      : clientService.getAll();
  }

  protected getEntity(
    req: Request,
    res: Response<ServerClient.Response, Record<string, any>>,
    next: NextFunction
  ): Promise<ServerClient.Response> {
    const id = +req.params.clientId;
    return clientService.get(id);
  }

  protected createEntity(
    req: Request<any, { id: number }, any, ParsedQs, Record<string, any>>,
    res: Response<{ id: number }, Record<string, any>>,
    next: NextFunction
  ): Promise<{ id: number }> {
    const newClient: ServerClient.CreateRequest = req.body;
    return clientService.create(newClient);
  }

  protected updateEntity(
    req: Request<any, { id: number }, any, ParsedQs, Record<string, any>>,
    res: Response<{ id: number }, Record<string, any>>,
    next: NextFunction
  ): Promise<{ id: number }> {
    const id = +req.params.clientId;
    const updatedClient: ServerClient.CreateRequest = req.body;
    return clientService.update(id, updatedClient);
  }

  protected deleteEntity(
    req: Request<any, { id: number }, any, ParsedQs, Record<string, any>>,
    res: Response<{ id: number }, Record<string, any>>,
    next: NextFunction
  ): Promise<{ id: number }> {
    const id = +req.params.clientId;
    return clientService.delete(id);
  }

  protected deleteEntities(
    req: Request<any, { id: number }, any, ParsedQs, Record<string, any>>,
    res: Response<{ id: number }, Record<string, any>>,
    next: NextFunction
  ): Promise<any> {
    // !TODO
    const id = +req.params.clientId;
    return clientService.delete(id);
  }

  // async completeDeal(req: Request<any, any, {clientId: number, carId: number}>, res: Response, next: NextFunction) {
  //   return await this.request(req, res, next, (_req, _res, _next) => {
  //     const {clientId, carId} = _req.body;
  //     return clientService.completeDeal(clientId, carId);
  //   });
  // }

  async completeDeal(
    req: Request<any, any, { clientId: number; carId: number }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(
          ApiError.BadRequest("Ошибка при валидации", errors.array())
        );
      }

      const { clientId, carId } = req.body;
      const client = await clientService.completeDeal(clientId, carId);

      return res.json(client);
    } catch (e) {
      next(e);
    }
  }
}

export = new ClientConntroller();
