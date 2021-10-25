import { Injectable } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { UIRealField } from 'src/app/entities/field';
import { DynamicFieldBase, DynamicFieldOptions } from './dynamic-fields/dynamic-field-base';


@Injectable()
export class DynamicFieldControlService {
  constructor() { }

  toFormGroup(fields: DynamicFieldBase<string>[] ) {
    const group: any = {};

    fields.forEach(field => {
      const validators: ValidatorFn[] = [...field.validators];
      if (field.required) {
        validators.push(Validators.required);
      }

      group[field.key] = new FormControl(field.value || '', [...validators]);

      // TODO replace to other place
      if (field.readonly) {
        (group[field.key] as FormControl).disable();
      }
    });
    return new FormGroup(group);
  }

  getDynamicFieldsFromDBFields(dbFields: UIRealField[]) {
    const fields: DynamicFieldBase<string>[] = dbFields.map(dbField => {
      return new DynamicFieldBase<string>({
        id: dbField.id,
        value: dbField.hasOwnProperty('value') ? dbField.value : '',
        key: dbField.name,
        label: 'Default title',
        required: true, // TODO check required bit + user bit // rethink about it
        order: 1,
        controlType: dbField.type,
        type: '',
        variants: dbField.variants
      });
    });

    return fields;
  }

  getDynamicFieldFromOptions<T>(options: DynamicFieldOptions<T>) {
    return new DynamicFieldBase<T>(options);
  }
}
