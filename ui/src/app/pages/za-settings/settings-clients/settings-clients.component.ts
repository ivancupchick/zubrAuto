import { Component, OnDestroy, OnInit } from '@angular/core';
import { getClientSource, getClientSpecialist, getClientStatus, getDealStatus, ServerClient } from 'src/app/entities/client';
import { FieldsUtils, ServerField } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
import { ClientService } from 'src/app/services/client/client.service';
import { GridActionConfigItem, GridConfigItem } from '../shared/grid/grid.component';
import { settingsClientsStrings } from './settings-clients.strings';

import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import { CreateClientComponent } from '../modals/create-client/create-client.component';
import { SessionService } from 'src/app/services/session/session.service';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { CarService } from 'src/app/services/car/car.service';
import { ServerCar } from 'src/app/entities/car';
import { Observable, Subject, zip } from 'rxjs';
import { StringHash } from 'src/app/entities/constants';
import { DateUtils } from 'src/app/entities/utils';
import { UserService } from 'src/app/services/user/user.service';
import { ServerUser } from 'src/app/entities/user';
import { ServerRole } from 'src/app/entities/role';

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
    CarService,
    UserService
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

  availableClientStatuses: { label: FieldNames.ClientStatus, value: FieldNames.ClientStatus }[] = [];
  selectedClientStatus: FieldNames.ClientStatus[] = [];

  availableClientSources: { label: FieldNames.ClientSource, value: FieldNames.ClientSource }[] = [];
  selectedClientSource: FieldNames.ClientSource[] = [];

  availableSpecialists: { label: string, value: number }[] = [];
  selectedSpecialist: number[] = [];

  specialists: ServerUser.Response[] = [];

  dateFrom: Date | null = null;
  dateTo: Date | null = null;

  phoneNumber = '';

  destoyed = new Subject<void>();

  isCarSalesChiefOrAdmin = this.sessionService.isCarSalesChief || this.sessionService.isAdminOrHigher;

  getTooltipConfig: ((item: ServerClient.Response) => string) = (car) => {
    return FieldsUtils.getFieldStringValue(car, FieldNames.Client.Description)
  };

  constructor(
    private clientService: ClientService,
    private dialogService: DialogService,
    private sessionService: SessionService,
    private carService: CarService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loading = true;

    this.getData().pipe(
      takeUntil(this.destoyed)
    ).subscribe(cars => {
      this.allCars = cars;
      this.sortClients();
      this.loading = false;
      this.setGridSettings();
    });

    this.availableStatuses = availableStatuses.map(s => ({ label: s, value: s }));
    this.availableClientStatuses = Object.values(FieldNames.ClientStatus).map(s => ({ label: s, value: s }));
    this.availableClientSources = Object.values(FieldNames.ClientSource).map(s => ({ label: s, value: s }));

    this.selectedStatus = [
      FieldNames.DealStatus.InProgress,
      FieldNames.DealStatus.OnDeposit,
    ];
  }

  getData(): Observable<ServerCar.Response[]> {
    return zip(this.getClients(), this.clientService.getClientFields(), this.userService.getUsers()).pipe(
      takeUntil(this.destoyed),
      switchMap(([clientsRes, clientFieldsRes, usersFieldsRes]) => {
        this.fieldConfigs = clientFieldsRes;
        this.specialists = usersFieldsRes
          .filter(u => u.customRoleName === ServerRole.Custom.carSales
                    || u.customRoleName === ServerRole.Custom.carSalesChief
                    || u.customRoleName === ServerRole.Custom.customerService
                    || u.customRoleName === ServerRole.Custom.customerServiceChief
                    || (
                      (
                        u.roleLevel === ServerRole.System.Admin || u.roleLevel === ServerRole.System.SuperAdmin
                      )
                    ));

        this.availableSpecialists = this.specialists.map(u => ({ label: FieldsUtils.getFieldStringValue(u, FieldNames.User.name), value: u.id }));

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
      const status = getDealStatus(car);

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
        title: this.strings.id,
        name: 'id',
        getValue: (item) => {
          const userId = FieldsUtils.getFieldNumberValue(item, FieldNames.Client.SpecialistId);
          const specialist: ServerUser.Response = this.specialists.find(user => user.id === userId)!;

          if (userId && specialist) {
            const specialistName = FieldsUtils.getFieldValue(specialist, FieldNames.User.name);

            return `${item.id} ${(specialistName || '').split(' ').map(word => word[0]).join('')}`;
          } else {
            return item.id
          }
        },
      },
      {
        title: this.strings[FieldNames.Client.date],
        name: FieldNames.Client.date,
        getValue: (item) => DateUtils.getFormatedDate(FieldsUtils.getFieldNumberValue(item, FieldNames.Client.date)),
        sortable: () => true
      },
      {
        title: this.strings[FieldNames.Client.source],
        name: FieldNames.Client.source,
        sortable: () => true,
        getValue: (item) => FieldsUtils.getDropdownValue(item, FieldNames.Client.source),
      },
      {
        title: this.strings[FieldNames.Client.name],
        name: FieldNames.Client.name,
        getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Client.name),
      },
      {
        title: this.strings[FieldNames.Client.number],
        name: FieldNames.Client.number,
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
        title: this.strings[FieldNames.Client.dealStatus],
        name: FieldNames.Client.dealStatus,
        getValue: (item) => FieldsUtils.getDropdownValue(item, FieldNames.Client.dealStatus),
      },
      {
        title: this.strings[FieldNames.Client.clientStatus],
        name: FieldNames.Client.clientStatus,
        getValue: (item) => FieldsUtils.getDropdownValue(item, FieldNames.Client.clientStatus),
      },
      {
        title: this.strings[FieldNames.Client.nextAction],
        name: FieldNames.Client.nextAction,
        getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Client.nextAction),
      },
      {
        title: this.strings[FieldNames.Client.dateNextAction],
        name: FieldNames.Client.dateNextAction,
        sortable: () => true,
        getValue: (item) => DateUtils.getFormatedDate(FieldsUtils.getFieldNumberValue(item, FieldNames.Client.dateNextAction)),
      },
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
        fieldConfigs: this.fieldConfigs,
        specialists: this.specialists,
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
        specialists: this.specialists,
      },
      header: 'Редактировать следующее действие',
      width: '70%'
    });

    this.subscribeOnCloseModalRef(ref);
  }

  refresh() {
    this.loading = true;
    this.getClients()
      .pipe(takeUntil(this.destoyed))
      .subscribe(() => {
        this.loading = false;
      });
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
    this.sortedClients = this.rawClients.filter(c => {
      if (this.sessionService.isCarSales) {
        const specialistId = FieldsUtils.getFieldNumberValue(c, FieldNames.Client.SpecialistId);
        return this.sessionService.userId === specialistId;
      }

      return true;
    }).filter(c =>
      FieldsUtils.getFieldStringValue(c, FieldNames.Client.number).toLowerCase().includes(this.phoneNumber.toLowerCase()) || this.phoneNumber === ''
    ).filter(c =>
      this.selectedSpecialist.includes(getClientSpecialist(c)) || this.selectedSpecialist.length === 0
    ).filter(c =>
      this.selectedStatus.includes(getDealStatus(c)) || this.selectedStatus.length === 0
    ).filter(c =>
      this.selectedClientStatus.includes(getClientStatus(c)) || this.selectedClientStatus.length === 0
    ).filter(c =>
      this.selectedClientSource.includes(getClientSource(c)) || this.selectedClientSource.length === 0
    ).filter(c => {
      const createDate = FieldsUtils.getFieldNumberValue(c, FieldNames.Client.date);
      if (!createDate) {
        return true;
      }

      const dateTo = +(this.dateTo || 0) + 86390000; // 86400000 === day in ms
      if (this.dateTo && createDate > +dateTo) {
        return false;
      }

      if (this.dateFrom && createDate < +this.dateFrom) {
        return false;
      }

      return true;
    });
  }

  openNewClientWindow() {
    const ref = this.dialogService.open(CreateClientComponent, {
      data: {
        fieldConfigs: this.fieldConfigs,
        specialists: this.specialists
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
