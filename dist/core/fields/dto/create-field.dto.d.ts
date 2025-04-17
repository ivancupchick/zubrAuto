import { ServerField } from "src/temp/entities/field";
import { Models } from "src/temp/entities/Models";
import { FieldDomains } from "../fields";
export declare class CreateFieldDto implements ServerField.CreateRequest {
    accesses?: (Pick<Models.FieldAccess, "sourceId" | "access"> & {
        domain: FieldDomains;
    })[];
    type: number;
    name: string;
    flags: number;
    domain: number;
    variants: string;
    showUserLevel: number;
}
