import { Component, OnDestroy, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ClientService } from 'src/app/services/client/client.service';
import { UserService } from 'src/app/services/user/user.service';
import { GridActionConfigItem, GridConfigItem } from '../../../shared/grid/grid';
import { ServerClient, getClientSpecialist, getClientStatus, getDealStatus } from 'src/app/entities/client';
import { ServerUser } from 'src/app/entities/user';
import { Subject, takeUntil, tap, zip } from 'rxjs';
import { FieldsUtils, ServerField } from 'src/app/entities/field';
import { SessionService } from 'src/app/services/session/session.service';
import { FieldNames } from '../../../../../../../../src/entities/FieldNames';
import * as moment from 'moment';
import { DateUtils } from 'src/app/entities/utils';
import { ServerRole } from 'src/app/entities/role';
import { settingsClientsStrings } from '../../../settings-clients/settings-clients.strings';
import { DBModels, StringHash } from 'src/app/entities/constants';
import { CarService } from 'src/app/services/car/car.service';
import { ServerCar } from 'src/app/entities/car';
import { CreateClientComponent } from '../../../modals/create-client/create-client.component';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ClientNextActionDataService } from './client-next-action-data.service';
import { skipEmptyFilters } from 'src/app/shared/utils/form-filter.util';
import { SortDirection } from 'src/app/shared/enums/sort-direction.enum';
import { ClientChangeLogsComponent } from '../../../pages/change-log/componets/client-change-logs/client-change-logs.component';

export enum TabIndex {
  MyClients = 0,
  MyFutureClients = 1,
  AllClients = 2,
  SomeClients = 3,
  SomeFutureClients = 4,
}

@Component({
  selector: 'za-client-next-action-dashlet',
  templateUrl: './client-next-action-dashlet.component.html',
  styleUrls: ['./client-next-action-dashlet.component.scss'],
  providers: [UserService, ClientService, DialogService, CarService, ClientNextActionDataService],
})
export class ClientNextActionDashletComponent implements OnInit, OnDestroy {
  first: number = 0;
  sortField = FieldNames.Client.dateNextAction;

  gridConfig!: GridConfigItem<ServerClient.Response>[];
  gridActionsConfig: GridActionConfigItem<ServerClient.Response>[] = [];
  getColorConfig: ((item: ServerClient.Response) => string) | undefined;

  myClientsTotal: number = 0;
  myFutureClientsTotal: number = 0;
  allClientsTotal: number = 0;
  someClientsTotal: number = 0;
  someFutureClientsTotal: number = 0;

  allUsers: ServerUser.Response[] = [];
  specialists: ServerUser.Response[] = [];
  availableSpecialists: { name: string; id: number }[] = [];

  allCars: ServerCar.Response[] = [];

  destoyed = new Subject();
  loading$ = this.clientNextActionDataService.loading$;

  fieldConfigs: ServerField.Response[] = []; // !TODO replace away
  isCarSales = this.sessionService.isCarSales;

  readonly strings = settingsClientsStrings;

  selectedSpecialist: number[] = [];
  activeIndex = 0;

  form: UntypedFormGroup | null = null;

  queriesByTabIndex = {
    [TabIndex.MyClients]: {
      [FieldNames.Client.SpecialistId]:  `${this.sessionService.userId}`,
      [FieldNames.Client.dateNextAction]: '' + +moment(`${moment(new Date()).format('YYYY.MM.DD')} 23:59`),
      [`filter-operator-${FieldNames.Client.dateNextAction}`]: '<',
    },
    [TabIndex.MyFutureClients]: {
      [FieldNames.Client.SpecialistId]: `${this.sessionService.userId}`,
      [FieldNames.Client.dateNextAction]: '' + +moment(`${moment(new Date()).format('YYYY.MM.DD')} 23:59`),
      [`filter-operator-${FieldNames.Client.dateNextAction}`]: '>',
      [`sortField`]: FieldNames.Client.dateNextAction,
      [`sortOrder`]: SortDirection.Desc,
    },
    [TabIndex.AllClients]: {
      [`sortField`]: FieldNames.Client.dateNextAction,
      [`sortOrder`]: SortDirection.Desc, // ?
    },
    [TabIndex.SomeClients]: {
      [FieldNames.Client.dateNextAction]: '' + +moment(`${moment(new Date()).format('YYYY.MM.DD')} 23:59`),
      [`filter-operator-${FieldNames.Client.dateNextAction}`]: '<',
    },
    [TabIndex.SomeFutureClients]: {
      [FieldNames.Client.dateNextAction]: '' + +moment(`${moment(new Date()).format('YYYY.MM.DD')} 23:59`),
      [`filter-operator-${FieldNames.Client.dateNextAction}`]: '>',
      [`sortField`]: FieldNames.Client.dateNextAction,
      [`sortOrder`]: SortDirection.Desc,
    },
  }

  constructor(
    private sessionService: SessionService,
    private userService: UserService,
    private clientService: ClientService,
    private dialogService: DialogService,
    private fb: UntypedFormBuilder,
    public clientNextActionDataService: ClientNextActionDataService
  ) {}

  ngOnInit(): void {
    this.getAdditionalData();

    this.form = this.fb.group({
      specialist: '',
      number: '',
    });

    this.clientNextActionDataService.clientCars$.pipe(
      takeUntil(this.destoyed),
    ).subscribe((cars) => {
      this.allCars = cars;
      this.setGridSettings();
    })
  }

  getTooltipConfig: ((item: ServerClient.Response) => string) = (car) => {
    return FieldsUtils.getFieldStringValue(car, FieldNames.Client.Description)
  };

  onFilter() {
    this.first = 0;
    this.refresh();
  }

  refresh() {
    const query = this.getQuery(this.activeIndex);

    this.clientNextActionDataService.onFilter(skipEmptyFilters(query));
  }

  getQuery(index: TabIndex): StringHash {
    const query: StringHash = {
      [FieldNames.Client.dealStatus]: [FieldNames.DealStatus.InProgress].join(','),
      ...this.queriesByTabIndex[index],
    };

    const { specialist, number } = this.form?.value || {};
    if ([TabIndex.SomeClients, TabIndex.SomeFutureClients].includes(index)) {
      if (specialist) {
        query[FieldNames.Client.SpecialistId] = specialist;
      }
      if (number) {
        query[FieldNames.Client.number] = `%${number}%`;
        query['filter-operator-' + FieldNames.Client.number] = 'LIKE';
      }
    }

    return query;
  }

  getAdditionalData(): void { // TODO separate these requests
    zip(
      this.clientService.getClientFields(),
      this.userService.getUsers(true),
      this.clientService.getClientsByQuery({
        page: 0,
        size: 0,
        ...this.getQuery(TabIndex.MyClients)
      }),
      this.clientService.getClientsByQuery({
        page: 0,
        size: 0,
        ...this.getQuery(TabIndex.MyFutureClients)
      }),
      this.clientService.getClientsByQuery({
        page: 0,
        size: 0,
        ...this.getQuery(TabIndex.AllClients)
      }),
      this.clientService.getClientsByQuery({
        page: 0,
        size: 0,
        ...this.getQuery(TabIndex.SomeClients)
      }),
      this.clientService.getClientsByQuery({
        page: 0,
        size: 0,
        ...this.getQuery(TabIndex.SomeFutureClients)
      }),
    ).pipe(
      takeUntil(this.destoyed),
      tap(([clientFieldsRes, usersFieldsRes, first, second, thirt, fourth, fifth]) => {
        [
          this.myClientsTotal,
          this.myFutureClientsTotal,
          this.allClientsTotal,
          this.someClientsTotal,
          this.someFutureClientsTotal
        ] = [first.total, second.total, thirt.total, fourth.total, fifth.total];

        this.fieldConfigs = clientFieldsRes;
        this.allUsers = usersFieldsRes;
        this.specialists = usersFieldsRes.filter(
          (u) =>
            u.customRoleName === ServerRole.Custom.carSales ||
            u.customRoleName === ServerRole.Custom.carSalesChief ||
            u.customRoleName === ServerRole.Custom.customerService ||
            u.customRoleName === ServerRole.Custom.customerServiceChief ||
            u.roleLevel === ServerRole.System.Admin ||
            u.roleLevel === ServerRole.System.SuperAdmin
        );
        this.availableSpecialists = this.specialists.map((u) => ({
          name: FieldsUtils.getFieldStringValue(u, FieldNames.User.name),
          id: +u.id,
        }));
      })
    ).subscribe();
  }

  setGridSettings() {
    this.gridActionsConfig = this.getGridActionsConfig();
    this.setGridColorConfig();
    this.gridConfig = this.getGridConfig();
  }

  setGridColorConfig(){
    this.getColorConfig = (client) => {
      const status = getClientStatus(client);

      switch (status) {
        case FieldNames.ClientStatus.Thinking: return '#EFD334'
        case FieldNames.ClientStatus.InProgress: return '#99FF99'
        case FieldNames.ClientStatus.HavingInteresting: return '#7FC7FF'

        default: return '';
      }
    }
  }

  getGridConfig(): GridConfigItem<ServerClient.Response>[] {
    return [
      {
        title: 'ID',
        name: 'id',
        getValue: (item: ServerClient.Response) => {
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
        getValue: (item: ServerClient.Response) => DateUtils.getFormatedDate(FieldsUtils.getFieldNumberValue(item, FieldNames.Client.date)),
        sortable: () => true
      },
      {
        title: this.strings[FieldNames.Client.source],
        name: FieldNames.Client.source,
        sortable: () => true,
        getValue: (item: ServerClient.Response) => FieldsUtils.getDropdownValue(item, FieldNames.Client.source),
      },
      {
        title: this.strings[FieldNames.Client.name],
        name: FieldNames.Client.name,
        getValue: (item: ServerClient.Response) => FieldsUtils.getFieldValue(item, FieldNames.Client.name),
      },
      {
        title: this.strings[FieldNames.Client.number],
        name: FieldNames.Client.number,
        getValue: (item: ServerClient.Response) => FieldsUtils.getFieldValue(item, FieldNames.Client.number),
      },
      {
        title: this.strings.carIds,
        name: 'carIds',
        getValue: (item: ServerClient.Response) => {
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
        getValue: (item: ServerClient.Response) => FieldsUtils.getDropdownValue(item, FieldNames.Client.dealStatus),
      },
      {
        title: this.strings[FieldNames.Client.clientStatus],
        name: FieldNames.Client.clientStatus,
        getValue: (item: ServerClient.Response) => FieldsUtils.getDropdownValue(item, FieldNames.Client.clientStatus),
      },
      {
        title: this.strings[FieldNames.Client.nextAction],
        name: FieldNames.Client.nextAction,
        getValue: (item: ServerClient.Response) => FieldsUtils.getFieldValue(item, FieldNames.Client.nextAction),
      },
      {
        title: this.strings[FieldNames.Client.dateNextAction],
        name: FieldNames.Client.dateNextAction,
        sortable: () => true,
        getValue: (item: ServerClient.Response) => DateUtils.getFormatedDate(FieldsUtils.getFieldNumberValue(item, FieldNames.Client.dateNextAction)),
      },
    ];
  }

  getGridActionsConfig(): GridActionConfigItem<ServerClient.Response>[] {
    const configs: GridActionConfigItem<ServerClient.Response>[] = [{
      title: 'Редактировать',
      icon: 'pencil',
      buttonClass: 'secondary',
      disabled: () => false,
      handler: (item: ServerClient.Response) => this.updateClient(item)
    },
    {
      title: 'Следующее действие',
      icon: 'question-circle',
      buttonClass: 'success',
      handler: (item: ServerClient.Response) => this.updateSpecificField(item, FieldNames.Client.nextAction)
    },
    {
      title: 'Изменить статус сделки',
      icon: 'check-circle',
      buttonClass: 'success',
      handler: (item: ServerClient.Response) => this.updateSpecificField(item, FieldNames.Client.dealStatus)
    },
    {
      title: 'Показать все изменения по клиенту',
      icon: 'pencil',
      buttonClass: 'secondary',
      disabled: (client) => false,
      handler: (client) => this.showClientUpdates(client)
    }
    ];

    return configs.filter(config => !config.available || config.available());
  }

  showClientUpdates(client: ServerClient.Response){
    const ref = this.dialogService.open(ClientChangeLogsComponent, {
      data: {
        clientId: client.id,
        fieldConfigs: this.fieldConfigs,
        allUsers: this.allUsers,
        sourceName: DBModels.Table.Clients,
      },
      header: 'Изменения клиента',
      width: '90%'
    });
    // this.subscribeOnCloseModalRef(ref);
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

  updateClient = (client: ServerClient.Response) => {
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


  subscribeOnCloseModalRef(ref: DynamicDialogRef) {
    ref.onClose.pipe(takeUntil(this.destoyed)).subscribe((res) => {
      if (res) {
        this.refresh();
      }
    });
  }

  ngOnDestroy(): void {
    this.destoyed.next(null);
  }
}
