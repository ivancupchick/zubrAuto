import { CreateChangeLogDto } from './dto/create-change-log.dto';
import { UpdateChangeLogDto } from './dto/update-change-log.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ServerActivity } from 'src/temp/entities/Activity';
import { Models } from 'src/temp/entities/Models';
import { StringHash } from 'src/temp/models/hashes';
export declare class ChangeLogService {
    private prisma;
    constructor(prisma: PrismaService);
    createActivity(createChangeLogDto: CreateChangeLogDto): Promise<ServerActivity.Response>;
    findAll(): Promise<any>;
    getEntities(requests: Models.Activity[]): Promise<Models.Activity[]>;
    findMany(query: StringHash): Promise<{
        list: Models.Activity[];
        total: number;
    }>;
    create(createChangeLogDto: CreateChangeLogDto): Promise<{
        activities: string;
        sourceId: number;
        id: number;
        sourceName: string;
        type: string;
        date: bigint;
        userId: number;
    }>;
    findOne(id: number): Promise<{
        activities: string;
        sourceId: number;
        id: number;
        sourceName: string;
        type: string;
        date: bigint;
        userId: number;
    }>;
    update(id: number, updateChangeLogDto: UpdateChangeLogDto): Promise<{
        activities: string;
        sourceId: number;
        id: number;
        sourceName: string;
        type: string;
        date: bigint;
        userId: number;
    }>;
    remove(id: number): Promise<void>;
}
