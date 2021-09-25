import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateField, Domain, FieldType } from 'src/app/entities/field';

@Component({
  selector: 'za-field-form',
  templateUrl: './field-form.component.html',
  styleUrls: ['./field-form.component.scss']
})
export class FieldFormComponent implements OnInit {
  FieldType = FieldType;

  isVisibleVariants = false;

  field!: CreateField;

  types = [
    {name: 'Текст', code: FieldType.Text},
    {name: 'Чек-бокс', code: FieldType.Checkbox},
    {name: 'Мульти-селект', code: FieldType.Multiselect},
    {name: 'Радио-баттон', code: FieldType.Radio},
  ];

  formGroup!: FormGroup;

  @Input() domain!: Domain;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.field = {
      flags: 0,
      type: FieldType.Text,
      name: '',
      domain: this.domain,
      variants: '',
      showUserLevel: 0,
    };

    this.formGroup = this.fb.group({
      name: ['', Validators.required],
      type: [FieldType.Text, Validators.required],
      variants: ['']
    });

    this.formGroup.valueChanges.subscribe(data => {
      this.isVisibleVariants = data.type === FieldType.Checkbox || data.type === FieldType.Radio || data.type === FieldType.Multiselect
    })
  }

  valid(): boolean {
    return this.formGroup.valid;
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
