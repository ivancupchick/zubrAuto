import bcrypt from 'bcrypt';
import { v4 } from 'uuid';
// import mailService from './mail.service';
import tokenService from './token.service';
import { Models } from '../entities/Models';
import { ServerUser } from '../entities/User';
import { ApiError } from '../exceptions/api.error';
import userRepository from '../repositories/base/user.repository';
import { ServerRole } from '../entities/Role';
import { ServerAuth } from '../entities/Auth';
import roleRepository from '../repositories/base/role.repository';

class AuthService {
  async registration(email: string, password: string): Promise<ServerAuth.AuthGetResponse> {
    const existUser = await userRepository.findOne({ email: [email] })
    if (existUser) {
      throw ApiError.BadRequest(`User with ${email} exists`); // Error codes
    }

    const hashPassword = await bcrypt.hash(password, 3)
    const activationLink = v4();
    const customRoles = await roleRepository.getAll();
    const user: Models.User = await userRepository.create({
      email,
      isActivated: false,
      password: hashPassword,
      activationLink,
      roleLevel: ServerRole.System.None,
    });

    const payloadUser: ServerAuth.IPayload = {
      ...user,
      customRoleName: customRoles.find(cr => (cr.id + 1000) === user.roleLevel)?.systemName || '',
    }

    // await mailService.sendActivationMail(email, `${process.env.API_URL}/activate/`+activationLink); // need test
    const userPayload = new ServerAuth.Payload(payloadUser);

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

  async login(email, password): Promise<ServerAuth.AuthGetResponse> {
    const user = await userRepository.findOne({ email: [email] });
    if (!user) {
      throw ApiError.BadRequest('Пользователь с таким email не найден'); // Error codes
    }

    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest('Неверный пароль'); // Error codes
    }

    const customRoles = await roleRepository.getAll();
    const payloadUser: ServerAuth.IPayload = {
      ...user,
      customRoleName: customRoles.find(cr => (cr.id + 1000) === user.roleLevel)?.systemName || '',
    }

    const userPayload = new ServerAuth.Payload(payloadUser);
    const tokens = tokenService.generateTokens({...userPayload});
    await tokenService.saveToken(userPayload.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userPayload
    };
  }

  async logout(refreshToken: string) {
    const token: Models.UserToken = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken: string): Promise<ServerAuth.AuthGetResponse> {
    //
    const start = new Date().getTime();

    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }

    const userData: ServerAuth.Payload = tokenService.validateRefreshToken(refreshToken) as ServerAuth.Payload;
    const tokenFromDb  = await tokenService.findToken(refreshToken);

    // console.log(`refresh: start tokin refreshing for ${userData.id} user `);

    if (!userData || !tokenFromDb) {
      // const end = new Date().getTime();
      // console.log(`refresh: tokin refreshing for ${userData.id} user declined: ${end - start}ms`);
      throw ApiError.UnauthorizedError();
    }

    const user = await userRepository.findById(userData.id);
    const customRoles = await roleRepository.getAll();

    const userPayload = new ServerAuth.Payload({
      ...user,
      customRoleName: customRoles.find(cr => (cr.id + 1000) === user.roleLevel)?.systemName || '',
    });

    const tokens = tokenService.generateTokens({...userPayload});
    await tokenService.saveToken(userPayload.id, tokens.refreshToken);

    // const end = new Date().getTime();
    // console.log(`refresh: ${user.id}, ${user.email}: ${end - start}ms`);

    return {
      ...tokens,
      user: userPayload
    };
  }
}

export = new AuthService();
