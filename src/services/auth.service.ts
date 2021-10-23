import bcrypt from 'bcrypt';
import uuid from 'uuid';
import mailService from './mail.service';
import tokenService from './token.service';
import { Models } from '../entities/Models';
import { ServerUser, SystemRole } from '../entities/User';
import { ApiError } from '../exceptions/api.error';
import userRepository from '../repositories/base/user.repository';

class AuthService {
  async registration(email: string, password: string) {
    const existUser = await userRepository.findOne({ email: [email] })
    if (existUser) {
      throw ApiError.BadRequest(`User with ${email} exists`); // Error codes
    }

    const hashPassword = await bcrypt.hash(password, 3)
    const activationLink = uuid.v4();
    const user: Models.User = await userRepository.create({ 
      id: 0, // will be deleted in DAO
      email, 
      isActivated: false,
      password: hashPassword, 
      activationLink,
      roleLevel: SystemRole.SuperAdmin,
    });

    await mailService.sendActivationMail(email, `${process.env.API_URL}/activate/`+activationLink);
    const userPayload = new ServerUser.Payload(user);

    const tokens = tokenService.generateTokens({...userPayload});
    await tokenService.saveToken(userPayload.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userPayload
    };
  }

  async activate(activateLink: string) {
    const existUser = await userRepository.findOne({ activateLink: [activateLink] })

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

    const userPayload = new ServerUser.Payload(user);
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

    const userData: ServerUser.Payload = tokenService.validateRefreshToken(refreshToken) as ServerUser.Payload;
    const tokenFromDb  = await tokenService.findToken(refreshToken);

    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }

    const user = await userRepository.findById(userData.id);
    const userPayload = new ServerUser.Payload(user);
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
