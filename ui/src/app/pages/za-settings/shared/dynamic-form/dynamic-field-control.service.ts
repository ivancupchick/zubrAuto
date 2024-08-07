import { Injectable } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { FieldType, FieldsUtils, FlagField, UIRealField } from 'src/app/entities/field';
import { DynamicFieldBase, DynamicFieldOptions } from './dynamic-fields/dynamic-field-base';
import { FieldNames } from 'src/app/entities/FieldNames';


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

      switch (field.controlType) {
        case FieldType.Date:
          group[field.key] = new UntypedFormControl(field.value && new Date(+field.value) || '', [...validators]);
          break;
        default:
          group[field.key] = new UntypedFormControl(field.value || '', [...validators]);
          break;
      }


      // TODO replace to other place
      if (field.readonly) {
        (group[field.key] as UntypedFormControl).disable();
      }
    });
    return new UntypedFormGroup(group);
  }

  getDynamicFieldsFromDBFields(dbFields: UIRealField[]) {
    const requiredFields: string[] = [FieldNames.Client.name,FieldNames.Client.number, FieldNames.Client.dealStatus, FieldNames.Client.source, FieldNames.Client.SpecialistId];

    const fields: DynamicFieldBase<string>[] = dbFields
      .filter(dbField => !FlagField.Is(dbField, FlagField.Flags.Virtual))
      .map(dbField => {
        return new DynamicFieldBase<string>({
          id: dbField.id,
          value: dbField.hasOwnProperty('value') ? dbField.value : '',
          key: dbField.name,
          label: 'Default title',
          required: requiredFields.includes(dbField.name), // false, // TODO check required bit + user bit // rethink about it
          readonly: FlagField.Is(dbField, FlagField.Flags.System),
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
