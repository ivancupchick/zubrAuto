import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { FieldType, RealField } from 'src/app/entities/field';

interface DataConfigItem {
  title: string;
  name: string;
  type: FieldType | 'UIField';
  getValue: (fieldItems: RealField[]) => string;
  rawFieldObject: RealField;
}

interface FormGroupCreationObj {
  [key: string]: (string | ((control: AbstractControl) => ValidationErrors | null))[]
}

@Component({
  selector: 'za-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit {

  formGroup!: FormGroup;
  @Input() data: RealField[] | null = null;
  @Input() dataConfig!: DataConfigItem[];

  @Output() changed = new EventEmitter<boolean>();

  private valid = false;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.formGroup = this.fb.group(
      this.dataConfig.reduce<FormGroupCreationObj>((prevValue, curValue) => {
        prevValue[curValue.name] = [
          this.data ? curValue.getValue(this.data) || '' : '',
          Validators.required
        ];

        return prevValue;
      }, {})
    );

    this.formGroup.valueChanges.subscribe(data => {
      this.valid = this.formGroup.valid;
      this.changed.emit(this.valid);
    })
  }

  getValue(): RealField[] {
    return this.dataConfig.map((configItem) => Object.assign({}, {
      value: this.formGroup.controls[configItem.name].value
    }, configItem.rawFieldObject))
  }
}
