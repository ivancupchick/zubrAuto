import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FieldDomains } from './fields';
import { ServerField } from 'src/temp/entities/Field';
import { Models } from 'src/temp/entities/Models';
import { FieldChainService } from './services/field-chain.service';
export declare class FieldsService {
    private prisma;
    private fieldChainService;
    constructor(prisma: PrismaService, fieldChainService: FieldChainService);
    create(createFieldDto: CreateFieldDto): Promise<Models.Field>;
    findAll(): Promise<ServerField.Response[]>;
    findOne(id: number): Promise<{
        accesses: {
            id: number;
            fieldId: number;
            sourceId: number;
            domain: FieldDomains;
            access: number;
        }[];
        id: number;
        name: string | null;
        flags: number;
        type: number;
        domain: number;
        variants: string;
        showUserLevel: number;
    }>;
    update(id: number, updateFieldDto: UpdateFieldDto): Promise<Models.Field>;
    remove(id: number): Promise<{
        id: number;
        name: string | null;
        flags: number;
        type: number;
        domain: number;
        variants: string;
        showUserLevel: number;
    }>;
    getFieldsByDomain(domain: FieldDomains): Promise<{
        accesses: {
            id: number;
            fieldId: number;
            sourceId: number;
            domain: FieldDomains;
            access: number;
        }[];
        id: number;
        name: string | null;
        flags: number;
        type: number;
        domain: number;
        variants: string;
        showUserLevel: number;
    }[]>;
}
