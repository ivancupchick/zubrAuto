import { ServerAuth } from 'src/temp/entities/Auth';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class TokenService {
    private prisma;
    constructor(prisma: PrismaService);
    generateTokens(payload: object): {
        accessToken: string;
        refreshToken: string;
    };
    static validateAccessToken(token: string): ServerAuth.Payload;
    decodeAccessToken(token: string): ServerAuth.Payload;
    validateRefreshToken(token: string): ServerAuth.Payload;
    saveToken(userId: number, refreshToken: string): Promise<{
        id: number;
        userId: number;
        refreshToken: string;
    }>;
    removeToken(refreshToken: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    findToken(refreshToken: string): Promise<{
        id: number;
        userId: number;
        refreshToken: string;
    }>;
}
