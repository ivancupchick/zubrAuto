import { NextFunction, Request, Response } from 'express'
import { BaseCrudController } from './base.conroller';
import { StringHash } from '../models/hashes';
import { validationResult } from 'express-validator';
import { ApiError } from '../exceptions/api.error';
import { ServerCallRequest } from '../entities/CallRequest';
import callRequestService from '../services/call-request.service';
import { SitesCallRequest } from '../models/sites-call-request';
import { ControllerActivity } from '../decorators/activity.decorator';
import { ActivityType } from '../enums/activity-type.enum';
import { Models } from '../entities/Models';

class CallRequestController extends BaseCrudController<ServerCallRequest.Response> {
  protected getAllEntities(req: Request, res: Response, next: NextFunction) {
    const query: StringHash = req.query as StringHash;
    const queryKeys = Object.keys(query);

    return queryKeys.length > 0
      ? callRequestService.getCallRequestsByQuery(query)
      : callRequestService.getAll();
  }

  protected getEntity(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    const call = callRequestService.get(+req.params.id);

    return call;
  }

  @ControllerActivity({ type: ActivityType.CreateCallRequest, sourceName: Models.Table.Activities })
  protected createEntity(req: Request<any, any, ServerCallRequest.CreateRequest>, res: Response, next: NextFunction) {
    const call = callRequestService.create(req.body);

    return call;
  }

  @ControllerActivity({ type: ActivityType.UpdateCallRequest, sourceName: Models.Table.Activities })
  async updateEntity(req: Request, res: Response, next: NextFunction) {
    const id = +req.params.id;
    const updatedCall: ServerCallRequest.UpdateRequest = req.body;
    const call = await callRequestService.update(id, updatedCall);

    return call;
  }

  @ControllerActivity({ type: ActivityType.DeleteCallRequest, sourceName: Models.Table.Activities })
  protected deleteEntity(req: Request, res: Response, next: NextFunction) {
    const id = +req.params.id;
    const call = callRequestService.delete(id);

    return call;
  }

  @ControllerActivity({ type: ActivityType.DeleteSomeCallRequest, sourceName: Models.Table.Activities })
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
