import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicFormComponent } from './dynamic-form.component';
import { PrimitiveFormFieldComponent } from './dynamic-form-fields/primitive-form-field/primitive-form-field.component';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { DateFormFieldsComponent } from './dynamic-form-fields/date-form-fields/date-form-fields.component';
import { CalendarModule } from 'primeng/calendar';



@NgModule({
  declarations: [
    DynamicFormComponent,
    PrimitiveFormFieldComponent,
    DateFormFieldsComponent
  ],
  exports: [
    DynamicFormComponent
  ],
  imports: [
    CommonModule,
    InputTextModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextareaModule,
    CalendarModule,
  ]
})
export class DynamicFormModule { }
