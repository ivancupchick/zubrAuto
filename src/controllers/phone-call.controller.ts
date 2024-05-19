import { NextFunction, Request, Response } from 'express'
import { BaseCrudController } from './base.conroller';
import { StringHash } from '../models/hashes';
import { ServerPhoneCall } from '../entities/PhoneCall';
import phoneCallsService from '../services/phone-calls.service';
import { validationResult } from 'express-validator';
import { ApiError } from '../exceptions/api.error';
import { Webhook } from '../models/webhook';

class PhoneCallController extends BaseCrudController<ServerPhoneCall.Response> {
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

  protected createEntity(req: Request<any, any, ServerPhoneCall.CreateRequest>, res: Response, next: NextFunction) {
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

  async webHookNotify(
    req: Request<any, any, Webhook.Notification>,
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

      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const hook = await phoneCallsService.webHookNotify(body);

      return res.json(hook);
    } catch (e) {
      next(e);
    }
  }
}

export = new PhoneCallController();
