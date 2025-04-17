import { Injectable, NestMiddleware } from '@nestjs/common';
import { TokenService } from 'src/core/auth/token.service';
import { ApiError } from 'src/core/exceptions/api.error';

@Injectable() // TODO refactor to Guard
export class AuthMiddleware implements NestMiddleware {
  use(req: any, res: any, next: (error?: Error) => void) {
    if (+process.env.UNSECURE_AUTH) {
      return next();
    }

    try {
      const authorizationHeader = req.headers.authorization;
      if (!authorizationHeader) {
        return next(ApiError.UnauthorizedError());
      }

      const accessToken = authorizationHeader.split(' ')[1];
      if (!accessToken) {
        return next(ApiError.UnauthorizedError());
      }

      const userData = TokenService.validateAccessToken(accessToken);

      if (!userData) {
        return next(ApiError.UnauthorizedError());
      }

      next();
    } catch (e) {
      // console.log(e);
      return next(ApiError.UnauthorizedError())
    }
  }
}
