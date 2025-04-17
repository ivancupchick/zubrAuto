import { Module } from '@nestjs/common';
import { CarService } from './car.service';
import { CarController } from './car.controller';
import { CarImageService } from './services/car-image.service';
import { CarStatisticService } from './services/car-statistic.service';
import { CarInfoGetterService } from './services/car-info-getter.service';
import { S3Service } from 'src/core/files/services/s3.service';
import { CarFunctionsController } from './car-functions.cotroller';

import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { FieldsModule } from 'src/core/fields/fields.module';

@Module({
  imports: [PrismaModule, UserModule, FieldsModule],
  controllers: [CarController, CarFunctionsController],
  providers: [CarService, CarImageService, CarStatisticService, CarInfoGetterService, S3Service], // TODO S3 service here or not?
})
export class CarModule {}
