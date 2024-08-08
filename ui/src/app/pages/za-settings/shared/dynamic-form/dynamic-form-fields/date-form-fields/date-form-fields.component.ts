import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DynamicFieldBase } from '../../dynamic-fields/dynamic-field-base';
import { UntypedFormGroup } from '@angular/forms';
import { FieldType } from 'src/app/entities/field';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'za-date-form-fields',
  templateUrl: './date-form-fields.component.html',
  styleUrls: ['./date-form-fields.component.scss']
})
export class DateFormFieldsComponent implements OnInit, OnDestroy {
  FieldType = FieldType;

  @Input() field!: DynamicFieldBase<string>;
  @Input() form!: UntypedFormGroup;
  get isValid() {
    return this.form.controls[this.field.key].valid;
  }

  destroyed = new Subject();

  ngOnInit(): void {
    if (this.field.readonlyFunction) {
      if (this.field.readonlyFunction(this.form)) {
        this.form.get(this.field.key)?.disable({ emitEvent: false });
      } else {
        this.form.get(this.field.key)?.enable({ emitEvent: false });
      }

      this.form.valueChanges.pipe(takeUntil(this.destroyed)).subscribe(() => {
        if (this.field.readonlyFunction!(this.form)) {
          this.form.get(this.field.key)?.disable({ emitEvent: false });
        } else {
          this.form.get(this.field.key)?.enable({ emitEvent: false });
        }

      })
    }
  }

  ngOnDestroy(): void {
    this.destroyed.next(null);
  }
}
