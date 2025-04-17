import { Module } from '@nestjs/common';
import { ChangeLogService } from './change-log.service';
import { ChangeLogController } from './change-log.controller';

import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ChangeLogController],
  providers: [ChangeLogService],
  exports: [ChangeLogService],
})
export class ChangeLogModule {}
