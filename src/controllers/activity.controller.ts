import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { ApiError } from "../exceptions/api.error";
import { BaseCrudController } from "./base.conroller";
import { ParsedQs } from "qs";
import { StringHash } from "../models/hashes";
import { ServerActivity } from "../entities/Activities";
import activityService from "../services/activity.service";

class ClientConntroller extends BaseCrudController<ServerActivity.Response> {
  protected getAllEntities(req: Request, res: Response, next: NextFunction) {
    const query: StringHash = req.query as StringHash;
    const queryKeys = Object.keys(query);

    return queryKeys.length > 0
      ? activityService.getEntitiesByQuery(query)
      : activityService.getAll();
  }

  protected getEntity(
    req: Request,
    res: Response<ServerActivity.Response, Record<string, any>>,
    next: NextFunction
  ): Promise<ServerActivity.Response> {
    const id = +req.params.clientId;
    return activityService.get(id);
  }

  protected createEntity(
    req: Request<any, { id: number }, any, ParsedQs, Record<string, any>>,
    res: Response<{ id: number }, Record<string, any>>,
    next: NextFunction
  ): Promise<{ id: number }> {
    const newClient: ServerActivity.CreateRequest = req.body;
    return activityService.create(newClient);
  }

  protected updateEntity(
    req: Request<any, { id: number }, any, ParsedQs, Record<string, any>>,
    res: Response<{ id: number }, Record<string, any>>,
    next: NextFunction
  ): Promise<{ id: number }> {
    const id = +req.params.clientId;
    const updatedClient: ServerActivity.CreateRequest = req.body;
    return activityService.update(id, updatedClient);
  }

  protected deleteEntity(
    req: Request<any, { id: number }, any, ParsedQs, Record<string, any>>,
    res: Response<{ id: number }, Record<string, any>>,
    next: NextFunction
  ): Promise<{ id: number }> {
    const id = +req.params.clientId;
    return activityService.delete(id);
  }

  protected deleteEntities(
    req: Request<any, { id: number }, any, ParsedQs, Record<string, any>>,
    res: Response<{ id: number }, Record<string, any>>,
    next: NextFunction
  ): Promise<any> {
    // !TODO
    const id = +req.params.clientId;
    return activityService.delete(id);
  }
}

export = new ClientConntroller();
