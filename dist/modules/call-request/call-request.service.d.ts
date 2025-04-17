import { CreateCallRequestDto } from './dto/create-call-request.dto';
import { UpdateCallRequestDto } from './dto/update-call-request.dto';
import { Models } from 'src/temp/entities/Models';
import { PrismaService } from 'src/prisma/prisma.service';
import { StringHash } from 'src/temp/models/hashes';
import { SitesCallRequest } from 'src/temp/models/sites-call-request';
export declare class CallRequestService {
    private prisma;
    constructor(prisma: PrismaService);
    callRequest(sitesCallRequest: SitesCallRequest): Promise<{
        id: number;
        createdDate: bigint;
        source: string | null;
        comment: string | null;
        userId: number | null;
        originalNotification: string;
        innerNumber: string | null;
        clientNumber: string;
        isUsed: boolean;
    }>;
    create(createCallRequestDto: CreateCallRequestDto): Promise<string>;
    findAll(): Promise<any>;
    getCallRequests(requests: Models.CallRequest[]): Promise<Models.CallRequest[]>;
    findMany(query: StringHash): Promise<{
        list: Models.CallRequest[];
        total: number;
    }>;
    findOne(id: number): Promise<{
        id: number;
        createdDate: bigint;
        source: string | null;
        comment: string | null;
        userId: number | null;
        originalNotification: string;
        innerNumber: string | null;
        clientNumber: string;
        isUsed: boolean;
    }>;
    update(id: number, updateCallRequestDto: UpdateCallRequestDto): Promise<{
        id: number;
        createdDate: bigint;
        source: string | null;
        comment: string | null;
        userId: number | null;
        originalNotification: string;
        innerNumber: string | null;
        clientNumber: string;
        isUsed: boolean;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdDate: bigint;
        source: string | null;
        comment: string | null;
        userId: number | null;
        originalNotification: string;
        innerNumber: string | null;
        clientNumber: string;
        isUsed: boolean;
    }>;
}
