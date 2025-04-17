import { IsArray } from 'class-validator';

export class CarRemoveDto {
  @IsArray()
  carIds: [];
}
