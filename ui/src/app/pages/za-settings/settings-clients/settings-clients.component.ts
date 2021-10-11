import { Component, OnInit } from '@angular/core';
import { DBClient } from 'src/app/entities/client';
import { FieldsUtils } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
import { ClientService } from 'src/app/services/client/client.service';
import { GridActionConfigItem, GridConfigItem } from '../shared/grid/grid.component';
import { settingsClientsStrings } from './settings-clients.strings';

import {DialogService} from 'primeng/dynamicdialog';
import { CreateClientComponent } from '../modals/create-client/create-client.component';


@Component({
  selector: 'za-settings-clients',
  templateUrl: './settings-clients.component.html',
  styleUrls: ['./settings-clients.component.scss'],
  providers: [
    DialogService,
    ClientService
  ]
})
export class SettingsClientsComponent implements OnInit {
  sortedClients: DBClient[] = [];
  rawClients: DBClient[] = [];

  gridConfig!: GridConfigItem<DBClient>[];
  gridActionsConfig:  GridActionConfigItem<DBClient>[] = [{
    title: '',
    icon: 'pencil',
    buttonClass: 'secondary',
    handler: (client) => this.updateClient(client)
  }, {
    title: '',
    icon: 'times',
    buttonClass: 'danger',
    handler: (client) => this.deleteClient(client)
  }]

  readonly strings = settingsClientsStrings;

  constructor(private clientService: ClientService, private dialogService: DialogService) { }

  ngOnInit(): void {
    this.clientService.getClients().subscribe((result) => {
      this.rawClients = result;
      this.sortClients();
    })

    this.gridConfig = [{
      title: this.strings.id,
      name: 'id',
      getValue: (item) => item.id,
    }, {
      title: this.strings.date,
      name: 'date',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Client.date),
    }, {
      title: this.strings.source,
      name: 'source',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Client.source),
    }, {
      title: this.strings.name,
      name: 'name',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Client.name),
    }, {
      title: this.strings.number,
      name: 'number',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Client.number),
    }, {
      title: this.strings.email,
      name: 'email',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Client.email),
    }, {
      title: this.strings.carIds,
      name: 'carIds',
      getValue: (item) => item.carIds,
    }, {
      title: this.strings.paymentType,
      name: 'paymentType',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Client.paymentType),
    }, {
      title: this.strings.tradeInAuto,
      name: 'tradeInAuto',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Client.tradeInAuto),
    }];
  }

  updateClient(client: DBClient) {
    console.log(client);
  }

  deleteClient(client: DBClient) {
    console.log(client);
  }

  private sortClients() {
    this.sortedClients = this.rawClients;
  }

  openNewClientWindow() {
    const ref = this.dialogService.open(CreateClientComponent, {
      data: {
        domain: null // TODO! delete
      },
      header: 'Новый клиент',
      width: '70%'
    });
  }

  // updateField(client: GridField) {
  //   const ref = this.dialogService.open(CreateFieldComponent, {
  //     data: {
  //       domain: this.selectedDomain,
  //       isEdit: true,
  //       id: +field.id,
  //       field: this.rawFields.find(rf => `${rf.id}` === `${field.id}`)
  //     },
  //     header: 'Редактирование филда',
  //     width: '70%'
  //   });
  // }
}
