import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { PrismaModule } from 'src/prisma/prisma.module';
import { TokenService } from './token.service';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, TokenService],
  exports: [TokenService],
})
export class AuthModule {}
