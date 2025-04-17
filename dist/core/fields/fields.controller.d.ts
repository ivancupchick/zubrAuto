import { FieldsService } from './fields.service';
import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';
import { FieldDomains } from './fields';
export declare class FieldsController {
    private readonly fieldsService;
    constructor(fieldsService: FieldsService);
    create(createFieldDto: CreateFieldDto): Promise<import("../../temp/entities/Models").Models.Field>;
    findAll(): Promise<import("../../temp/entities/Field").ServerField.Response[]>;
    findOne(id: string): Promise<{
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
    update(id: string, updateFieldDto: UpdateFieldDto): Promise<import("../../temp/entities/Models").Models.Field>;
    remove(id: string): Promise<{
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
