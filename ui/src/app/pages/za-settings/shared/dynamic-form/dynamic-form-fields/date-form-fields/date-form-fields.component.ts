import { Component, Input, OnInit } from '@angular/core';
import { DynamicFieldBase } from '../../dynamic-fields/dynamic-field-base';
import { UntypedFormGroup } from '@angular/forms';
import { FieldType } from 'src/app/entities/field';

@Component({
  selector: 'za-date-form-fields',
  templateUrl: './date-form-fields.component.html',
  styleUrls: ['./date-form-fields.component.scss']
})
export class DateFormFieldsComponent implements OnInit {
  FieldType = FieldType;

  @Input() field!: DynamicFieldBase<string>;
  @Input() form!: UntypedFormGroup;
  get isValid() {
    return this.form.controls[this.field.key].valid;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
