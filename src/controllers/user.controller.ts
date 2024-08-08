import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator';
import { ServerUser } from '../entities/User';
import { ApiError } from '../exceptions/api.error';
import userService from '../services/user.service';
import { ControllerActivity } from '../decorators/activity.decorator';
import { ActivityType } from '../enums/activity-type.enum';
import { Models } from '../entities/Models';
import { BaseCrudController } from './base.conroller';
import { StringHash } from '../models/hashes';

class UserController extends BaseCrudController<ServerUser.Response> {
  protected getAllEntities(req: Request, res: Response, next: NextFunction) {
    const query: StringHash = req.query as StringHash;
    const queryKeys = Object.keys(query);

    return queryKeys.length > 0
      ? userService.getUsersByQuery(query)
      : userService.getAll();
  }

  protected getEntity(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    const entity = userService.get(+req.params.id);

    return entity;
  }

  @ControllerActivity({ type: ActivityType.CreateUser, sourceName: Models.Table.Users })
  protected createEntity(req: Request<any, any, ServerUser.CreateRequest>, res: Response, next: NextFunction) {
    const entity = userService.create(req.body);

    return entity;
  }

  @ControllerActivity({ type: ActivityType.UpdateUser, sourceName: Models.Table.Users })
  async updateEntity(req: Request<any, any, ServerUser.UpdateRequest>, res: Response, next: NextFunction) {
    const entity = await userService.update(+req.params.id, req.body);

    return entity;
  }

  @ControllerActivity({ type: ActivityType.DeleteUser, sourceName: Models.Table.Users })
  protected deleteEntity(req: Request, res: Response, next: NextFunction) {
    const id = +req.params.id;
    const entity = userService.delete(id);

    return entity;
  }

  protected deleteEntities(req: Request, res: Response, next: NextFunction) {
    next(ApiError.BadRequest('Запрещенный метод'));
    return null; // TODO
  }
}

export = new UserController();
