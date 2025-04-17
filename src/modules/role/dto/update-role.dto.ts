import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';

export type UpdateRoleDto = Partial<CreateRoleDto>;

// export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
