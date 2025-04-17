import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientResponse } from './entities/client.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { FieldsService } from 'src/core/fields/fields.service';
import { FieldResponse } from 'src/core/fields/entities/field.entity';
import { StringHash } from 'src/temp/models/hashes';
import { FieldChainService } from 'src/core/fields/services/field-chain.service';
import { ServerClient } from 'src/temp/entities/client';
export declare class ClientService {
    private prisma;
    private fieldsService;
    private fieldChainService;
    constructor(prisma: PrismaService, fieldsService: FieldsService, fieldChainService: FieldChainService);
    create(createClientDto: CreateClientDto): Promise<{
        id: number;
        carIds: string;
    }>;
    findAll(): Promise<{
        list: ClientResponse[];
        total: number;
    }>;
    findMany(query: StringHash): Promise<{
        list: ClientResponse[];
        total: number;
    }>;
    getClients(clients: {
        id: number;
        carIds: string;
    }[], clientsFields: FieldResponse[]): Promise<ClientResponse[]>;
    findOne(id: number): Promise<ServerClient.Response>;
    update(id: number, updateClientDto: UpdateClientDto): Promise<{
        id: number;
        carIds: string;
    }>;
    remove(id: number): Promise<{
        id: number;
        carIds: string;
    }>;
    completeDeal(clientId: number, carId: number): Promise<[any, any]>;
}
