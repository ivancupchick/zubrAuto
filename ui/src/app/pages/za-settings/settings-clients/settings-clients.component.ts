import { Component, OnInit } from '@angular/core';
import { ServerClient } from 'src/app/entities/client';
import { FieldsUtils, ServerField } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
import { ClientService } from 'src/app/services/client/client.service';
import { GridActionConfigItem, GridConfigItem } from '../shared/grid/grid.component';
import { settingsClientsStrings } from './settings-clients.strings';

import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import { CreateClientComponent } from '../modals/create-client/create-client.component';
import { SessionService } from 'src/app/services/session/session.service';
import { ManageCarShowingComponent } from '../modals/manage-car-showing/manage-car-showing.component';
import { tap } from 'rxjs/operators';


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
  sortedClients: ServerClient.Response[] = [];
  rawClients: ServerClient.Response[] = [];

  loading = false;

  gridConfig!: GridConfigItem<ServerClient.Response>[];
  gridActionsConfig: GridActionConfigItem<ServerClient.Response>[] = [];

  fieldConfigs: ServerField.Response[] = [];

  readonly strings = settingsClientsStrings;

  constructor(private clientService: ClientService, private dialogService: DialogService, private sessionService: SessionService) { }

  ngOnInit(): void {
    this.loading = true;

    this.clientService.getClientFields().subscribe(result => {
      this.fieldConfigs = result;
    })

    this.getClients().subscribe(() => {
      this.loading = false;
    });

    this.setGridSettings();
  }

  setGridSettings() {
    this.gridConfig = this.getGridConfig();
    this.gridActionsConfig = this.getGridActionsConfig();
  }

  getGridConfig(): GridConfigItem<ServerClient.Response>[] {
    return [{
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

  getGridActionsConfig(): GridActionConfigItem<ServerClient.Response>[] {
    const configs: GridActionConfigItem<ServerClient.Response>[] = [{
      title: 'Редактировать',
      icon: 'pencil',
      buttonClass: 'secondary',
      disabled: () => this.fieldConfigs.length === 0,
      handler: (client) => this.updateClient(client)
    }, {
      title: 'Удалить',
      icon: 'times',
      buttonClass: 'danger',
      handler: (client) => this.deleteClient(client),
      disabled: () => !this.sessionService.isAdminOrHigher,
      available: () => this.sessionService.isAdminOrHigher
    }, {
      title: 'Показы',
      icon: 'list',
      buttonClass: 'success',
      handler: (client) => this.manageCarShowings(client)
    },
    ];

    return configs.filter(config => !config.available || config.available());
  }

  updateClient(client: ServerClient.Response) {
    const ref = this.dialogService.open(CreateClientComponent, {
      data: {
        client,
        fieldConfigs: this.fieldConfigs
      },
      header: 'Редактировать клиента',
      width: '70%'
    });
  }

  deleteClient(client: ServerClient.Response) {
    this.clientService.deleteClient(client.id)
      .subscribe(res => {
      });
  }

  private sortClients() {
    this.sortedClients = this.rawClients;
  }

  openNewClientWindow() {
    const ref = this.dialogService.open(CreateClientComponent, {
      data: {
        fieldConfigs: this.fieldConfigs
      },
      header: 'Новый клиент',
      width: '70%',
      // height: '90%',
    });
  }

  // addShowing(client: ServerClient.Response) {
  //   const ref = this.dialogService.open(ManageCarShowingComponent, {
  //     data: {
  //       clientId: client.id,
  //       carIds: client.carIds.split(',').map(id => +id),
  //       // availableStatuses: [
  //       //   FieldNames.CarStatus.customerService_OnDelete,
  //       // ],
  //       comment: FieldsUtils.getFieldValue(client, FieldNames.Client.comment),
  //       mode: 'add',
  //     },
  //     header: 'Добавить показ',
  //     width: '70%',
  //   });

  //   this.subscribeOnCloseModalRef(ref);
  // }

  manageCarShowings(client: ServerClient.Response) {
    const ref = this.dialogService.open(ManageCarShowingComponent, {
      data: {
        clientId: client.id,
        carIds: client.carIds.split(',').map(id => +id),
      },
      header: 'Показы',
      width: '70%',
    });

    this.subscribeOnCloseModalRef(ref);
  }

  getClients() {
    return this.clientService.getClients().pipe(
        tap((res => {
          this.rawClients = [...res];
          this.sortClients();
        }))
      );
  }

  subscribeOnCloseModalRef(ref: DynamicDialogRef) {
    ref.onClose
      .subscribe(res => {
        if (res) {
          this.loading = true;
          // this.carService.getCars().subscribe((result) => {
          //   this.rawCars = result;
          //   this.sortCars();
          // })
          this.getClients().subscribe(() => {
            this.loading = false;
          });
        }
      })
  }
}
