import { Component, OnInit } from '@angular/core';
import { getClientStatus, ServerClient } from 'src/app/entities/client';
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
import { CarService } from 'src/app/services/car/car.service';
import { ServerCar } from 'src/app/entities/car';
import { ServerUser } from 'src/app/entities/user';
import { CompleteClientDealComponent } from '../modals/complete-client-deal/complete-client-deal.component';


@Component({
  selector: 'za-settings-clients',
  templateUrl: './settings-clients.component.html',
  styleUrls: ['./settings-clients.component.scss'],
  providers: [
    DialogService,
    ClientService,
    CarService
  ]
})
export class SettingsClientsComponent implements OnInit {
  sortedClients: ServerClient.Response[] = [];
  rawClients: ServerClient.Response[] = [];

  loading = false;

  allCars: ServerCar.Response[] = [];

  gridConfig!: GridConfigItem<ServerClient.Response>[];
  gridActionsConfig: GridActionConfigItem<ServerClient.Response>[] = [];

  fieldConfigs: ServerField.Response[] = [];

  readonly strings = settingsClientsStrings;

  availableStatuses: { label: FieldNames.DealStatus, value: FieldNames.DealStatus }[] = [];
  selectedStatus: FieldNames.DealStatus[] = [];

  constructor(private clientService: ClientService, private dialogService: DialogService, private sessionService: SessionService, private carService: CarService) { }

  ngOnInit(): void {
    this.loading = true;

    this.carService.getCars().subscribe(cars => {
      this.allCars = cars;

      this.setGridSettings();
    })

    this.clientService.getClientFields().subscribe(result => {
      this.fieldConfigs = result;
    })

    const availableStatuses = [
      FieldNames.DealStatus.Deny,
      FieldNames.DealStatus.InProgress,
      FieldNames.DealStatus.OnDeposit,
      FieldNames.DealStatus.Sold,
    ];
    this.availableStatuses = [
      ...availableStatuses.map(s => ({ label: s, value: s }))
    ];

    this.selectedStatus = [
      FieldNames.DealStatus.InProgress,
      FieldNames.DealStatus.OnDeposit,
    ];

    this.getClients().subscribe(() => {
      this.loading = false;
    });
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
      getValue: (item) => {
        const needCars = this.allCars.filter(c => item.carIds.includes(`${c.id}`));

        return needCars.map(c => {
          return `${FieldsUtils.getFieldValue(c, FieldNames.Car.mark)} ${FieldsUtils.getFieldValue(c, FieldNames.Car.model)}`;
        }).join(', ')
      },
    }, {
      title: this.strings.paymentType,
      name: 'paymentType',
      getValue: (item) => FieldsUtils.getDropdownValue(item, FieldNames.Client.paymentType),
    }, {
      title: this.strings.tradeInAuto,
      name: 'tradeInAuto',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Client.tradeInAuto),
    }, {
      title: this.strings.dealStatus,
      name: 'dealStatus',
      getValue: (item) => FieldsUtils.getDropdownValue(item, FieldNames.Client.dealStatus),
    }];
  }

  getGridActionsConfig(): GridActionConfigItem<ServerClient.Response>[] {
    const configs: GridActionConfigItem<ServerClient.Response>[] = [{
      title: 'Редактировать',
      icon: 'pencil',
      buttonClass: 'secondary',
      disabled: () => false,
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
    }, {
      title: 'Завершить сделку',
      icon: 'check-circle',
      buttonClass: 'success',
      handler: (client) => this.completeDeal(client)
    }
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

  sortClients() {
    this.sortedClients = this.rawClients.filter(c =>
      this.selectedStatus.includes(getClientStatus(c)) || this.selectedStatus.length === 0
    );
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

  completeDeal(client: ServerClient.Response) {
    const ref = this.dialogService.open(CompleteClientDealComponent, {
      data: {
        client: client,
        cars: this.allCars.filter(c => client.carIds.includes(`${c.id}`)),
      },
      header: 'Завершить сделку',
      width: '70%',
      height: '50%',
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
