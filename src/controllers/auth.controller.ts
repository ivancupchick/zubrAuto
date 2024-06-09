import { NextFunction, Request, Response } from 'express'
import authService from '../services/auth.service';
import { validationResult } from 'express-validator';
import { ApiError } from '../exceptions/api.error';
import { REFRESH_TOKEN_MAX_AGE_MS } from '../constants/refresh-token-max-age.constant';

class AuthConntroller {
  async registration(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }

      const {email, password} = req.body;
      const userData = await authService.registration(email, password);

      res.cookie('refreshToken', userData.refreshToken, { maxAge: REFRESH_TOKEN_MAX_AGE_MS, httpOnly: true }) // secure: true    if https

      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const {email, password} = req.body;
      const userData = await authService.login(email, password);

      res.cookie('refreshToken', userData.refreshToken, { maxAge: REFRESH_TOKEN_MAX_AGE_MS, httpOnly: true }) // secure: true    if https
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      const token = await authService.logout(refreshToken);
      res.clearCookie('refreshToken');
      return res.json(true);
    } catch (e) {
      next(e);
    }
  }

  async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const activationLink = req.params.link;
      await authService.activate(activationLink);
      return res.redirect(process.env.CLIENT_URL)
    } catch (e) {
      next(e);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      const userData = await authService.refresh(refreshToken);

      res.cookie('refreshToken', userData.refreshToken, { maxAge: REFRESH_TOKEN_MAX_AGE_MS, httpOnly: true }) // secure: true    if https
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }
}

export = new AuthConntroller();
