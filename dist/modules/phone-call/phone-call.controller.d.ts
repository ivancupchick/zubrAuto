import { PhoneCallService } from './phone-call.service';
import { CreatePhoneCallDto } from './dto/create-phone-call.dto';
import { UpdatePhoneCallDto } from './dto/update-phone-call.dto';
export declare class PhoneCallController {
    private readonly phoneCallService;
    constructor(phoneCallService: PhoneCallService);
    create(createPhoneCallDto: CreatePhoneCallDto): string;
    findAll(query: any): Promise<any>;
    findOne(id: string): Promise<{
        id: number;
        type: string;
        createdDate: bigint;
        status: string | null;
        userId: number | null;
        innerNumber: string;
        clientNumber: string;
        isUsed: boolean;
        originalNotifications: string;
        originalDate: string;
        uuid: string;
        isFinished: boolean | null;
        recordUrl: string | null;
    }>;
    update(id: string, updatePhoneCallDto: UpdatePhoneCallDto): Promise<{
        id: number;
        type: string;
        createdDate: bigint;
        status: string | null;
        userId: number | null;
        innerNumber: string;
        clientNumber: string;
        isUsed: boolean;
        originalNotifications: string;
        originalDate: string;
        uuid: string;
        isFinished: boolean | null;
        recordUrl: string | null;
    }>;
    remove(id: string): Promise<{
        id: number;
        type: string;
        createdDate: bigint;
        status: string | null;
        userId: number | null;
        innerNumber: string;
        clientNumber: string;
        isUsed: boolean;
        originalNotifications: string;
        originalDate: string;
        uuid: string;
        isFinished: boolean | null;
        recordUrl: string | null;
    }>;
    webHookNotify(body: string | Object): Promise<import("../../temp/entities/PhoneCall").ServerPhoneCall.IdResponse>;
}
