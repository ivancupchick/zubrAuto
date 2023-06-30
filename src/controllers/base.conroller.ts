import { NextFunction, Request, Response } from 'express'
import { validationResult } from "express-validator";
import { ApiError } from "../exceptions/api.error";

type Id = {
  id: number;
}

// interface CrudService<TGetResponse, TCreateRequest, TCreateResponse, TUpdateRequest, TUpdateResponse, TDeleteResponse> {
//   getAll: () => Promise<TGetResponse[]>;
//   get: () => Promise<TGetResponse>;
//   create: (entity: TCreateRequest) => Promise<TCreateResponse>;
//   update: (id: number, entity: TUpdateRequest) => Promise<TUpdateResponse>;
//   delete: (id: number) => Promise<TDeleteResponse>;
// }

export abstract class BaseController {
  protected checkValidation(req: Request) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.BadRequest('Ошибка при валидации', errors.array());
    }
  }

  protected async request<TResponse>(
    req: Request,
    res: Response<TResponse>,
    next: NextFunction,
    getResults: (
      (
        req: Request,
        res: Response<TResponse>,
        next: NextFunction
      ) => Promise<TResponse>
    )
  ): Promise<Response<TResponse>> {
    try {
      this.checkValidation(req);

      const result = await getResults(req, res, next);

      return res.json(result);
    } catch (e) {
      next(e);
    }
  }
}

export abstract class BaseCrudController<TGetResponse extends Id, TCreateRequest = any, TUpdateRequest = any> extends BaseController {
  protected abstract getAllEntities(req: Request, res: Response<TGetResponse[]>, next: NextFunction): Promise<TGetResponse[]>;
  protected abstract getEntity(req: Request, res: Response<TGetResponse>, next: NextFunction): Promise<TGetResponse>;
  protected abstract createEntity(req: Request<any, Id, TCreateRequest>, res: Response<Id>, next: NextFunction): Promise<Id>;
  protected abstract updateEntity(req: Request<any, Id, TUpdateRequest>, res: Response<Id>, next: NextFunction): Promise<Id>;
  protected abstract deleteEntity(req: Request<any, Id>, res: Response<Id>, next: NextFunction): Promise<Id>;

  getAll = async (
    req: Request,
    res: Response<TGetResponse[]>,
    next: NextFunction
  ): Promise<Response<TGetResponse[]>> => {
    return await this.request(req, res, next, this.getAllEntities)
  }

  getOne = async (req: Request, res: Response<TGetResponse>, next: NextFunction) => {
    return await this.request(req, res, next, this.getEntity)
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    return await this.request(req, res, next, this.createEntity)
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    return await this.request(req, res, next, this.updateEntity)
  }

  delete = async (req: Request, res: Response, next: NextFunction) => {
    return await this.request(req, res, next, this.deleteEntity)
  }
}
