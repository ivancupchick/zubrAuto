import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { CarService } from 'src/app/services/car/car.service';
import { ServerCar } from 'src/app/entities/car';
import { CompleteClientDealComponent } from '../modals/complete-client-deal/complete-client-deal.component';
import { Observable, Subject, zip } from 'rxjs';
import { StringHash } from 'src/app/entities/constants';
import { DateUtils } from 'src/app/entities/utils';

const availableStatuses = [
  FieldNames.DealStatus.Deny,
  FieldNames.DealStatus.InProgress,
  FieldNames.DealStatus.OnDeposit,
  FieldNames.DealStatus.Sold,
];


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
export class SettingsClientsComponent implements OnInit, OnDestroy {
  sortedClients: ServerClient.Response[] = [];
  rawClients: ServerClient.Response[] = [];

  loading = false;

  allCars: ServerCar.Response[] = [];

  gridConfig!: GridConfigItem<ServerClient.Response>[];
  gridActionsConfig: GridActionConfigItem<ServerClient.Response>[] = [];
  getColorConfig: ((item: ServerClient.Response) => string) | undefined;

  fieldConfigs: ServerField.Response[] = [];

  readonly strings = settingsClientsStrings;

  availableStatuses: { label: FieldNames.DealStatus, value: FieldNames.DealStatus }[] = [];
  selectedStatus: FieldNames.DealStatus[] = [];

  destoyed = new Subject<void>();

  constructor(private clientService: ClientService, private dialogService: DialogService, private sessionService: SessionService, private carService: CarService) { }

  ngOnInit(): void {
    this.loading = true;

    this.getData().pipe(
      takeUntil(this.destoyed)
    ).subscribe(cars => {
      this.allCars = cars;
      this.loading = false;
      this.setGridSettings();
    });

    this.availableStatuses = availableStatuses.map(s => ({ label: s, value: s }));

    this.selectedStatus = [
      FieldNames.DealStatus.InProgress,
      FieldNames.DealStatus.OnDeposit,
    ];
  }

  getData(): Observable<ServerCar.Response[]> {
    return zip(this.getClients(), this.clientService.getClientFields()).pipe(
      takeUntil(this.destoyed),
      switchMap(([clientsRes, clientFieldsRes]) => {
        this.fieldConfigs = clientFieldsRes;

        const carIds = clientsRes.reduce<number[]>((prev, client) => {
          const clietnCarIds = client.carIds.split(',').map(id => +id);
          return [...prev, ...clietnCarIds];
        }, []);

        const query: StringHash = { id: carIds.join(',') };

        return this.carService.getCarsByQuery(query);
      })
    );
  }

  setGridSettings() {
    this.gridConfig = this.getGridConfig();
    this.gridActionsConfig = this.getGridActionsConfig();
    this.getGridColorConfig();
  }

  getGridColorConfig(){
    this.getColorConfig = (car) => {
      const status = getClientStatus(car);

      switch (status) {
        case FieldNames.DealStatus.Deny: return '#ff00002b'
        case FieldNames.DealStatus.InProgress: return '#fff'
        case FieldNames.DealStatus.OnDeposit: return '#07ff003d'
        case FieldNames.DealStatus.Sold: return '#005dff3d'

        default: return '';
      }
    }
  }

  getGridConfig(): GridConfigItem<ServerClient.Response>[] {
    return [
    {
      title: this.strings.createDate,
      name: FieldNames.Client.date,
      getValue: (item) => DateUtils.getFormatedDate(FieldsUtils.getFieldNumberValue(item, FieldNames.Client.date)),
    }, {
      title: this.strings.name,
      name: 'name',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Client.name),
    }, {
      title: this.strings.number,
      name: 'number',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Client.number),
    },
    {
      title: this.strings.carIds,
      name: 'carIds',
      getValue: (item) => {
        const needCars = this.allCars.filter(c => item.carIds.split(',').map(id => +id).includes(+c.id));

        const nonCars: string[] = item.carIds.split(',').filter(a => Number.isNaN(+a));

        return [
          ...needCars.map(c => {
            return `
            ${FieldsUtils.getFieldValue(c,FieldNames.Car.mark)}
            ${FieldsUtils.getFieldValue(c,FieldNames.Car.model)}`;
          }),
          ...nonCars
        ].join(', ')
      },
    },
    {
      title: this.strings.dealStatus,
      name: 'dealStatus',
      getValue: (item) => FieldsUtils.getDropdownValue(item, FieldNames.Client.dealStatus),
    },
    {
      title: this.strings.clientStatus,
      name: 'clientStatus',
      getValue: (item) => FieldsUtils.getDropdownValue(item, FieldNames.Client.clientStatus),
    },
    {
      title: this.strings.nextAction,
      name: 'nextAction',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Client.nextAction),
    },
    {
      title: this.strings.nextAction,
      name: 'dateNextAction',
      getValue: (item) => DateUtils.getFormatedDate(FieldsUtils.getFieldNumberValue(item, FieldNames.Client.dateNextAction)),
    }
  ];
  }

  getGridActionsConfig(): GridActionConfigItem<ServerClient.Response>[] {
    const configs: GridActionConfigItem<ServerClient.Response>[] = [{
      title: 'Редактировать',
      icon: 'pencil',
      buttonClass: 'secondary',
      disabled: () => false,
      handler: (client) => this.updateClient(client)
    },
    {
      title: 'Следующее действие',
      icon: 'question-circle',
      buttonClass: 'success',
      handler: (client) => this.updateSpecificField(client, FieldNames.Client.nextAction)
    },
    {
      title: 'Изменить статус сделки',
      icon: 'check-circle',
      buttonClass: 'success',
      handler: (client) => this.updateSpecificField(client, FieldNames.Client.dealStatus)
    },
    // {
    //   title: 'Показы',
    //   icon: 'list',
    //   buttonClass: 'success',
    //   handler: (client) => this.manageCarShowings(client)
    // },
    {
      title: 'Удалить',
      icon: 'times',
      buttonClass: 'danger',
      handler: (client) => this.deleteClient(client),
      disabled: () => !this.sessionService.isAdminOrHigher,
      available: () => this.sessionService.isAdminOrHigher
    }
    // {
    //   title: 'Завершить сделку',
    //   icon: 'check-circle',
    //   buttonClass: 'success',
    //   handler: (client) => this.completeDeal(client)
    // },
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

    this.subscribeOnCloseModalRef(ref);
  }

  updateSpecificField(client: ServerClient.Response, fieldName: string): void {
    const includeFields = fieldName === FieldNames.Client.nextAction
      ? [FieldNames.Client.nextAction, FieldNames.Client.dateNextAction]
      : [fieldName]

    const specificFieldConfigs = this.fieldConfigs.filter(item => includeFields.includes(item.name));

    const ref = this.dialogService.open(CreateClientComponent, {
      data: {
        client,
        fieldConfigs: specificFieldConfigs,
        hasSelectionOfCars: false,
      },
      header: 'Редактировать следующее действие',
      width: '70%'
    });

    this.subscribeOnCloseModalRef(ref);
  }

  deleteClient(client: ServerClient.Response) {
    this.clientService.deleteClient(client.id)
    .pipe(takeUntil(this.destoyed))
      .subscribe(res => {
        if(res){
          this.loading = true;
          this.getClients()
          .pipe(takeUntil(this.destoyed))
          .subscribe(() => {
            this.loading = false;
          });
        }
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
    });

    this.subscribeOnCloseModalRef(ref);
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

  // manageCarShowings(client: ServerClient.Response) {
  //   const ref = this.dialogService.open(ManageCarShowingComponent, {
  //     data: {
  //       clientId: client.id,
  //       carIds: client.carIds.split(',').map(id => +id),
  //     },
  //     header: 'Показы',
  //     width: '70%',
  //   });

  //   this.subscribeOnCloseModalRef(ref);
  // }

  // completeDeal(client: ServerClient.Response) {
  //   const ref = this.dialogService.open(CompleteClientDealComponent, {
  //     data: {
  //       client,
  //       cars: this.allCars.filter(c => client.carIds.includes(`${c.id}`)),
  //     },
  //     header: 'Завершить сделку',
  //     width: '70%',
  //     height: '50%',
  //   });

  //   this.subscribeOnCloseModalRef(ref);
  // }

  getClients() {
    return this.clientService.getClients().pipe(
        tap((res => {
          this.rawClients = [...res];
          this.sortClients();
        }))
      );
  }

  subscribeOnCloseModalRef(ref: DynamicDialogRef) {
    ref.onClose.pipe(takeUntil(this.destoyed)).subscribe(res => {
      if (res) {
        this.loading = true;
        this.getData().pipe(takeUntil(this.destoyed)).subscribe(cars => {
          this.allCars = cars;
          this.loading = false;
          this.setGridSettings();
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destoyed.next();
  }
}
