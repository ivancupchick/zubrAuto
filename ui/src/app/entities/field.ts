import { RealField, ServerField } from '../../../../src/temp/entities/Field';
import {
  FieldDomains as domain,
  FieldType as type,
} from '../../../../src/core/fields/fields';
import { FieldAccess } from './fieldAccess';
import { FlagField as flagField } from '../../../../src/core/utils/flag.utils';

export interface UIVariant {
  key: string;
  value: string;
}
// export type IRealField = RealField.Response;
// export type CreateField = CreateFieldRequest;
// export type RealField = IField;
// export type EntityField = RealFieldRequest;

export import FieldType = type;
export import FieldDomains = domain;
export import RealField = RealField;
export import ServerField = ServerField;
export import FlagField = flagField;

type IAnyField = Pick<RealField.Response, 'name' | 'value' | 'variants'> &
  Partial<Pick<RealField.Response, 'type'>>;
type INotDropdownField = Pick<RealField.Response, 'name' | 'value'>;

export class UIRealField {
  public id: number;
  public flags: number;
  public type: FieldType;
  public name: string;
  public domain: FieldDomains;
  public variants: UIVariant[] = [];
  public showUserLevel: number;
  public value: string;

  constructor(options: ServerField.Response, value: string = '') {
    this.id = options.id;
    this.flags = options.flags;
    this.type = options.type;
    this.name = options.name;
    this.domain = options.domain;
    this.variants = !options.variants
      ? []
      : options.variants.split(',').map((v, i) => ({
          key: `${options.name}-${i}`,
          value: v,
        }));
    this.showUserLevel = options.showUserLevel;
    this.value = value;

    if (options.type === FieldType.Dropdown) {
      if (!this.variants.map((v) => v.key).includes(value)) {
        this.value = '';
      }
    }
  }
}

export class FieldsUtils {
  static getDropdownValue(
    entityOrFieldsArray: { fields: IAnyField[] } | IAnyField[],
    fieldName: string,
  ) {
    const field = this.getField(entityOrFieldsArray, fieldName);

    return !field
      ? ''
      : field.variants
          .split(',')
          .find((variant, index) => `${fieldName}-${index}` === field.value) ||
          '';
  }

  static setDropdownValue(
    field: ServerField.Response,
    fieldValue: string,
  ): RealField.Response {
    const newField: RealField.Response = {
      ...field,
      value:
        field.variants
          .split(',')
          .map((variant, index) => ({
            key: `${field.name}-${index}`,
            value: variant,
          }))
          .find((variantEntity) => variantEntity.value === fieldValue)?.key ||
        '',
    };

    return newField;
  }

  static setFieldValue(
    field: ServerField.Response,
    fieldValue: string,
  ): RealField.Response {
    const newField: RealField.Response = {
      ...field,
      value: fieldValue,
    };

    return newField;
  }

  static getFields<T extends INotDropdownField>(
    entityOrFieldsArray: { fields: T[] } | T[],
  ): T[] {
    return Array.isArray(entityOrFieldsArray)
      ? entityOrFieldsArray
      : entityOrFieldsArray.fields;
  }

  static getField<T extends INotDropdownField>(
    entityOrFieldsArray: { fields: T[] } | T[],
    name: string,
  ): T | null {
    if (!name || !entityOrFieldsArray) {
      return null;
    }

    const fields = this.getFields(entityOrFieldsArray);

    if (!fields || fields.length === 0) {
      return null;
    }

    return fields.find((field) => field.name === name) || null;
  }

  static getFieldValue(
    entityOrFieldsArray: { fields: IAnyField[] } | IAnyField[],
    name: string,
  ): string {
    const field = this.getField(entityOrFieldsArray, name);
    if (field == null) {
      return '';
    }

    if (['engine', 'transmission'].includes(field.name)) {
      // TODO why it is here?
      return field.variants.split(',')[+field.value.split('-')[1]];
    }

    return field.value || '';
  }

  static getFieldBooleanValue(
    entityOrFieldsArray: { fields: INotDropdownField[] } | INotDropdownField[],
    name: string,
  ): boolean {
    const field = this.getField(entityOrFieldsArray, name);
    return !!field && !!+field.value;
  }

  static getFieldNumberValue(
    entityOrFieldsArray: { fields: INotDropdownField[] } | INotDropdownField[],
    name: string,
  ): number {
    const field = this.getField(entityOrFieldsArray, name);
    return field && field.value ? +field.value : 0;
  }

  static getFieldStringValue(
    entityOrFieldsArray: { fields: INotDropdownField[] } | INotDropdownField[],
    name: string,
  ): string {
    const field = this.getField(entityOrFieldsArray, name);
    return field && field.value != null ? field.value + '' : '';
  }

  // need test work
  // static setFieldValue(entityOrFieldsArray: { fields: RealField.Response[] } | RealField.Response[], name: string, fieldValue: any = null, fieldType?: FieldType): boolean {
  //   const field = this.getField(entityOrFieldsArray, name);
  //   if (field) {
  //     field.value = fieldValue;
  //     return true;
  //   } else if (fieldType) {
  //     const fields = this.getFields(entityOrFieldsArray);
  //     fields.push({
  //       id: 0,
  //       name: name,
  //       value: fieldValue,
  //       type: fieldType,
  //       flags: 0,
  //       variants: '',
  //       showUserLevel: 0,
  //       domain: FieldDomains.Car
  //     });
  //     return true;
  //   }

  //   return false;
  // }
}

export function getDomainName(domain: FieldDomains): string {
  switch (domain) {
    case FieldDomains.Role:
      return 'Роль';
    default:
      return 'None';
  }
}

export function getAccessName(access: number): string {
  const result =
    (FieldAccess.writable(access) ? 'Может изменять' : ' ') +
    (FieldAccess.isNoAccess(access) ? 'Не видит' : ' ');

  return access === 0 ? 'Не может изменять но видит' : result.trim();
}
