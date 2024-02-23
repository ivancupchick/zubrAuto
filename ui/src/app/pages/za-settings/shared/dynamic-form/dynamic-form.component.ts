import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { FieldType, RealField } from 'src/app/entities/field';
import { DynamicFieldControlService } from './dynamic-field-control.service';
import { DynamicFieldBase } from './dynamic-fields/dynamic-field-base';

// export interface DataConfigItem {
//   title: string;
//   name: string;
//   type: FieldType | 'UIField';
//   getValue: (fieldItems: RealField[]) => string;
//   rawFieldObject: RealField;
//   order?: number;
// }

// interface FormGroupCreationObj {
//   [key: string]: (string | ((control: AbstractControl) => ValidationErrors | null))[]
// }

@Component({
  selector: 'za-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
  providers: [
    DynamicFieldControlService
  ]
})
export class DynamicFormComponent implements OnInit {
  formGroup!: UntypedFormGroup;
  // @Input() data: RealField[] | null = null;
  // @Input() dataConfig!: DataConfigItem[];

  @Input() fields: DynamicFieldBase<string>[] = [];

  @Output() changed = new EventEmitter<boolean>();

  FieldType = FieldType;

  private valid = false;

  constructor(private dfcs: DynamicFieldControlService) { }

  ngOnInit(): void {
    this.formGroup = this.dfcs.toFormGroup(this.fields);

    // this.formGroup = this.fb.group(
    //   this.dataConfig.reduce<FormGroupCreationObj>((prevValue, curValue) => {
    //     prevValue[curValue.name] = [
    //       this.data ? curValue.getValue(this.data) || '' : '',
    //       Validators.required
    //     ];

    //     return prevValue;
    //   }, {})
    // );

    this.changed.emit(this.formGroup.valid);

    this.formGroup.valueChanges.subscribe(data => {
      this.valid = this.formGroup.valid;
      this.changed.emit(this.valid);
    })
  }

  getValue(): RealField.Request[] {
    return this.fields
      .filter((field) => !this.formGroup.controls[field.key].pristine)
      .map((field) => {
        if (field.controlType === FieldType.Date) {
          return {
            id: field.id,
            name: field.key,
            value: +this.formGroup.controls[field.key].value
          }
        }

        return {
          id: field.id,
          name: field.key,
          value: this.formGroup.controls[field.key].value
        };
      });
  }

  getAllValue(): RealField.Request[] {
    return this.fields
      .map((field) => ({
        id: field.id,
        name: field.key,
        value: this.formGroup.controls[field.key].value
      }))
  }
}
