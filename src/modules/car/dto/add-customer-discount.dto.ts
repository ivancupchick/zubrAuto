import { IsNumber } from 'class-validator';

export class AddCustomerDiscountDto {
  @IsNumber()
  discount: number;

  @IsNumber()
  amount: number
}
