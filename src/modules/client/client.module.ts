import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FieldsModule } from 'src/core/fields/fields.module';
import { AuthModule } from 'src/core/auth/auth.module';
import { ChangeLogModule } from '../change-log/change-log.module';

@Module({
  imports: [PrismaModule, FieldsModule, AuthModule, ChangeLogModule],
  controllers: [ClientController],
  providers: [ClientService],
})
export class ClientModule {}
