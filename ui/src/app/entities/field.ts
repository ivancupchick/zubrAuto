import { RealField, ServerField, FieldDomains as domain, FieldType as type } from '../../../../src/entities/Field'

export interface UIVariant {
  key: string;
  value: string;
}
// export type IRealField = RealField.Response;
// export type CreateField = CreateFieldRequest;
// export type RealField = IField;
// export type EntityField = RealFieldRequest;

export import FieldType = type;
export import Domain = domain;
export import RealField = RealField;
export import ServerField = ServerField;

export class UIRealField  {
  public id: number;
  public flags: number;
  public type: FieldType;
  public name: string;
  public domain: Domain;
  public variants: UIVariant[] = [];
  public showUserLevel: number;
  public value: string;

  constructor(options: ServerField.Entity, value: string = '') {
    this.id = options.id;
    this.flags = options.flags;
    this.type = options.type;
    this.name = options.name;
    this.domain = options.domain;
    this.variants = JSON.parse(options.variants || '[]') || [];
    this.showUserLevel = options.showUserLevel;
    this.value = value;
  }
}

export class FieldsUtils {
  static getFields(entityOrFieldsArray: { fields: RealField.Response[] } | RealField.Response[]): RealField.Response[] {
    return Array.isArray(entityOrFieldsArray)
    ? entityOrFieldsArray
    : entityOrFieldsArray.fields;
  }

  static getField(entityOrFieldsArray: { fields: RealField.Response[] } | RealField.Response[], name: string): RealField.Response | null {
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

  static getFieldValue(entityOrFieldsArray: { fields: RealField.Response[] } | RealField.Response[], name: string): string | null {
    const field = this.getField(entityOrFieldsArray, name);

    if (field && (field.value || field.value === '')) {
      return field.value;
    }

    return null;
  }

  static getFieldBooleanValue(entityOrFieldsArray: { fields: RealField.Response[] } | RealField.Response[], name: string): boolean {
    const field = this.getField(entityOrFieldsArray, name);
    return (!!field && !!+field.value);
  }

  static getFieldNumberValue(entityOrFieldsArray: { fields: RealField.Response[] } | RealField.Response[], name: string): number | null {
    const field = this.getField(entityOrFieldsArray, name);
    return field && field.value ? +field.value : null;
  }

  static getFieldStringValue(entityOrFieldsArray: { fields: RealField.Response[] } | RealField.Response[], name: string): string | null {
    const field = this.getField(entityOrFieldsArray, name);
    return field && field.value != null ? field.value + '' : null;
  }

  // need test work
  static setFieldValue(entityOrFieldsArray: { fields: RealField.Response[] } | RealField.Response[], name: string, fieldValue: any = null, fieldType?: FieldType): boolean {
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
        domain: Domain.Car
      });
      return true;
    }

    return false;
  }
}
