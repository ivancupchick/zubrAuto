import { CreatePhoneCallDto } from './dto/create-phone-call.dto';
import { UpdatePhoneCallDto } from './dto/update-phone-call.dto';
import { Webhook } from 'src/temp/models/webhook';
import { ServerPhoneCall } from 'src/temp/entities/PhoneCall';
import { PrismaService } from 'src/prisma/prisma.service';
import { Models } from 'src/temp/entities/Models';
import { StringHash } from 'src/temp/models/hashes';
export declare class PhoneCallService {
    private prisma;
    constructor(prisma: PrismaService);
    webHookNotify(webhook: Webhook.Notification): Promise<ServerPhoneCall.IdResponse>;
    findAll(): Promise<any>;
    getEntities(entities: Models.PhoneCall[]): Promise<Models.PhoneCall[]>;
    findMany(query: StringHash): Promise<{
        list: Models.PhoneCall[];
        total: number;
    }>;
    create(createPhoneCallDto: CreatePhoneCallDto): string;
    findOne(id: number): Promise<{
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
    update(id: number, updatePhoneCallDto: UpdatePhoneCallDto): Promise<{
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
    remove(id: number): Promise<{
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
}
