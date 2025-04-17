import { CallRequestService } from './call-request.service';
import { UpdateCallRequestDto } from './dto/update-call-request.dto';
import { SitesCallRequest } from 'src/temp/models/sites-call-request';
export declare class CallRequestController {
    private readonly callRequestService;
    constructor(callRequestService: CallRequestService);
    callRequest(callRequest: SitesCallRequest): Promise<{
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
    findAll(query: any): Promise<any>;
    findOne(id: string): Promise<{
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
    update(id: string, updateCallRequestDto: UpdateCallRequestDto): Promise<{
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
    remove(id: string): Promise<{
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
