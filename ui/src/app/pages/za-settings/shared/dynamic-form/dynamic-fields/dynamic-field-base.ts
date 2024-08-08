import { UntypedFormGroup, ValidatorFn } from "@angular/forms";
import { FieldType, UIVariant } from "src/app/entities/field";

export interface DynamicFieldOptions<T> {
  id: number;
  value?: T;
  key?: string;
  label?: string;
  required?: boolean;
  validators?: ValidatorFn[];
  readonly?: boolean;
  readonlyFunction?: (formGroup: UntypedFormGroup) => boolean;
  order?: number;
  controlType?: FieldType;
  type?: string;
  mask?: string;
  variants?: {key: string, value: string}[];
}

export class DynamicFieldBase<T> {
  id: number;
  value: T|undefined;
  key: string;
  label: string;
  required: boolean;
  validators: ValidatorFn[];
  readonly: boolean;
  order: number;
  controlType: FieldType;
  type: string;
  mask: string;
  variants: UIVariant[];
  readonlyFunction?: (formGroup: UntypedFormGroup) => boolean;

  constructor(options: DynamicFieldOptions<T>) {
    this.id = options.id;
    this.value = options.value;
    this.key = options.key || '';
    this.label = options.label || '';
    this.required = !!options.required;
    this.validators = options.validators || [];
    this.readonly = !!options.readonly;
    this.readonlyFunction = options.readonlyFunction || undefined;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || FieldType.Text;
    this.type = options.type || '';
    this.mask = options.mask || '';
    this.variants = options.variants || [];
  }
}
