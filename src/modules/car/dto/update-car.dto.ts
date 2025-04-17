import { PartialType } from '@nestjs/mapped-types';
import { CreateCarDto } from './create-car.dto';
import { ServerCar } from 'src/temp/entities/Car';

// export class UpdateCarDto extends PartialType(CreateCarDto) {}

export type UpdateCarDto = ServerCar.UpdateRequest;
