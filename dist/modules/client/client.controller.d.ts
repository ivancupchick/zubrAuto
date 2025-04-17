import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CompleteDealDto } from './dto/complete-deal.dto';
export declare class ClientController {
    private readonly clientService;
    constructor(clientService: ClientService);
    create(createClientDto: CreateClientDto): Promise<{
        id: number;
        carIds: string;
    }>;
    findAll(query: any): Promise<{
        list: import("./entities/client.entity").ClientResponse[];
        total: number;
    }>;
    findOne(id: string): Promise<import("../../temp/entities/client").ServerClient.Response>;
    update(id: string, updateClientDto: UpdateClientDto): Promise<{
        id: number;
        carIds: string;
    }>;
    remove(id: string): Promise<{
        id: number;
        carIds: string;
    }>;
    completeDeal(dto: CompleteDealDto): Promise<[any, any]>;
}
