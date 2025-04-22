import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChangeLogDataService } from './services/change-log-data.service';
import { ChangeLogItem } from './interfaces/change-log';
import { GridActionConfigItem, GridConfigItem } from '../../shared/grid/grid';
import { Observable, Subject, finalize, map, takeUntil, zip } from 'rxjs';
import { SessionService } from 'src/app/services/session/session.service';
import { UserService } from 'src/app/services/user/user.service';
import { ServerUser } from 'src/app/entities/user';
import { ServerRole } from 'src/app/entities/role';
import { FieldsUtils, ServerField } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
import { DateUtils } from 'src/app/shared/utils/date.util';
import { DialogService } from 'primeng/dynamicdialog';
import { ClientChangeLogsComponent } from './componets/client-change-logs/client-change-logs.component';
import { ClientService } from 'src/app/services/client/client.service';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { skipEmptyFilters } from 'src/app/shared/utils/form-filter.util';
import { FieldService } from 'src/app/services/field/field.service';
import { DBModels, StringHash } from 'src/app/entities/constants';

@Component({
  selector: 'za-change-log',
  templateUrl: './change-log.component.html',
  styleUrls: ['./change-log.component.scss'],
})
export class ChangeLogComponent implements OnInit, OnDestroy {
  first: number = 0;
  // sortedClients: ChangeLogItem[] = [];
  // rawClients: ChangeLogItem[] = [];
  list: ChangeLogItem[] = [];

  loading = false;

  protected form!: UntypedFormGroup;

  domains = [
    { name: 'Машины', value: DBModels.Table.Cars },
    { name: 'Клиент', value: DBModels.Table.Clients },
    { name: 'Пользователь', value: DBModels.Table.Users },
    { name: 'Заявки', value: DBModels.Table.CallRequests },
    { name: 'Звонки', value: DBModels.Table.PhoneCalls },
  ];

  sold = false;

  // allCars: ServerCar.Response[] = [];

  gridConfig!: GridConfigItem<ChangeLogItem>[];
  gridActionsConfig: GridActionConfigItem<ChangeLogItem>[] = [];
  getColorConfig: ((item: ChangeLogItem) => string) | undefined;

  fieldConfigs: ServerField.Response[] = [];

  // availableStatuses: { label: FieldNames.DealStatus, value: FieldNames.DealStatus }[] = [];
  // selectedStatus: FieldNames.DealStatus[] = [];

  // availableClientStatuses: { label: FieldNames.ClientStatus, value: FieldNames.ClientStatus }[] = [];
  // selectedClientStatus: FieldNames.ClientStatus[] = [];

  // availableClientSources: { label: FieldNames.ClientSource, value: FieldNames.ClientSource }[] = [];
  // selectedClientSource: FieldNames.ClientSource[] = [];

  // availableSpecialists: { label: string, value: number }[] = [];
  // selectedSpecialist: number[] = [];

  specialists: ServerUser.Response[] = [];
  allUsers: ServerUser.Response[] = [];

  // dateFrom: Date | null = null;
  // dateTo: Date | null = null;

  // phoneNumber = '';

  destoyed = new Subject<void>();

  // isCarSalesChiefOrAdmin = this.sessionService.isCarSalesChief || this.sessionService.isAdminOrHigher;

  // getTooltipConfig: ((item: ChangeLogItem) => string) = (car) => {
  //   return FieldsUtils.getFieldStringValue(car, FieldNames.Client.Description)
  // };

  constructor(
    public changeLogDataService: ChangeLogDataService,
    private clientService: ClientService,
    private fieldService: FieldService,
    private dialogService: DialogService,
    private sessionService: SessionService,
    // private carService: CarService,
    private userService: UserService,
    private fb: UntypedFormBuilder,
  ) {}

  users: {
    name: string;
    id: number;
  }[] = [];

  ngOnInit(): void {
    this.loading = true;

    this.getData()
      .pipe(
        takeUntil(this.destoyed),
        finalize(() => (this.loading = false)),
      )
      .subscribe(() => {
        this.setGridSettings();
        this.users = this.allUsers.map((user) => ({
          name: FieldsUtils.getFieldValue(user, FieldNames.User.name),
          id: user.id,
        }));

        this.form = this.fb.group({
          sourceName: [''],
          userId: [''],
          date: [''],
        });
      });

    // this.availableStatuses = availableStatuses.map(s => ({ label: s, value: s }));
    // this.availableClientStatuses = Object.values(FieldNames.ClientStatus).map(s => ({ label: s, value: s }));
    // this.availableClientSources = Object.values(FieldNames.ClientSource).map(s => ({ label: s, value: s }));

    // this.selectedStatus = [
    //   FieldNames.DealStatus.InProgress,
    //   FieldNames.DealStatus.OnDeposit,
    // ];

    // setTimeout(() => {
    //   this.rawClients.forEach(c => this.deleteClient(c));
    // }, 20000);
  }

  getData(): Observable<any> {
    return zip(
      // this.getClients(),
      this.fieldService.getFields(),
      this.userService.getAllUsers(true),
    ).pipe(
      takeUntil(this.destoyed),
      map(([fieldConfigs, usersFieldsRes]) => {
        this.fieldConfigs = fieldConfigs;
        this.allUsers = usersFieldsRes.list;
        this.specialists = usersFieldsRes.list
          .filter((s: any) => +s.deleted === 0)
          .filter(
            (u) =>
              u.customRoleName === ServerRole.Custom.carSales ||
              u.customRoleName === ServerRole.Custom.carSalesChief ||
              u.customRoleName === ServerRole.Custom.customerService ||
              u.customRoleName === ServerRole.Custom.customerServiceChief ||
              u.roleLevel === ServerRole.System.Admin ||
              u.roleLevel === ServerRole.System.SuperAdmin,
          );

        // this.availableSpecialists = this.specialists.map(u => ({ label: FieldsUtils.getFieldStringValue(u, FieldNames.User.name), value: u.id }));

        return null;
      }),
    );
  }

  setGridSettings() {
    this.gridConfig = this.getGridConfig();
    this.gridActionsConfig = this.getGridActionsConfig();
    this.getGridColorConfig();
  }

  getGridColorConfig() {
    // this.getColorConfig = (client) => {
    //   const status = getDealStatus(client);
    //   switch (status) {
    //     case FieldNames.DealStatus.Deny: return '#ff00002b'
    //     // case FieldNames.DealStatus.InProgress: return '#fff'
    //     case FieldNames.DealStatus.OnDeposit: return '#07ff003d'
    //     case FieldNames.DealStatus.Sold: return '#005dff3d'
    //   }
    //   const clientStatus = getClientStatus(client);
    //   switch (clientStatus) {
    //     case FieldNames.ClientStatus.Thinking: return '#EFD334'
    //     case FieldNames.ClientStatus.InProgress: return '#99FF99'
    //     case FieldNames.ClientStatus.HavingInteresting: return '#7FC7FF'
    //   }
    //   return '';
    // }
  }

  getGridConfig(): GridConfigItem<ChangeLogItem>[] {
    return [
      {
        title: 'ID',
        name: 'id',
        getValue: (item) => {
          // const specialist: ServerUser.Response = this.specialists.find(user => user.id === item.userId)!;

          // if (item.userId && specialist) {
          //   const specialistName = FieldsUtils.getFieldValue(specialist, FieldNames.User.name);

          //   return `${item.id} ${(specialistName || '').split(' ').map(word => word[0]).join('')}`;
          // } else {
          return item.id;
          // }
        },
      },
      {
        title: 'Дата',
        name: 'date',
        getValue: (item) => DateUtils.getFormatedDate(+item.date.toString()),
        sortable: () => true,
      },
      {
        title: 'Пользователь',
        name: 'userId',
        getValue: (item) => {
          const specialist: ServerUser.Response = this.allUsers.find(
            (user) => user.id === item.userId,
          )!;

          if (item.userId && specialist) {
            return FieldsUtils.getFieldValue(specialist, FieldNames.User.name);
          }

          return 'Никто';
        },
        // sortable: () => true
      },
      {
        title: 'Домен',
        name: 'sourceName',
        // sortable: () => true,
        getValue: (item) => item.sourceName,
      },
      {
        title: 'Тип операции',
        name: 'type',
        // sortable: () => true,
        getValue: (item) => item.type,
      },
    ];
  }

  showItemUpdates(changeLogItem: ChangeLogItem) {
    let modalHeader;
    switch (changeLogItem.sourceName) {
      case DBModels.Table.Cars:
        modalHeader = 'машинам';
        break;
      case DBModels.Table.Users:
        modalHeader = 'пользователям';
        break;
      case DBModels.Table.Clients:
        modalHeader = 'клиентам';
        break;
      default:
        modalHeader = 'категории';
    }
    const ref = this.dialogService.open(ClientChangeLogsComponent, {
      data: {
        itemId: changeLogItem.sourceId,
        fieldConfigs: this.fieldConfigs,
        allUsers: this.allUsers,
        sourceName: changeLogItem.sourceName,
      },
      header: `Изменения по ${modalHeader}`,
      width: '90%',
    });
    // this.subscribeOnCloseModalRef(ref);
  }
  getGridActionsConfig(): GridActionConfigItem<ChangeLogItem>[] {
    const configs: GridActionConfigItem<ChangeLogItem>[] = [
      {
        title: 'Показать все изменения',
        icon: 'pencil',
        buttonClass: 'secondary',
        disabled: (client) => false,
        updater: (instance, item) => {
          const categoryByTableName: StringHash = {
            [DBModels.Table.Clients]: 'клиенту',
            [DBModels.Table.Users]: 'пользователю',
            [DBModels.Table.Cars]: 'машине',
            [DBModels.Table.CallRequests]: 'заявке',
          };

          const entity = categoryByTableName[item?.sourceName];
          if (entity) {
            instance.title = `Посмотеть все изменения по ${entity} c id = ${item.sourceId}`;
          }

          return instance;
        },
        handler: (itemById) => this.showItemUpdates(itemById),
      },
    ];

    return configs.filter((config) => !config.available || config.available());
  }

  onFilter() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    let payload = skipEmptyFilters({ ...this.form.value });

    if (this.sold) {
      payload = {
        ...payload,
        ['activities']: `%${FieldNames.Client.dealStatus}-2%`,
        ['filter-operator-activities']: 'LIKE',
      };
    }

    if (payload.date) {
      payload = {
        ...payload,
        date: +payload.date,
        ['filter-operator-date']: '>',
      };
    }

    this.changeLogDataService.onFilter(payload);
    this.first = 0;
  }

  ngOnDestroy(): void {
    this.destoyed.next();
  }
}
