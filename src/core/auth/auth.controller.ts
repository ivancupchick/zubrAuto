import { Controller, Get, Post, Body, Param, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { REFRESH_TOKEN_MAX_AGE_MS } from '../constants/refresh-token-max-age.constant';
import { RegistationUserDto } from './dto/auth-registration.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registration')
  async registration(
    @Body() body: RegistationUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email, password } = body;
    const userData = await this.authService.registration(email, password);

    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
      httpOnly: true,
    }); // secure: true    if https

    return userData; // res.json(userData);
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email, password } = body;
    const userData = await this.authService.login(email, password);

    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
      httpOnly: true,
    }); // secure: true    if https
    return userData; // res.json(userData);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { refreshToken } = req.cookies;
    // const token =
    await this.authService.logout(refreshToken);
    res.clearCookie('refreshToken');
    return true; // res.json(true)
  }

  @Get('activate/:link') // TODO mail registration ?
  async activate(
    @Param() params: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const activationLink = params.link;
    await this.authService.activate(activationLink);
    return res.redirect(process.env.CLIENT_URL);
  }

  @Get('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('cookie', req.cookies);
    const { refreshToken } = req.cookies;
    console.log('refreshToken', refreshToken);
    const userData = await this.authService.refresh(refreshToken);

    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
      httpOnly: true,
    }); // secure: true    if https
    return userData; // res.json(userData);
  }
}
