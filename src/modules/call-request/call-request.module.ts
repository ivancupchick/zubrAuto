import { Module } from '@nestjs/common';
import { CallRequestService } from './call-request.service';
import { CallRequestController } from './call-request.controller';

import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CallRequestController],
  providers: [CallRequestService],
})
export class CallRequestModule {}
