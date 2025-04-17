// import { PartialType } from '@nestjs/mapped-types';
import { CreateCallRequestDto } from './create-call-request.dto';

// export class UpdateCallRequestDto extends PartialType(CreateCallRequestDto) {}

export type UpdateCallRequestDto = Partial<CreateCallRequestDto>;
