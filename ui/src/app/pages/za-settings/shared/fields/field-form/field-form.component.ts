import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Domain, FieldType, ServerField } from 'src/app/entities/field';

@Component({
  selector: 'za-field-form',
  templateUrl: './field-form.component.html',
  styleUrls: ['./field-form.component.scss']
})
export class FieldFormComponent implements OnInit {
  FieldType = FieldType;

  isVisibleVariants = false;

  types = [
    {name: 'Textbox', code: FieldType.Text},
    {name: 'Boolean', code: FieldType.Boolean},
    {name: 'Multiselect', code: FieldType.Multiselect},
    {name: 'Radio Button', code: FieldType.Radio},
    {name: 'Dropdown', code: FieldType.Dropdown},
  ];

  formGroup!: FormGroup;
  @Input() field!: ServerField.Response | null;
  @Input() domain!: Domain;

  @Output() changed = new EventEmitter<boolean>();

  private valid = false;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      name: [ this.field ? this.field.name : '', Validators.required],
      type: [ this.field ? this.field.type : FieldType.Text, Validators.required],
      variants: [ this.field ? this.field.variants : '']
    });

    this.formGroup.valueChanges.subscribe(data => {
      this.valid = this.formGroup.valid;
      this.changed.emit(this.valid);
      this.isVisibleVariants = data.type === FieldType.Radio || data.type === FieldType.Multiselect || data.type ===  FieldType.Dropdown
    })
  }

  getValue(): ServerField.CreateRequest {
    return {
      flags: 0,
      type: this.formGroup.controls['type'].value,
      name: this.formGroup.controls['name'].value,
      domain: this.domain,
      variants: this.isVisibleVariants ? this.formGroup.controls['variants'].value : '',
      showUserLevel: 0,
    }
  }
}
