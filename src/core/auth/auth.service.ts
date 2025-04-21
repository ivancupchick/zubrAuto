import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ServerAuth } from 'src/temp/entities/Auth';
import { ApiError } from '../exceptions/api.error';
import { v4 } from 'uuid';
import { ServerRole } from 'src/temp/entities/Role';
import { Models } from 'src/temp/entities/Models';
import { TokenService } from './token.service';
import { compare, hash } from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private tokenService: TokenService) {}

  async registration(email: string, password: string): Promise<ServerAuth.AuthGetResponse> {
    const existUser = await this.prisma.users.findFirst({ where: { email: email }})
    if (existUser) {
      throw ApiError.BadRequest(`User with ${email} exists`); // Error codes
    }

    const hashPassword = await hash(password, 3)
    const activationLink = v4();
    const customRoles = await this.prisma.roles.findMany();
    const user: Models.User = await this.prisma.users.create({ data: {
      email,
      isActivated: false,
      password: hashPassword,
      activationLink,
      roleLevel: ServerRole.System.None,
      deleted: false,
    }});

    const payloadUser: ServerAuth.IPayload = {
      ...user,
      customRoleName: customRoles.find(cr => (cr.id + 1000) === user.roleLevel)?.systemName || '',
    }

    // await mailService.sendActivationMail(email, `${process.env.API_URL}/activate/`+activationLink); // need test
    const userPayload = new ServerAuth.Payload(payloadUser);

    const tokens = this.tokenService.generateTokens({...userPayload});
    await this.tokenService.saveToken(userPayload.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userPayload
    };
  }

  async activate(activationLink: string) {
    const existUser = await this.prisma.users.findFirst({where:{ activationLink: activationLink }})

    if (!existUser) {
      throw ApiError.BadRequest(`User not exists`); // Error codes
    }

    (existUser as any).isActivated = true;
    this.prisma.users.update({where:{id:existUser.id}, data:existUser});
  }

  async login(email, password): Promise<ServerAuth.AuthGetResponse> {
    const user = await this.prisma.users.findFirst({where:{ email: email }});
    if (!user) {
      throw ApiError.BadRequest('Пользователь с таким email не найден'); // Error codes
    }

    const isPassEquals = await compare(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest('Неверный пароль'); // Error codes
    }

    const customRoles = await this.prisma.roles.findMany();
    const payloadUser: ServerAuth.IPayload = {
      ...user,
      customRoleName: customRoles.find(cr => (cr.id + 1000) === user.roleLevel)?.systemName || '',
    }

    const userPayload = new ServerAuth.Payload(payloadUser);
    const tokens = this.tokenService.generateTokens({...userPayload});
    await this.tokenService.saveToken(userPayload.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userPayload
    };
  }

  async logout(refreshToken: string) {
    return await this.tokenService.removeToken(refreshToken);
  }

  async refresh(refreshToken: string): Promise<ServerAuth.AuthGetResponse> {
    // const start = new Date().getTime();

    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }

    const userData: ServerAuth.Payload = this.tokenService.validateRefreshToken(refreshToken) as ServerAuth.Payload;
    const tokenFromDb = await this.prisma.userTokens.findFirst({ where: { refreshToken: refreshToken }});

    // console.log(`refresh: start tokin refreshing for ${userData.id} user `);

    if (!userData || !tokenFromDb) {
      // const end = new Date().getTime();
      // console.log(`refresh: tokin refreshing for ${userData.id} user declined: ${end - start}ms`);
      throw ApiError.UnauthorizedError();
    }

    const user = await this.prisma.users.findUnique({where:{id:userData.id}});
    const customRoles = await this.prisma.roles.findMany();

    const userPayload = new ServerAuth.Payload({
      ...user,
      customRoleName: customRoles.find(cr => (cr.id + 1000) === user.roleLevel)?.systemName || '',
    });

    const tokens = this.tokenService.generateTokens({...userPayload});
    await this.tokenService.saveToken(userPayload.id, tokens.refreshToken);

    // const end = new Date().getTime();
    // console.log(`refresh: ${user.id}, ${user.email}: ${end - start}ms`);

    return {
      ...tokens,
      user: userPayload
    };
  }
}
