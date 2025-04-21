import { ServerField } from 'src/temp/entities/field';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Models } from 'src/temp/entities/Models';
import { FieldDomains } from '../fields';

export class CreateFieldDto implements ServerField.CreateRequest {
  accesses?: (Pick<Models.FieldAccess, 'sourceId' | 'access'> & {
    domain: FieldDomains;
  })[];
  type: number;

  @Length(3, 50)
  @Matches(/^[a-z][a-z-]{1,50}[a-z]$/)
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  flags: number;

  @IsNumber()
  domain: number;

  @IsString()
  variants: string;

  @IsNumber()
  showUserLevel: number;
}
