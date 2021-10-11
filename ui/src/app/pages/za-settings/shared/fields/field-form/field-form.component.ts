import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateField, Domain, Field, FieldType } from 'src/app/entities/field';

@Component({
  selector: 'za-field-form',
  templateUrl: './field-form.component.html',
  styleUrls: ['./field-form.component.scss']
})
export class FieldFormComponent implements OnInit {
  FieldType = FieldType;

  isVisibleVariants = false;

  types = [
    {name: 'Текст', code: FieldType.Text},
    {name: 'Да-нет', code: FieldType.Boolean},
    {name: 'Мульти-селект', code: FieldType.Multiselect},
    {name: 'Радио-баттон', code: FieldType.Radio},
  ];

  formGroup!: FormGroup;
  @Input() field!: Field | null;
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
      this.isVisibleVariants = data.type === FieldType.Radio || data.type === FieldType.Multiselect
    })
  }

  getValue(): CreateField {
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
