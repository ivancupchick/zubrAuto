import { FieldDomains } from '../fields';
import { StringHash } from 'src/temp/models/hashes';
import { PrismaService } from 'src/prisma/prisma.service';
import { Models } from 'src/temp/entities/Models';
import { Prisma } from '@prisma/client';
export declare class FieldChainService {
    private prisma;
    constructor(prisma: PrismaService);
    findMany(where: Prisma.fieldIdsWhereInput & Prisma.longtextFieldsIdsWhereInput, sortOrder?: Prisma.SortOrder): Promise<Models.FieldChain[]>;
    update(data: Prisma.fieldIdsUpdateInput & Prisma.longtextFieldsIdsUpdateInput, where: Prisma.fieldIdsWhereInput & Prisma.longtextFieldsIdsWhereInput): Promise<Prisma.BatchPayload>;
    findOne(where: Prisma.fieldIdsWhereInput & Prisma.longtextFieldsIdsWhereInput): Promise<Models.FieldChain>;
    deleteMany(payload: Prisma.fieldIdsWhereInput & Prisma.longtextFieldsIdsWhereInput): Promise<Prisma.BatchPayload>;
    create(fieldChainData: Omit<Models.FieldChain, 'id'>): Promise<Models.FieldChain>;
    updateById(id: number, fieldId: number, fieldChainData: Prisma.fieldIdsUpdateInput | Prisma.longtextFieldsIdsUpdateInput): Promise<any>;
    getFieldChain(fieldId: number, id: number): Promise<any>;
    getEntityIdsByQuery(sourceName: Models.Table, entityDomain: FieldDomains, query: StringHash): Promise<string[]>;
}
