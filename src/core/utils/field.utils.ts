import { Models } from "src/temp/entities/Models";
import { RealField, ServerField } from "src/temp//entities/Field";
import { StringHash } from "src/temp/models/hashes";
import { FieldType } from "../fields/fields";

export const getFieldChainsValue = (query: StringHash, fields: Models.Field[]): string[] => {
  fields.forEach(f => {
    if (f.type === FieldType.Dropdown || f.type === FieldType.Multiselect) {
      const tempValue = Array.isArray(query[f.name]) ? query[f.name][0] : query[f.name];
      if (tempValue.indexOf('-') > 0) {
        const [first, second] = tempValue.split('-');

        if (first === f.name && typeof +second === 'number') {
          return;
        }
      }

      const needVariants = Array.isArray(query[f.name]) ? query[f.name] as unknown as string[] : query[f.name].split(',');
      query[f.name] = needVariants.map(v => {
        if (f.variants) {
          const index = f.variants.split(',').findIndex(vValue => vValue === v);

          return `${f.name}-${index}`;
        }

        return query[f.name];
      }).join(',')
    }
  });

  const queryValues = fields.map(f => f.name).map(k => Array.isArray(query[k]) ? query[k] as unknown as string[] : query[k].split(','));
  const rValues: string[] = [];
  queryValues.forEach(queryValue => {
    queryValue.forEach(vv => rValues.push(vv));
  });

  return rValues;
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
