import { ChangeLogService } from './change-log.service';
import { CreateChangeLogDto } from './dto/create-change-log.dto';
import { UpdateChangeLogDto } from './dto/update-change-log.dto';
export declare class ChangeLogController {
    private readonly changeLogService;
    constructor(changeLogService: ChangeLogService);
    create(createChangeLogDto: CreateChangeLogDto): Promise<{
        activities: string;
        sourceId: number;
        id: number;
        sourceName: string;
        type: string;
        date: bigint;
        userId: number;
    }>;
    findAll(query: any): Promise<any>;
    findOne(id: string): Promise<{
        activities: string;
        sourceId: number;
        id: number;
        sourceName: string;
        type: string;
        date: bigint;
        userId: number;
    }>;
    update(id: string, updateChangeLogDto: UpdateChangeLogDto): Promise<{
        activities: string;
        sourceId: number;
        id: number;
        sourceName: string;
        type: string;
        date: bigint;
        userId: number;
    }>;
}
