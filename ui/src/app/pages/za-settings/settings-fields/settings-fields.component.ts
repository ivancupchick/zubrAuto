import { Component, OnInit } from '@angular/core';
import {
  FieldDomains,
  FieldType,
  RealField,
  ServerField,
} from 'src/app/entities/field';
import { FieldService } from 'src/app/services/field/field.service';
import { DialogService } from 'primeng/dynamicdialog';
import { CreateFieldComponent } from '../modals/create-field/create-field.component';
import { finalize, mergeMap, tap } from 'rxjs/operators';
import { settingsClientsStrings } from '../settings-clients/settings-clients.strings';
import { settingsCarsStrings } from '../settings-cars/settings-cars.strings';
import { FieldNames } from 'src/app/entities/FieldNames';
import { StringHash } from 'src/app/entities/constants';
import { Observable, of } from 'rxjs';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ToolbarModule } from 'primeng/toolbar';

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
  standalone: true,
  imports: [
    ToolbarModule,
    DropdownModule,
    FormsModule,
    ButtonDirective,
    TableModule,
    PrimeTemplate,
    SpinnerComponent,
  ],
})
export class SettingsFieldsComponent implements OnInit {
  loading = false;
  selectedDomain = FieldDomains.Car;
  fields: GridField[] = [];
  sortedFields: GridField[] = [];
  rawFields: ServerField.Response[] = [];
  domains = [
    { name: 'Машины', code: FieldDomains.Car },
    { name: 'Владелец машины', code: FieldDomains.CarOwner },
    { name: 'Клиент', code: FieldDomains.Client },
    { name: 'Пользователь', code: FieldDomains.User },
  ];

  constructor(
    private fieldService: FieldService,
    private dialogService: DialogService,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.getFields()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(() => {
        this.sortFields();
      });
  }

  getFields(): Observable<ServerField.Response[]> {
    return this.fieldService.getFields().pipe(
      tap((res) => {
        this.rawFields = [...res];
      }),
    );
  }

  openNewField() {
    const ref = this.dialogService
      .open(CreateFieldComponent, {
        data: {
          domain: this.selectedDomain,
        },
        header: 'Создание филда',
        width: '70%',
      })
      .onClose.subscribe((res: boolean) => {
        if (res) {
          this.loading = true;
          this.getFields()
            .pipe(finalize(() => (this.loading = false)))
            .subscribe();
        }
      });
  }

  deleteField(field: RealField.Response) {
    this.loading = true;
    this.fieldService
      .deleteField(field.id)
      .pipe(
        finalize(() => (this.loading = false)),
        mergeMap((res) => (res && this.getFields()) || of(res)),
      )
      .subscribe((res) => {
        if (res) {
          alert('Удаление прошло успешно');
        } else {
          alert('Удаления не произошло');
        }
      });
  }

  updateField(field: GridField) {
    const ref = this.dialogService
      .open(CreateFieldComponent, {
        data: {
          domain: this.selectedDomain,
          isEdit: true,
          id: +field.id,
          field: this.rawFields.find((rf) => `${rf.id}` === `${field.id}`),
        },
        header: 'Редактирование филда',
        width: '70%',
      })
      .onClose.subscribe((res: boolean) => {
        if (res) {
          this.loading = true;
          this.getFields()
            .pipe(finalize(() => (this.loading = false)))
            .subscribe();
        }
      });
  }

  onChangeDomain(v: any) {
    this.sortFields();
  }

  private sortFields() {
    this.sortedFields = this.rawFields
      .filter((f) => f.domain === this.selectedDomain)
      .map(this.getGridFields);
  }

  getGridFields: (field: ServerField.Response) => GridField = (
    field: ServerField.Response,
  ) => {
    let title = field.name;

    switch (this.selectedDomain) {
      case FieldDomains.Client:
        title = settingsClientsStrings[field.name] || field.name;

        switch (field.name) {
          case FieldNames.Client.paymentType:
            title = settingsClientsStrings.paymentType;
            break;
          case FieldNames.Client.tradeInAuto:
            title = settingsClientsStrings.tradeInAuto;
            break;
          case FieldNames.Client.nextAction:
            title = settingsClientsStrings.nextAction;
            break;
        }
        break;
      case FieldDomains.Car:
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
        type = 'Textbox';
        break;
      case FieldType.Boolean:
        type = 'Boolean';
        break;
      case FieldType.Multiselect:
        type = 'Multiselect';
        break;
      case FieldType.Radio:
        type = 'Radio Button';
        break;
      case FieldType.Dropdown:
        type = 'Dropdown';
        break;
    }

    return {
      name: field.name,
      type,
      id: String(field.id),
      title,
    };
  };
}
