import { Models } from "../entities/Models";
import { RealField, ServerField } from "../entities/Field";
import { BitHelper } from "./bit.utils";

export namespace FlagField {
  export enum Flags {
    System = 1,
    Virtual = 2,
  }

  export function setFlagOn(v: { flags: number }, bit: Flags) {
    // v.flags |= bit;
    v.flags = BitHelper.setOn(v.flags, bit)
  }

  export function setFlagOff(v: { flags: number }, bit: Flags) {
    // v.flags &= ~bit;
    v.flags = BitHelper.setOff(v.flags, bit);
  }

  export function Is(v: { flags: number } | number, bit: Flags) {
    const value = typeof v === 'number' ? v : v.flags;
// (value & bit) === bit;
    return BitHelper.Is(value, bit);
  }
}

export const getFieldsWithValues = (chainedFields: Models.Field[], chaines: Models.FieldChain[], sourceId: number): RealField.Response[] => {
  return chainedFields
    // .filter(cf => !!chaines
    //   .filter(ch => ch.sourceId === sourceId)
    //   .find(ch => ch.fieldId === cf.id)
    // )
    .map(cf => {
      return {
        id: cf.id,
        name: cf.name,
        flags: cf.flags,
        type: cf.type,
        domain: cf.domain,
        variants: cf.variants,
        showUserLevel: cf.showUserLevel,
        value: chaines.find(c => c.fieldId === cf.id && c.sourceId === sourceId)?.value || ''
      }
    })
}

export class FieldsUtils {
  static getDropdownValue(entity: RealField.With.Response, fieldName: string) {
    const field = entity.fields.find(f => f.name === fieldName);

    return !field
      ? ''
      : field.variants.split(',').find((variant, index) => `${fieldName}-${index}` === field.value) || ''
  }

  static setDropdownValue(field: ServerField.Response, fieldValue: string): RealField.Response {
    const newField: RealField.Response = {
      ...field,
      value: field.variants.split(',').map((variant, index) => ({ key: `${field.name}-${index}`, value: variant })).find((variantEntity) => variantEntity.value === fieldValue)?.key || ''
    };

    return newField;
  }

  static setFieldValue(field: ServerField.Response, fieldValue: string): RealField.Response {
    const newField: RealField.Response = {
      ...field,
      value: fieldValue
    };

    return newField;
  }

  static getFields(entityOrFieldsArray: { fields: Pick<RealField.Response, 'name' | 'value'>[] } | Pick<RealField.Response, 'name' | 'value'>[]): Pick<RealField.Response, 'name' | 'value'>[] {
    return Array.isArray(entityOrFieldsArray)
    ? entityOrFieldsArray
    : entityOrFieldsArray.fields;
  }

  static getField(entityOrFieldsArray: { fields: Pick<RealField.Response, 'name' | 'value'>[] } | Pick<RealField.Response, 'name' | 'value'>[], name: string): Pick<RealField.Response, 'name' | 'value'> | null {
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

  static getFieldValue(entityOrFieldsArray: { fields: Pick<RealField.Response, 'name' | 'value'>[] } | Pick<RealField.Response, 'name' | 'value'>[], name: string): string {
    const field = this.getField(entityOrFieldsArray, name);

    if (field == null) {
      // console.error(`${name} did not found`)
    }

    if (field && (field.value || field.value === '')) {
      return field.value;
    }

    return '';
  }

  static getFieldBooleanValue(entityOrFieldsArray: { fields: RealField.Response[] } | RealField.Response[], name: string): boolean {
    const field = this.getField(entityOrFieldsArray, name);

    if (field == null) {
      // console.error(`${name} did not found`)
    }

    return (!!field && !!+field.value);
  }

  static getFieldNumberValue(entityOrFieldsArray: { fields: RealField.Response[] } | RealField.Response[], name: string): number {
    const field = this.getField(entityOrFieldsArray, name);

    if (field == null) {
      // console.error(`${name} did not found`)
    }

    return field && field.value ? +field.value : 0;
  }

  static getFieldStringValue(entityOrFieldsArray: { fields: RealField.Response[] } | RealField.Response[], name: string): string {
    const field = this.getField(entityOrFieldsArray, name);

    // if (field == null) {
    //   console.error(`${name} did not found`)
    // }

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
