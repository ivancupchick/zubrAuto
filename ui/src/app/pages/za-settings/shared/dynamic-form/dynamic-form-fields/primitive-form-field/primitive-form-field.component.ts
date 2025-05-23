import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { FieldType } from 'src/app/entities/field';
import { DynamicFieldBase } from '../../dynamic-fields/dynamic-field-base';

@Component({
  selector: 'za-primitive-form-field',
  templateUrl: './primitive-form-field.component.html',
  styleUrls: ['./primitive-form-field.component.scss'],
})
export class PrimitiveFormFieldComponent implements OnInit {
  FieldType = FieldType;

  @Input() field!: DynamicFieldBase<string>;
  @Input() form!: UntypedFormGroup;
  get isValid() {
    return this.form.controls[this.field.key].valid;
  }

  get isNumberInvalid() {
    return this.form.controls[this.field.key].errors;
  }

  constructor() {}

  ngOnInit(): void {}
}
