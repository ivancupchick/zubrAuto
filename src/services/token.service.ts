import { sign, verify, decode } from 'jsonwebtoken';
import { ServerAuth } from '../entities/Auth';
import { ServerUser } from '../entities/User';
import userTokenRepository from '../repositories/base/user-token.repository';
import { REFRESH_TOKEN_MAX_AGE_MS } from '../constants/refresh-token-max-age.constant';

// TODO! only one session can exist

class TokenService {
  generateTokens(payload: object) {
    const accessToken = sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_MAX_AGE_MS }); // change to 5d

    return {
      accessToken,
      refreshToken
    };
  }

  validateAccessToken(token: string) {
    try {
      const userData: ServerAuth.Payload = verify(token, process.env.JWT_ACCESS_SECRET) as ServerAuth.Payload;
      return userData;
    } catch (e) {
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
       const userData: ServerAuth.Payload = verify(token, process.env.JWT_REFRESH_SECRET) as ServerAuth.Payload;
       return userData;
    } catch (e) {
      return null;
    }
  }

  async saveToken(userId: number, refreshToken: string) {
    const tokenData = await userTokenRepository.findOne({userId: [`${userId}`]});
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return await userTokenRepository.updateById(tokenData.id, tokenData);
    }

    const token = await userTokenRepository.create({
      userId,
      refreshToken
    });

    return token;
  }

  async removeToken(refreshToken: string) {
    const tokenData = userTokenRepository.delete({refreshToken: [`${refreshToken}`]})
    return tokenData[0];
  }

  async findToken(refreshToken: string) {
    const tokenData = userTokenRepository.findOne({refreshToken: [`${refreshToken}`]})
    return tokenData;
  }
}

export = new TokenService();
