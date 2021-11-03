import { Component, OnInit } from '@angular/core';
import { Domain, FieldType, RealField, ServerField } from 'src/app/entities/field';
import { FieldService } from 'src/app/services/field/field.service';

import {DialogService} from 'primeng/dynamicdialog';
import { CreateFieldComponent } from '../modals/create-field/create-field.component';
import { tap } from 'rxjs/operators';
import { settingsClientsStrings } from '../settings-clients/settings-clients.strings';
import { settingsCarsStrings } from '../settings-cars/settings-cars.strings';
import { FieldNames, StringHash } from 'src/app/entities/FieldNames';

export interface GridField {
  name: string;
  type: string;
  id: string;
  title: string;
}

@Component({
  selector: 'za-settings-fields',
  templateUrl: './settings-fields.component.html',
  styleUrls: ['./settings-fields.component.scss'],
  providers: [
    DialogService,
    FieldService
  ]
})
export class SettingsFieldsComponent implements OnInit {
  loading = false;

  domains = [
    {name: 'Машины', code: Domain.Car},
    {name: 'Владелец машины', code: Domain.CarOwner},
    {name: 'Клиент', code: Domain.Client},
    {name: 'Пользователь', code: Domain.User},
  ];

  selectedDomain = Domain.Car;

  fields: GridField[] = [];
  sortedFields: GridField[] = [];
  rawFields: ServerField.Response[] = [];

  constructor(private fieldService: FieldService, private dialogService: DialogService) { }

  ngOnInit(): void {
    this.getFields().subscribe();
  }

  getFields() {
    return this.fieldService.getFields().pipe(
        tap((res => {
          this.rawFields = [...res];

          this.sortFields();
        }))
      )
  }

  openNewField() {
    const ref = this.dialogService.open(CreateFieldComponent, {
      data: {
        domain: this.selectedDomain
      },
      header: 'Создание филда',
      width: '70%'
    }).onClose.subscribe((res: boolean) => {
      if (res) {
        this.loading = true;
        this.getFields().subscribe(() => {
          this.loading = false;
        });
      }
    });
  }

  deleteField(field: RealField.Response) {
    this.fieldService.deleteField(field.id).subscribe(res => {
      if (res) {
        this.loading = true;
        this.getFields().subscribe(() => {
          this.loading = false;
        });
      }

      if (res) {
        alert('Удаление прошло успешно');
      } else {
        alert('Удаления не произошло');
      }
    });
  }

  updateField(field: GridField) {
    const ref = this.dialogService.open(CreateFieldComponent, {
      data: {
        domain: this.selectedDomain,
        isEdit: true,
        id: +field.id,
        field: this.rawFields.find(rf => `${rf.id}` === `${field.id}`)
      },
      header: 'Редактирование филда',
      width: '70%'
    }).onClose.subscribe((res: boolean) => {
      if (res) {
        this.loading = true;
        this.getFields().subscribe(() => {
          this.loading = false;
        });
      }
    });;
  }

  onChangeDomain(v: any) {
    console.log(v);
    this.sortFields();
  }

  private sortFields() {
    this.sortedFields = this.rawFields.filter(f => f.domain === this.selectedDomain).map(this.getGridFields);
  }

  getGridFields: ((field: ServerField.Response) => GridField) = (field: ServerField.Response) => {
    let title = field.name;

    switch (this.selectedDomain) {
      case Domain.Client:
        title = settingsClientsStrings[field.name] || field.name;

        switch (field.name) {
          case FieldNames.Client.paymentType:
            title = settingsClientsStrings.paymentType;
            break;
          case FieldNames.Client.tradeInAuto:
            title = settingsClientsStrings.tradeInAuto;
            break;
        }
        break;
      case Domain.Car:
        title = (settingsCarsStrings as StringHash)[field.name] || field.name;
        break;
    }

    let type = String(field.type);

    // {name: 'Textbox', code: FieldType.Text},
    // {name: 'Boolean', code: FieldType.Boolean},
    // {name: 'Multiselect', code: FieldType.Multiselect},
    // {name: 'Radio Button', code: FieldType.Radio},
    // {name: 'Dropdown', code: FieldType.Dropdown},

    switch (field.type) {
      case FieldType.Text:
        type = 'Textbox'
        break;
      case FieldType.Boolean:
        type = 'Boolean'
        break;
      case FieldType.Multiselect:
        type = 'Multiselect'
        break;
      case FieldType.Radio:
        type = 'Radio Button'
        break;
      case FieldType.Dropdown:
        type = 'Dropdown'
        break;
    }

    return {
      name: field.name,
      type,
      id: String(field.id),
      title
    };
  }
}
