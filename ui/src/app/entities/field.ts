import { FieldDomains as domain, FieldType as type, CreateFieldRequest, IField, FieldWithValue } from '../../../../src/entities/Field'

export type RealField = FieldWithValue;
export type CreateField = CreateFieldRequest;
export type Field = IField;

export import FieldType = type;
export import Domain = domain;

export class FieldsUtils {
  static getFields(entityOrFieldsArray: { fields: FieldWithValue[] } | FieldWithValue[]): FieldWithValue[] {
    return Array.isArray(entityOrFieldsArray)
    ? entityOrFieldsArray
    : entityOrFieldsArray.fields;
  }

  static getField(entityOrFieldsArray: { fields: FieldWithValue[] } | FieldWithValue[], name: string): FieldWithValue | null {
    if (!name || !entityOrFieldsArray) {
      return null;
    }

    const fields = this.getFields(entityOrFieldsArray)

    if (!fields || fields.length < 1) {
      return null;
    }

    for (const field of fields) {
      if (field.name === name) {
        return field;
      }
    }
    return null;
  }

  static getFieldValue(entityOrFieldsArray: { fields: FieldWithValue[] } | FieldWithValue[], name: string): string | null {
    const field = this.getField(entityOrFieldsArray, name);

    if (field && (field.value || field.value === '')) {
      return field.value;
    }

    return null;
  }

  static getFieldBooleanValue(entityOrFieldsArray: { fields: FieldWithValue[] } | FieldWithValue[], name: string): boolean {
    const field = this.getField(entityOrFieldsArray, name);
    return (!!field && !!+field.value);
  }

  static getFieldNumberValue(entityOrFieldsArray: { fields: FieldWithValue[] } | FieldWithValue[], name: string): number | null {
    const field = this.getField(entityOrFieldsArray, name);
    return field && field.value ? +field.value : null;
  }

  static getFieldStringValue(entityOrFieldsArray: { fields: FieldWithValue[] } | FieldWithValue[], name: string): string | null {
    const field = this.getField(entityOrFieldsArray, name);
    return field && field.value != null ? field.value + '' : null;
  }

  // need test work
  static setFieldValue(entityOrFieldsArray: { fields: FieldWithValue[] } | FieldWithValue[], name: string, fieldValue: any = null, fieldType?: FieldType): boolean {
    const field = this.getField(entityOrFieldsArray, name);
    if (field) {
      field.value = fieldValue;
      return true;
    } else if (fieldType) {
      const fields = this.getFields(entityOrFieldsArray);
      fields.push({
        id: 0,
        name: name,
        value: fieldValue,
        type: fieldType,
        flags: 0,
        variants: '',
        showUserLevel: 0,
        domain: domain.Car
      });
      return true;
    }

    return false;
  }
}
