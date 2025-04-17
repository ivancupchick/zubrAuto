import { FieldType } from 'src/app/entities/field';
import { DynamicFieldBase } from './dynamic-field-base';

export class TextboxDynamicField extends DynamicFieldBase<string> {
  controlType = FieldType.Text;
}
