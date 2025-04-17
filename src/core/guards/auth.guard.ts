import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { ApiError } from '../exceptions/api.error';
import { TokenService } from '../auth/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    if (+process.env.UNSECURE_AUTH) {
      return true;
    }

    try {
      const authorizationHeader = request.headers.authorization;
      if (!authorizationHeader) {
        throw ApiError.UnauthorizedError();
      }

      const accessToken = authorizationHeader.split(' ')[1];
      if (!accessToken) {
        throw ApiError.UnauthorizedError();
      }

      const userData = TokenService.validateAccessToken(accessToken);

      if (!userData) {
        throw ApiError.UnauthorizedError();
      }

      return true;
    } catch (e) {
      throw ApiError.UnauthorizedError();
    }
  }
}
