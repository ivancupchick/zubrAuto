import { CreateClientDto } from './create-client.dto';

export interface UpdateClientDto extends Partial<CreateClientDto> {}

// export class UpdateClientDto extends PartialType(CreateClientDto) {}
