import { NextFunction, Request, Response } from 'express'
import { BaseCrudController } from './base.conroller';
import { StringHash } from '../models/hashes';
import { validationResult } from 'express-validator';
import { ApiError } from '../exceptions/api.error';
import { Webhook } from '../models/webhook';
import { ServerCallRequest } from '../entities/CallRequest';
import callRequestService from '../services/call-request.service';
import { SitesCallRequest } from '../models/sites-call-request';

class CallRequestController extends BaseCrudController<ServerCallRequest.Response> {
  protected getAllEntities(req: Request, res: Response, next: NextFunction) {
    const query: StringHash = req.query as StringHash;
    const queryKeys = Object.keys(query);

    return null;

    // return queryKeys.length > 0
    //   ? phoneCallsService.getPhoneCallsByQuery(query)
    //   : phoneCallsService.getAll();
  }

  protected getEntity(req: Request<{ carId: string }>, res: Response, next: NextFunction) {
    return null;
    // const call = phoneCallsService.get(+req.params.carId);

    // return call;
  }

  protected createEntity(req: Request<any, any, ServerCallRequest.CreateRequest>, res: Response, next: NextFunction) {
    return null;

    // const call = phoneCallsService.create(req.body);

    // return call;
  }

  async updateEntity(req: Request, res: Response, next: NextFunction) {
    return null;

    // const id = +req.params.carId;
    // const updatedCall: ServerPhoneCall.UpdateRequest = req.body;
    // const call = await phoneCallsService.update(id, updatedCall);

    // return call;
  }

  protected deleteEntity(req: Request, res: Response, next: NextFunction) {
    return null;

    // const id = +req.params.carId;
    // const call = phoneCallsService.delete(id);

    // return call;
  }

  protected deleteEntities(req: Request, res: Response, next: NextFunction) { // !TODO
    return null;

    // const carIds: number[] = req.body.carIds;
    // const result = phoneCallsService.delete(carIds[0]);

    // return result;
  }

  async callRequest(
    req: Request<any, any, SitesCallRequest>,
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

      const hook = await callRequestService.callRequest(req.body);

      return res.json(hook);
    } catch (e) {
      next(e);
    }
  }
}

export = new CallRequestController();
