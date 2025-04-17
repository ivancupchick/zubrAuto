import { IsNotEmpty, IsNumber } from 'class-validator';

export class CompleteDealDto {
  @IsNumber()
  @IsNotEmpty()
  clientId: number;

  @IsNumber()
  @IsNotEmpty()
  carId: number
}
