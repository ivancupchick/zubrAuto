import { PrismaService } from 'src/prisma/prisma.service';
import { ServerAuth } from 'src/temp/entities/Auth';
import { TokenService } from './token.service';
export declare class AuthService {
    private prisma;
    private tokenService;
    constructor(prisma: PrismaService, tokenService: TokenService);
    registration(email: string, password: string): Promise<ServerAuth.AuthGetResponse>;
    activate(activationLink: string): Promise<void>;
    login(email: any, password: any): Promise<ServerAuth.AuthGetResponse>;
    logout(refreshToken: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    refresh(refreshToken: string): Promise<ServerAuth.AuthGetResponse>;
}
