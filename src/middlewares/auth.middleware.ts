import { Request, Response, NextFunction } from "express";
import { ApiError } from "../exceptions/api.error";
import tokenService from "../services/token.service";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
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

    const userData = tokenService.validateAccessToken(accessToken);

    if (!userData) {
      return next(ApiError.UnauthorizedError());
    }

    next();
  } catch (e) {
    console.log(e);
    return next(ApiError.UnauthorizedError())
  }
}
