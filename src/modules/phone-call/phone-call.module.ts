import { Module } from '@nestjs/common';
import { PhoneCallService } from './phone-call.service';
import { PhoneCallController } from './phone-call.controller';

import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PhoneCallController],
  providers: [PhoneCallService],
})
export class PhoneCallModule {}
