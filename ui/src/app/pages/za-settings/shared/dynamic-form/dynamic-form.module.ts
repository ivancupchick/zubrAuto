import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicFormComponent } from './dynamic-form.component';
import { PrimitiveFormFieldComponent } from './dynamic-form-fields/primitive-form-field/primitive-form-field.component';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';



@NgModule({
  declarations: [
    DynamicFormComponent,
    PrimitiveFormFieldComponent
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
  ]
})
export class DynamicFormModule { }
