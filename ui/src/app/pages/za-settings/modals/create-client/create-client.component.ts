import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ServerClient } from 'src/app/entities/client';
import { ServerField, FieldType, UIRealField, RealField } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
import { ClientService } from 'src/app/services/client/client.service';
import { settingsClientsStrings } from '../../settings-clients/settings-clients.strings';
import { DynamicFieldControlService } from '../../shared/dynamic-form/dynamic-field-control.service';
import { DynamicFieldBase } from '../../shared/dynamic-form/dynamic-fields/dynamic-field-base';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';

@Component({
  selector: 'za-create-client',
  templateUrl: './create-client.component.html',
  styleUrls: ['./create-client.component.scss'],
  providers: [
    DynamicFieldControlService
  ]
})
export class CreateClientComponent implements OnInit {
  loading = false;

  @Input() client: ServerClient.Entity & { fields: RealField.Request[] } | undefined;
  @Input() fieldConfigs: ServerField.Entity[] = [];

  formValid = false;

  dynamicFormFields: DynamicFieldBase<string>[] = [];

  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  constructor(
    private clientService: ClientService,
    private dfcs: DynamicFieldControlService,

    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.client = this.config.data.client || undefined;
    this.fieldConfigs = this.config.data.fieldConfigs;

    const formFields = this.dfcs.getDynamicFieldsFromDBFields(this.fieldConfigs.map(fc => {
      const fieldValue = !!this.client 
        ? this.client.fields.find(f => f.id === fc.id)?.value || '' 
        : '';

      const newField = new UIRealField(
        fc, 
        fieldValue
      );

      return newField;
    })).map(fc => this.updateFieldConfig(fc));

    formFields.push(this.dfcs.getDynamicFieldFromOptions({
      id: -1,
      value: this.client?.carIds || '',
      key: 'carIds',
      label: settingsClientsStrings.carIds,
      order: 1,
      controlType: FieldType.Text,
    }))

    this.dynamicFormFields = formFields;
  }

  create() {
    this.loading = true;

    console.log(this.dynamicForm.getValue());

    // const methodObs = this.isEdit
    //   ? this.clientService.updateClient(this.dynamicForm.getValue(), this.id)
    //   : this.clientService.createClient(this.dynamicForm.getValue())

    // methodObs.subscribe(result => {
    //   if (result) {
    //     this.ref.close(true);
    //   } else {
    //     alert(this.isEdit ? 'Клиент не обновлён' : 'Клиент не создан');
    //   }
    // })
  }

  cancel() {
    this.ref.close(false);
  }

  setValidForm(value: boolean) {
    this.formValid = value;
  }

  updateFieldConfig(field: DynamicFieldBase<string>) {
    if (settingsClientsStrings[field.key]) {
      field.label = settingsClientsStrings[field.key];
    }

    console.log(field.key);

    switch (field.key) {
      case FieldNames.Client.paymentType:
        field.label = settingsClientsStrings.paymentType;
        break;
      case FieldNames.Client.tradeInAuto:
        field.label = settingsClientsStrings.tradeInAuto;
        break;
    }

    return field;
  }
}
