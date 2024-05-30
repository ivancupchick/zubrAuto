import { NextFunction, Request, Response } from "express";
import { BaseCrudController } from "./base.conroller";
import { ParsedQs } from "qs";
import { StringHash } from "../models/hashes";
import { ServerActivity } from "../entities/Activity";
import activityService from "../services/activity.service";
import { BaseList } from "../entities/Types";

class ChangeLogConntroller extends BaseCrudController<ServerActivity.Response> {
  protected getAllEntities(req: Request, res: Response, next: NextFunction): Promise<BaseList<ServerActivity.Response>> {
    const query: StringHash = req.query as StringHash;

    return activityService.getEntitiesByQuery(query);
  }

  protected getEntity(
    req: Request,
    res: Response<ServerActivity.Response, Record<string, any>>,
    next: NextFunction
  ): Promise<ServerActivity.Response> {
    const id = +req.params.id;
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
    const id = +req.params.id;
    const updatedClient: ServerActivity.CreateRequest = req.body;
    return activityService.update(id, updatedClient);
  }

  protected deleteEntity(
    req: Request<any, { id: number }, any, ParsedQs, Record<string, any>>,
    res: Response<{ id: number }, Record<string, any>>,
    next: NextFunction
  ): Promise<{ id: number }> {
    const id = +req.params.id;
    return activityService.delete(id);
  }

  protected deleteEntities(
    req: Request<any, { id: number }, any, ParsedQs, Record<string, any>>,
    res: Response<{ id: number }, Record<string, any>>,
    next: NextFunction
  ): Promise<any> {
    // !TODO
    const id = +req.params.id;
    return activityService.delete(id);
  }
}

export = new ChangeLogConntroller();
