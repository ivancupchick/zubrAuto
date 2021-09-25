import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateField, Domain, FieldType } from 'src/app/entities/field';
import { FieldService } from 'src/app/services/field/field.service';

@Component({
  selector: 'za-create-field',
  templateUrl: './create-field.component.html',
  styleUrls: ['./create-field.component.scss'],
})
export class CreateFieldComponent implements OnInit {
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

  loading = false;

  constructor(
    private fieldService: FieldService,
    private fb: FormBuilder,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.field = {
      flags: 0,
      type: FieldType.Text,
      name: '',
      domain: this.config.data.domain,
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

  create() {
    this.loading = true;

    this.fieldService.createField({
      flags: 0,
      type: this.formGroup.controls['type'].value,
      name: this.formGroup.controls['name'].value,
      domain: this.config.data.domain,
      variants: this.isVisibleVariants ? this.formGroup.controls['variants'].value : '',
      showUserLevel: 0,
    }).subscribe(result => {
      if (result) {
        alert('Поле создано');
        // this.messageService.add({severity:'success', summary:'Поле создано', detail:'Перезагрузите страницу чтобы увидеть новое поле'});
        this.ref.close(true);
      } else {
        alert('Поле не создано');
        // this.messageService.add({severity:'error', summary:'Поле не создано', detail:'Запомните шаги которые привели к ошибке и сообщите администратору'});
      }
    })
  }

  cancel() {
    // this.messageService.add({severity:'error', summary:'Поле не создано', detail:'Запомните шаги которые привели к ошибке и сообщите администратору'});

    // console.log(1);
    this.ref.close(false);
  }
}
