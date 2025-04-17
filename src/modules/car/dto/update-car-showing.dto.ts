import { IsNumber, IsObject, IsNotEmpty } from 'class-validator';

export class updateCarShowing {

  @IsNumber()
  @IsNotEmpty()
  showingId: number;

  @IsNumber()
  @IsObject()
  showingContent: object;
}
