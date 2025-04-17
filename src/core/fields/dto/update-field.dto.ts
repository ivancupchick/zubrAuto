import { PartialType } from '@nestjs/mapped-types';
import { CreateFieldDto } from './create-field.dto';

export interface UpdateFieldDto extends Partial<CreateFieldDto> {}
