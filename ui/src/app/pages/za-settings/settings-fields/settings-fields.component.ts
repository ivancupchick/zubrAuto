import { Component, OnInit } from '@angular/core';
import { Domain, Field } from 'src/app/entities/field';
import { FieldService } from 'src/app/services/field/field.service';

import {DialogService} from 'primeng/dynamicdialog';
import { CreateFieldComponent } from '../modals/create-field/create-field.component';

export interface GridField {
  name: string;
  type: string;
  id: string;
}

@Component({
  selector: 'za-settings-fields',
  templateUrl: './settings-fields.component.html',
  styleUrls: ['./settings-fields.component.scss'],
  providers: [
    DialogService
  ]
})
export class SettingsFieldsComponent implements OnInit {
  domains = [
    {name: 'Машины', code: Domain.Car},
    {name: 'Владелец машины', code: Domain.CarOwner},
    {name: 'Клиент', code: Domain.Client},
  ];

  selectedDomain = Domain.Car;

  fields: GridField[] = [];

  constructor(private fieldService: FieldService, private dialogService: DialogService) { }

  ngOnInit(): void {
    this.fieldService.getFields().subscribe(res => {
      this.fields = res.map(field => {
        const gridCar = {
          name: field.name,
          type: String(field.type),
          id: String(field.id),
        }

        return gridCar;
      })
    })
  }

  openNewField() {
    const ref = this.dialogService.open(CreateFieldComponent, {
      data: {
        domain: this.selectedDomain
      },
      header: 'Создание филда',
      width: '70%'
    });
  }

  deleteField(field: any) {
    console.log(field);
  }

  updateField(field: any) {
    console.log(field);
  }
}
