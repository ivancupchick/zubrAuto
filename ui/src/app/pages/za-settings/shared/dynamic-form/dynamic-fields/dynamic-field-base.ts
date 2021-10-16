import { FieldType, UIVariant } from "src/app/entities/field";

export interface DynamicFieldOptions<T> {
  id: number;
  value?: T;
  key?: string;
  label?: string;
  required?: boolean;
  order?: number;
  controlType?: FieldType;
  type?: string;
  variants?: {key: string, value: string}[];
}

export class DynamicFieldBase<T> {
  id: number;
  value: T|undefined;
  key: string;
  label: string;
  required: boolean;
  order: number;
  controlType: FieldType;
  type: string;
  variants: UIVariant[];

  constructor(options: DynamicFieldOptions<T>) {
    this.id = options.id;
    this.value = options.value;
    this.key = options.key || '';
    this.label = options.label || '';
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || FieldType.Text;
    this.type = options.type || '';
    this.variants = options.variants || [];
  }
}
