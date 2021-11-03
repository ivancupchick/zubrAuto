import bcrypt from 'bcrypt';
import { v4 } from 'uuid';
import mailService from './mail.service';
import tokenService from './token.service';
import { Models } from '../entities/Models';
import { ServerUser } from '../entities/User';
import { ApiError } from '../exceptions/api.error';
import userRepository from '../repositories/base/user.repository';
import { ServerRole } from '../entities/Role';
import { ServerAuth } from '../entities/Auth';

class AuthService {
  async registration(email: string, password: string) {
    const existUser = await userRepository.findOne({ email: [email] })
    if (existUser) {
      throw ApiError.BadRequest(`User with ${email} exists`); // Error codes
    }

    const hashPassword = await bcrypt.hash(password, 3)
    const activationLink = v4();
    const user: Models.User = await userRepository.create({
      email,
      isActivated: false,
      password: hashPassword,
      activationLink,
      roleLevel: ServerRole.System.None,
    });

    await mailService.sendActivationMail(email, `${process.env.API_URL}/activate/`+activationLink); // need test
    const userPayload = new ServerAuth.Payload(user);

    const tokens = tokenService.generateTokens({...userPayload});
    await tokenService.saveToken(userPayload.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userPayload
    };
  }

  async activate(activationLink: string) {
    const existUser = await userRepository.findOne({ activationLink: [activationLink] })

    if (!existUser) {
      throw ApiError.BadRequest(`User not exists`); // Error codes
    }

    (existUser as any).isActivated = true;
    userRepository.updateById(existUser.id, existUser);
  }

  async login(email, password) {
    const user = await userRepository.findOne({ email: [email] });
    if (!user) {
      throw ApiError.BadRequest('Пользователь с таким email не найден'); // Error codes
    }

    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest('Неверный пароль'); // Error codes
    }

    const userPayload = new ServerAuth.Payload(user);
    const tokens = tokenService.generateTokens({...userPayload});
    await tokenService.saveToken(userPayload.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userPayload
    };
  }

  async logout(refreshToken: string) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }

    const userData: ServerAuth.Payload = tokenService.validateRefreshToken(refreshToken) as ServerAuth.Payload;
    const tokenFromDb  = await tokenService.findToken(refreshToken);

    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }

    const user = await userRepository.findById(userData.id);
    const userPayload = new ServerAuth.Payload(user);
    const tokens = tokenService.generateTokens({...userPayload});
    await tokenService.saveToken(userPayload.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userPayload
    };
  }

  // replace to other service
  async getAllUsers() {
    const users: Models.User[] = await userRepository.getAll();
    return users;
  }
}

export = new AuthService();
