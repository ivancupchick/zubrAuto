import { Request } from 'express'
import activityService from '../services/activity.service';
import { ServerAuth } from '../entities/Auth';
import { ActivityType } from '../enums/activity-type.enum';
import { Models } from '../entities/Models';
import { IncomingMessage } from 'http';
import tokenService from '../services/token.service';

export function ControllerActivity(object: { type: ActivityType, sourceName: Models.Table }) {
  return (target: Object, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) => {
    const method = descriptor.value;

    descriptor.value = function(...args) {
      const req: Request = args[0];

      const authorizationHeader = req.headers.authorization;
      const accessToken = authorizationHeader.split(' ')[1];
      const userData = tokenService.validateAccessToken(accessToken);

      const params = req.params;
      const body = req.body;

      const result = method.apply(this, args);

      activityService.createActivity({
        userId: userData.id,
        sourceId: result.id,
        sourceName: object.sourceName,
        date: +(new Date()),
        type: object.type,
        activities: JSON.stringify({
          request: {
            params,
            body
          }
        })
      }).then();

      return result;
    };
  };
}
