import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ServerClient } from 'src/app/entities/client';
import { ServerField, FieldType, UIRealField } from 'src/app/entities/field';
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

  @Input() client: ServerClient.GetResponse | undefined = undefined;
  @Input() fieldConfigs: ServerField.Entity[] = [];

  formValid = false;

  dynamicFormFields: DynamicFieldBase<string>[] = [];

  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  excludeFields: FieldNames.Client[] = [
    FieldNames.Client.date,
    'carIds' as FieldNames.Client
  ];

  constructor(
    private clientService: ClientService,
    private dfcs: DynamicFieldControlService,

    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {
    this.client = this.config?.data?.client || undefined;
  }

  ngOnInit(): void {
    
    this.fieldConfigs = this.config.data.fieldConfigs;

    const formFields = this.dfcs.getDynamicFieldsFromDBFields(this.fieldConfigs
      .filter(fc => !this.excludeFields.includes(fc.name as FieldNames.Client))
      .map(fc => {
        const fieldValue = !!this.client 
          ? this.client.fields.find(f => f.id === fc.id)?.value || '' 
          : '';

        const newField = new UIRealField(
          fc, 
          fieldValue
        );

        return newField;
      }))
        .map(fc => this.updateFieldConfig(fc));

    formFields.push(this.dfcs.getDynamicFieldFromOptions({
      id: -1,
      value: this.client?.carIds || '',
      key: 'carIds',
      label: settingsClientsStrings.carIds,
      order: 1,
      controlType: FieldType.Text,
      readonly: true
    }))

    this.dynamicFormFields = formFields;
  }

  create() {
    this.loading = true;

    console.log(this.dynamicForm.getValue());

    const fields = this.dynamicForm.getValue();

    const client: ServerClient.CreateRequest = {
      carIds: '',
      fields: fields.filter(fc => !this.excludeFields.includes(fc.name as FieldNames.Client))
    } 

    const dateField = this.fieldConfigs.find(fc => fc.name === FieldNames.Client.date);

    if (dateField && !this.client) {
      client.fields.push({
        id: dateField.id,
        name: dateField.name,
        value: (new Date()).getDate().toString()
      })
    } else {
      throw new Error("Сфотографируйте ошибку и отправьте покажите фото администратору");
    }

    const methodObs = this.client != undefined
      ? this.clientService.updateClient(client, (this.client as ServerClient.GetResponse).id)
      : this.clientService.createClient(client)

    methodObs.subscribe(result => {
      if (result) {
        this.ref.close(true);
      } else {
        alert(!!this.client ? 'Клиент не обновлён' : 'Клиент не создан');
      }
    })
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
