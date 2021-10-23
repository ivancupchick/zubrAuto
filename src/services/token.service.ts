import jwt, { JwtPayload } from 'jsonwebtoken';
import { Models } from '../entities/Models';
import { ServerUser } from '../entities/User';
import userTokenRepository from '../repositories/base/user-token.repository';

// TODO! only one session can exist

class TokenService {
  generateTokens(payload: object) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '30m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
    return {
      accessToken,
      refreshToken
    };
  }

  validateAccessToken(token: string) { 
    try {
      const userData: ServerUser.Payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET) as ServerUser.Payload;
      return userData;
    } catch (e) {
      return null;
    }
  }

  validateRefreshToken(token: string) {
    try {
       // ServerUser.Payload
       const userData: ServerUser.Payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET) as ServerUser.Payload;
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
      id: 0, // will be deleted in DAO
      userId,
      refreshToken
    });

    return token;
  }

  async removeToken(refreshToken: string) {
    const tokenData = userTokenRepository.deleteOne({refreshToken: [`${refreshToken}`]})
    return tokenData;
  }

  async findToken(refreshToken: string) {
    const tokenData = userTokenRepository.findOne({refreshToken: [`${refreshToken}`]})
    return tokenData;
  }
}

export = new TokenService();
