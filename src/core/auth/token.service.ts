import { Injectable } from '@nestjs/common';
import { ServerAuth } from 'src/temp/entities/Auth';
import { sign, verify, decode } from 'jsonwebtoken';
import { REFRESH_TOKEN_MAX_AGE_MS } from '../constants/refresh-token-max-age.constant';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TokenService {
  constructor(private prisma: PrismaService) {}

  generateTokens(payload: object) {
    const accessToken = sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: '15m',
    });
    const refreshToken = sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  static validateAccessToken(token: string) {
    try {
      const userData: ServerAuth.Payload = verify(
        token,
        process.env.JWT_ACCESS_SECRET,
      ) as ServerAuth.Payload;
      return userData;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  decodeAccessToken(token: string) {
    try {
      const userData: ServerAuth.Payload = decode(token) as ServerAuth.Payload;
      return userData;
    } catch (e) {
      return null;
    }
  }

  validateRefreshToken(token: string) {
    try {
      const userData: ServerAuth.Payload = verify(
        token,
        process.env.JWT_REFRESH_SECRET,
      ) as ServerAuth.Payload;
      return userData;
    } catch (e) {
      return null;
    }
  }

  async saveToken(userId: number, refreshToken: string) {
    const tokenData = await this.prisma.userTokens.findFirst({
      where: { userId: userId },
    });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return await this.prisma.userTokens.update({
        where: { id: tokenData.id },
        data: tokenData,
      });
    }

    const token = await this.prisma.userTokens.create({
      data: {
        userId,
        refreshToken,
      },
    });

    return token;
  }

  async removeToken(refreshToken: string) {
    return await this.prisma.userTokens.deleteMany({ where: { refreshToken } });
  }

  async findToken(refreshToken: string) {
    return await this.prisma.userTokens.findFirst({
      where: { refreshToken: refreshToken },
    });
  }
}
