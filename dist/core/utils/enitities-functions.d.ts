import { Prisma } from "@prisma/client";
import { StringHash } from "src/temp/models/hashes";
type NaturalDelegate = Prisma.activitiesDelegate | Prisma.callRequestsDelegate | Prisma.phoneCallsDelegate | Prisma.usersDelegate;
export declare class BaseQuery {
    page: number;
    size: number;
    sortOrder: Prisma.SortOrder;
    sortField: string;
}
export declare function getEntityIdsByNaturalQuery<T extends {
    id: number;
}>(repository: NaturalDelegate, query: StringHash<any>): Promise<number[]>;
export {};
