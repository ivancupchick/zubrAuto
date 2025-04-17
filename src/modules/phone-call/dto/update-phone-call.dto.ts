import { PartialType } from '@nestjs/mapped-types';
import { CreatePhoneCallDto } from './create-phone-call.dto';

export class UpdatePhoneCallDto extends PartialType(CreatePhoneCallDto) {}
