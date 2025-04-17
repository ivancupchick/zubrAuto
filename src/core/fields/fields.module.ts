import { Module } from '@nestjs/common';
import { FieldsService } from './fields.service';
import { FieldsController } from './fields.controller';
import { FieldChainService } from './services/field-chain.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FieldsController],
  providers: [FieldsService, FieldChainService],
  exports: [FieldChainService, FieldsService],
})
export class FieldsModule {}
