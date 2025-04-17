import { Request } from 'express'
import { Models } from 'src/temp/entities/Models';
import { ActivityType } from '../enums/activity-type.enum';
import { ChangeLogService } from 'src/modules/change-log/change-log.service';
import { TokenService } from '../auth/token.service';
import { Inject, SetMetadata } from '@nestjs/common';

export function ControllerActivity(object: { type: ActivityType, sourceName: Models.Table }) { // TODO fix in all places for nest // TODO check
  const injectTokenService = Inject(TokenService);
  const injectChangeLogService = Inject(ChangeLogService);

  return (target: Object, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) => {
    injectTokenService(target, 'tokenService');
    injectChangeLogService(target, 'changeLogService');

    const method = descriptor.value;

    descriptor.value = function(...args) {
      const tokenService: TokenService = this.tokenService;
      const changeLogService: ChangeLogService = this.changeLogService;

      const req: Request = args[0];

      const authorizationHeader = req.headers.authorization;
      const accessToken = authorizationHeader.split(' ')[1];
      const userData = tokenService.decodeAccessToken(accessToken);

      const params = req.params;
      const body = req.body;

      const result = method.apply(this, args);

      result.then(res => {
        changeLogService.createActivity({
          userId: userData?.id || 0,
          sourceId: res?.id || res?.clientId || 0,
          sourceName: object.sourceName,
          date: BigInt(+(new Date())),
          type: object.type,
          activities: JSON.stringify({
            request: {
              params,
              body
            }
          })
        }).then();
      });

      return result;
    };
  };
}


// export const CustomControllerActivity = (...args: string[]) => SetMetadata('decorators', args);
