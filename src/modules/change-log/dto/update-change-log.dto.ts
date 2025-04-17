import { PartialType } from '@nestjs/mapped-types';
import { CreateChangeLogDto } from './create-change-log.dto';

// export class UpdateChangeLogDto extends PartialType(CreateChangeLogDto) {}
export interface UpdateChangeLogDto extends Partial<CreateChangeLogDto> {}
