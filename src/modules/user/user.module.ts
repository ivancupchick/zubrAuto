import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';

import { PrismaModule } from 'src/prisma/prisma.module';
import { FieldsModule } from 'src/core/fields/fields.module';

@Module({
  imports: [PrismaModule, FieldsModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
