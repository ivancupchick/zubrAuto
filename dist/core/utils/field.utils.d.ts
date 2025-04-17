import { Models } from "src/temp/entities/Models";
import { RealField, ServerField } from "src/temp//entities/Field";
import { StringHash } from "src/temp/models/hashes";
export declare const getFieldChainsValue: (query: StringHash, fields: Models.Field[]) => string[];
export declare const getFieldsWithValues: (chainedFields: Models.Field[], chaines: Models.FieldChain[], sourceId: number) => RealField.Response[];
export declare class FieldsUtils {
    static getDropdownValue(entity: RealField.With.Response, fieldName: string): string;
    static setDropdownValue(field: ServerField.Response, fieldValue: string): RealField.Response;
    static setFieldValue(field: ServerField.Response, fieldValue: string): RealField.Response;
    static getFields(entityOrFieldsArray: {
        fields: Pick<RealField.Response, 'name' | 'value'>[];
    } | Pick<RealField.Response, 'name' | 'value'>[]): Pick<RealField.Response, 'name' | 'value'>[];
    static getField(entityOrFieldsArray: {
        fields: Pick<RealField.Response, 'name' | 'value'>[];
    } | Pick<RealField.Response, 'name' | 'value'>[], name: string): Pick<RealField.Response, 'name' | 'value'> | null;
    static getFieldValue(entityOrFieldsArray: {
        fields: Pick<RealField.Response, 'name' | 'value'>[];
    } | Pick<RealField.Response, 'name' | 'value'>[], name: string): string;
    static getFieldBooleanValue(entityOrFieldsArray: {
        fields: RealField.Response[];
    } | RealField.Response[], name: string): boolean;
    static getFieldNumberValue(entityOrFieldsArray: {
        fields: RealField.Response[];
    } | RealField.Response[], name: string): number;
    static getFieldStringValue(entityOrFieldsArray: {
        fields: RealField.Response[];
    } | RealField.Response[], name: string): string;
}
