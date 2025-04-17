import { FieldDomains } from "../../core/fields/fields";
import { Models } from "./Models";
import { RequireAtLeastOne } from "./Types";
export declare namespace RealField {
    type Response = Models.Field & {
        value: string;
    };
    type Request = {
        id: number;
        name: string;
        value: string;
    };
    namespace With {
        type Response = {
            fields: RealField.Response[];
        };
        type Request = {
            fields: RealField.Request[];
        };
    }
}
export declare namespace ServerField {
    type Access = Pick<Models.FieldAccess, 'sourceId' | 'access'> & {
        domain: FieldDomains;
    };
    type WithAccesses = {
        accesses: Access[];
    };
    export type CreateRequest = Partial<WithAccesses> & Omit<Models.Field, 'id'>;
    export type UpdateRequest = RequireAtLeastOne<WithAccesses & Omit<Models.Field, 'id'>>;
    export type Response = WithAccesses & Models.Field;
    export type IdResponse = Pick<Models.Field, 'id'>;
    export {};
}
export declare function getTableNameByDomain(domain: FieldDomains): string;
