import { FieldType } from 'src/app/entities/field';
import { DynamicFieldBase } from './dynamic-field-base';

export class DropdownDynamicField extends DynamicFieldBase<string> {
  controlType = FieldType.Radio;
}
