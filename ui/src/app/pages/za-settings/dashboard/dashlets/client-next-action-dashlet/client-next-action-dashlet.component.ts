import { Component, OnDestroy, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ClientService } from 'src/app/services/client/client.service';
import { UserService } from 'src/app/services/user/user.service';
import { GridActionConfigItem, GridConfigItem } from '../../../shared/grid/grid.component';
import { ServerClient, getDealStatus } from 'src/app/entities/client';
import { ServerUser } from 'src/app/entities/user';
import { Observable, Subject, map, of, switchMap, takeUntil, zip } from 'rxjs';
import { FieldsUtils, ServerField } from 'src/app/entities/field';
import { SessionService } from 'src/app/services/session/session.service';
import { FieldNames } from '../../../../../../../../src/entities/FieldNames';
import * as moment from 'moment';
import { DateUtils } from 'src/app/entities/utils';
import { ServerRole } from 'src/app/entities/role';
import { settingsClientsStrings } from '../../../settings-clients/settings-clients.strings';
import { StringHash } from 'src/app/entities/constants';
import { CarService } from 'src/app/services/car/car.service';
import { ServerCar } from 'src/app/entities/car';
import { CreateClientComponent } from '../../../modals/create-client/create-client.component';

@Component({
  selector: 'za-client-next-action-dashlet',
  templateUrl: './client-next-action-dashlet.component.html',
  styleUrls: ['./client-next-action-dashlet.component.scss'],
  providers: [UserService, ClientService, DialogService, CarService],
})
export class ClientNextActionDashletComponent implements OnInit, OnDestroy {
  loading = true;

  gridConfig!: GridConfigItem<ServerClient.Response>[];
  gridActionsConfig: GridActionConfigItem<ServerClient.Response>[] = [];
  getColorConfig: ((item: ServerClient.Response) => string) | undefined;

  myClients: ServerClient.Response[] = [];
  myFutureClients: ServerClient.Response[] = [];
  allClients: ServerClient.Response[] = [];

  specialists: ServerUser.Response[] = [];
  availableSpecialists: { name: string; id: number }[] = [];

  allCars: ServerCar.Response[] = [];

  destoyed = new Subject();

  fieldConfigs: ServerField.Response[] = []; // !TODO replace away
  isCarSales = this.sessionService.isCarSales;

  readonly strings = settingsClientsStrings;

  constructor(
    private sessionService: SessionService,
    private userService: UserService,
    private clientService: ClientService,
    private dialogService: DialogService,
    private carService: CarService
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.getData().subscribe((cars) => {
      this.allCars = cars;

      this.loading = false;
      this.setGridSettings();
    });
  }

  getData(): Observable<ServerCar.Response[]> {
    return zip(
      this.clientService.getClientsByQuery({
        [FieldNames.Client.dealStatus]: [FieldNames.DealStatus.InProgress, FieldNames.DealStatus.OnDeposit].join(',')
      }),
      this.clientService.getClientFields(),
      this.userService.getUsers()
    ).pipe(
      takeUntil(this.destoyed),
      switchMap(([clientsRes, clientFieldsRes, usersFieldsRes]) => {
        this.fieldConfigs = clientFieldsRes;
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

        this.allClients = clientsRes
          .sort((a, b) => {
            const value1 = FieldsUtils.getFieldStringValue(a, FieldNames.Client.dateNextAction);
            const value2 = FieldsUtils.getFieldStringValue(b, FieldNames.Client.dateNextAction);

            return value1 > value2
              ? -1
              : value1 < value2
                ? 1
                : 0
          });

        const myClients = this.allClients
          .filter(
            (c) => FieldsUtils.getFieldStringValue(c, FieldNames.Client.SpecialistId) === `${this.sessionService.userId}`
          );

        this.myClients = myClients
          .filter(a => FieldsUtils.getFieldNumberValue(a, FieldNames.Client.dateNextAction) < +moment(`${moment(new Date()).format('MM.DD.YYYY')} 23:59`));

        this.myFutureClients = [...myClients]
          .filter(a => FieldsUtils.getFieldNumberValue(a, FieldNames.Client.dateNextAction) > +moment(`${moment(new Date()).format('MM.DD.YYYY')} 23:59`))
          .sort((a, b) => {
            const value1 = FieldsUtils.getFieldStringValue(a, FieldNames.Client.dateNextAction);
            const value2 = FieldsUtils.getFieldStringValue(b, FieldNames.Client.dateNextAction);

            return value1 < value2
              ? -1
              : value1 > value2
                ? 1
                : 0
          });

        const carIds = this.allClients.reduce<number[]>((prev, client) => {
          const clietnCarIds = client.carIds.split(',').map(id => +id);
          return [...prev, ...clietnCarIds];
        }, []);

        if (carIds.length === 0) {
          return of([]);
        }

        const query: StringHash = { id: [...(new Set(carIds))].join(',') };

        return this.carService.getCarsByQuery(query);
      })
    );
  }

  setGridSettings() {
    this.gridActionsConfig = this.getGridActionsConfig();
    this.setGridColorConfig();
    this.gridConfig = this.getGridConfig();
  }

  setGridColorConfig(){
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
        title: 'ID',
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
    ];

    return configs.filter(config => !config.available || config.available());
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


  subscribeOnCloseModalRef(ref: DynamicDialogRef) {
    ref.onClose.pipe(takeUntil(this.destoyed)).subscribe((res) => {
      if (res) {
        this.loading = true;
        this.fetchData();
      }
    });
  }

  ngOnDestroy(): void {
    this.destoyed.next(null);
  }
}
