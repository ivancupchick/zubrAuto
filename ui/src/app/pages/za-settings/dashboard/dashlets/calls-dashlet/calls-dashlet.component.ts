import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from 'src/app/services/session/session.service';
import { RequestService } from 'src/app/services/request/request.service';
import { environment } from 'src/environments/environment';
import { ServerPhoneCall, Webhook } from 'src/app/entities/phone-calls';
import { GridActionConfigItem, GridConfigItem } from '../../../shared/grid/grid';
import { ServerUser } from 'src/app/entities/user';
import { ServerClient } from 'src/app/entities/client';
import { Observable, Subject, takeUntil, tap, zip } from 'rxjs';
import { FieldsUtils, ServerField } from 'src/app/entities/field';
import { DialogService } from 'primeng/dynamicdialog';
import { ClientService } from 'src/app/services/client/client.service';
import { UserService } from 'src/app/services/user/user.service';
import { ServerRole } from 'src/app/entities/role';
import { FieldNames } from 'src/app/entities/FieldNames';
import { DateUtils } from 'src/app/shared/utils/date.util';
import { CreateClientComponent } from '../../../modals/create-client/create-client.component';
import { BaseList, StringHash } from 'src/app/entities/constants';
import { CallsDashletDataService } from './calls-dashlet-data.service';
import { SortDirection } from 'src/app/shared/enums/sort-direction.enum';

const isPhoneCallUsed = (allClients: ServerClient.Response[], call: ServerPhoneCall.Response) => !!allClients.find(c => FieldsUtils.getFieldStringValue(c, FieldNames.Client.number) === `+${call.clientNumber}`);

export enum TabIndex {
  MyPhoneCalls = 0,
  AllPhoneCalls = 1,
  UsedPhoneCalls = 2,
}

@Component({
  selector: 'za-calls-dashlet',
  templateUrl: './calls-dashlet.component.html',
  styleUrls: ['./calls-dashlet.component.scss'],
  providers: [
    UserService,
    ClientService,
    DialogService,
    CallsDashletDataService,
  ]
})
export class CallsDashletComponent implements OnInit, OnDestroy {
  first = 0;
  sortField = 'id';
  activeIndex: TabIndex = 0;

  gridConfig!: GridConfigItem<ServerPhoneCall.Response>[];
  gridActionsConfig: GridActionConfigItem<ServerPhoneCall.Response>[] = [];
  getColorConfig: ((item: ServerPhoneCall.Response) => string) | undefined;

  myPhoneTotal: number = 0;
  allPhoneTotal: number = 0;
  usedPhoneTotal: number = 0;

  specialists: ServerUser.Response[] = [];
  allUsers: ServerUser.Response[] = [];
  currentUser!: ServerUser.Response;
  availableSpecialists: { name: string, id: number }[] = [];
  allClients: ServerClient.Response[] = [];

  destoyed = new Subject();

  clientsFieldConfigs: ServerField.Response[] = []; // !TODO replace away
  isCarSales = this.sessionService.isCarSales;

  queriesByTabIndex: {
    [key in TabIndex]: StringHash
  } | null = null;

  constructor(
    private sessionService: SessionService,
    private requestService: RequestService,
    private userService: UserService,
    private clientService: ClientService,
    private dialogService: DialogService,
    public callsDataService: CallsDashletDataService,
    ) { }

  ngOnInit(): void {
    this.getAdditionalData()
      .pipe(takeUntil(this.destoyed))
      .subscribe(() => {
        this.callsDataService.ready = true;
        this.getTotals().subscribe();
        this.refresh(); }
      );

    this.callsDataService.clients$.pipe(
      takeUntil(this.destoyed),
    ).subscribe((clientsRes) => {
      this.allClients = clientsRes.list;
      this.setGridSettings(); // TODO replace upper
    });
  }

  refresh() {
    if (!this.currentUser) {
      return;
    }

    const query = this.getQuery(this.activeIndex);

    this.callsDataService.onFilter(query);
    this.getTotals().subscribe();
  }

  getQuery(index: TabIndex): StringHash {
    if (!this.queriesByTabIndex) {
      return {};
    }

    const query: StringHash = {
      ['type']: Webhook.CallType.Inbound,
      [`sortField`]: 'id',
      [`sortOrder`]: SortDirection.Desc,
      ...this.queriesByTabIndex[index],
    };

    // filters

    return query;
  }

  getAdditionalData(): Observable<unknown> {
    return zip(
      this.clientService.getClientFields(),
      this.userService.getAllUsers(true),
      this.userService.getUser(this.sessionService.userId),
    ).pipe(
      takeUntil(this.destoyed),
      tap(([clientFieldsRes, usersFieldsRes, currentUser]) => {
        this.clientsFieldConfigs = clientFieldsRes;

        this.currentUser = currentUser;

        this.allUsers = usersFieldsRes.list; // TODO optimize
        this.specialists = usersFieldsRes.list.filter((s: any) => +s.deleted === 0)
          .filter(u => u.customRoleName === ServerRole.Custom.carSales
                    || u.customRoleName === ServerRole.Custom.carSalesChief
                    || u.customRoleName === ServerRole.Custom.customerService
                    || u.customRoleName === ServerRole.Custom.customerServiceChief
                  || (
                      (
                        u.roleLevel === ServerRole.System.Admin || u.roleLevel === ServerRole.System.SuperAdmin
                      )
                    ));

        this.availableSpecialists = this.specialists.map(u => ({ name: FieldsUtils.getFieldStringValue(u, FieldNames.User.name), id: +u.id }));

        this.queriesByTabIndex = {
          [TabIndex.MyPhoneCalls]: {
            ['innerNumber']: FieldsUtils.getFieldStringValue(this.currentUser.fields, FieldNames.User.number).slice(1),
            ['isUsed']: '0',
          },
          [TabIndex.AllPhoneCalls]: {
          },
          [TabIndex.UsedPhoneCalls]: {
            ['isUsed']: '1',
            ...(!this.sessionService.isAdminOrHigher ? {
              ['innerNumber']: FieldsUtils.getFieldStringValue(this.currentUser.fields, FieldNames.User.number).slice(1)
            } : {})
          },
        }
      })
    );
  }

  getTotals() {
    return zip(
      this.requestService.get<BaseList<ServerPhoneCall.Response>>(`${environment.serverUrl}/${'phone-call'}`, {
        page: 0,
        size: 0,
        ...this.getQuery(TabIndex.MyPhoneCalls)
      }),
      this.requestService.get<BaseList<ServerPhoneCall.Response>>(`${environment.serverUrl}/${'phone-call'}`, {
        page: 0,
        size: 0,
        ...this.getQuery(TabIndex.AllPhoneCalls)
      }),
      this.requestService.get<BaseList<ServerPhoneCall.Response>>(`${environment.serverUrl}/${'phone-call'}`, {
        page: 0,
        size: 0,
        ...this.getQuery(TabIndex.UsedPhoneCalls)
      }),
    ).pipe(
      takeUntil(this.destoyed),
      tap(([first, second, thirt]) => {
        [
          this.myPhoneTotal,
          this.allPhoneTotal,
          this.usedPhoneTotal,
        ] = [first.total, second.total, thirt.total];
      })
    );
  }

  // getPhoneCalls(): Observable<ServerPhoneCall.Response[]> {
  //   return this.requestService.get<BaseList<ServerPhoneCall.Response>>(`${environment.serverUrl}/${'phone-call'}`, { page: 1, size: 100, type: Webhook.CallType.Inbound })
  //     .pipe(map(result => {
  //       const allRequests = result.list.sort((a, b) => (a.createdDate > b.createdDate) ? -1 : (a.createdDate < b.createdDate) ? 1 : 0);

  //       // this.allPhoneCalls = [...allRequests];
  //       // this.myPhoneCalls = allRequests.filter(call => `+${call.innerNumber}` === FieldsUtils.getFieldStringValue(this.currentUser.fields, FieldNames.User.number) && !call.isUsed);
  //       // this.usedPhoneCalls = allRequests.filter(call => call.isUsed);

  //       if (!this.sessionService.isAdminOrHigher) {
  //         this.usedPhoneCalls = allRequests.filter(call => `+${call.innerNumber}` === FieldsUtils.getFieldStringValue(this.currentUser.fields, FieldNames.User.number) && call.isUsed);
  //       }

  //       return this.allPhoneCalls;
  //     }))
  // }

  setGridSettings() {
    this.gridActionsConfig = this.getGridActionsConfig();
    this.setGridColorConfig();
    this.gridConfig = this.getGridConfig();
  }

  setGridColorConfig(){
    this.getColorConfig = (call) => {
      // const status = getDealStatus(call);

      // switch (status) {
      //   case FieldNames.DealStatus.Deny: return '#ff00002b'
      //   case FieldNames.DealStatus.InProgress: return '#fff'
      //   case FieldNames.DealStatus.OnDeposit: return '#07ff003d'
      //   case FieldNames.DealStatus.Sold: return '#005dff3d'

      //   default: return '';
      // }

      return '';
    }
  }

  JSONParse(string: string) {
    try {
      return JSON.parse(string)
    } catch (error) {
      return {}
    }
  }

  getGridConfig(): GridConfigItem<ServerPhoneCall.Response>[] {
    return [
      {
        title: 'ID',
        name: 'id',
        getValue: (item) => item.id,
      },
      {
        title: 'Дата',
        name: 'createdDate',
        getValue: (item) => DateUtils.getFormatedDateTime(+item.createdDate),
        sortable: () => true
      },
      {
        title: 'Вызов',
        name: 'call',
        getValue: (item) => item.type === Webhook.CallType.Outbound ? 'Исходящий' : item.type === Webhook.CallType.Internal ? 'Внутренний' : 'Входящий',
      },
      {
        title: 'Номер человека',
        name: 'clientNumber',
        sortable: () => true,
        getValue: (item) => '+' + item.clientNumber,
      },
      {
        title: 'Номер специалиста',
        name: 'clientNumber',
        sortable: () => true,
        getValue: (item) => '+' + item.innerNumber,
      },
      {
        title: 'Специалист',
        name: 'clientNumber',
        sortable: () => true,
        getValue: (item) => !item.innerNumber ? 'Никто' : FieldsUtils.getFieldStringValue(this.allUsers.find(u => FieldsUtils.getFieldStringValue(u.fields, FieldNames.User.number) === `+${item.innerNumber}`)!, FieldNames.User.name) || 'Никто',
      },
      {
        title: 'Клиент создан',
        name: 'clientIsCreated',
        sortable: () => true,
        getValue: (item) => isPhoneCallUsed(this.allClients, item) ? 'Да' : 'Нет',
      },
      {
        title: 'ID клиента',
        name: 'clientIsCreated',
        sortable: () => true,
        getValue: (item) => this.getClientSpecialist(item),
      },
    ];
  }

  getClientSpecialist(call: ServerPhoneCall.Response): string  { // TODO refactor this and isPhoneCallUsed
    const client = this.allClients.find(c => FieldsUtils.getFieldStringValue(c, FieldNames.Client.number) === `+${call.clientNumber}`)!;

    if (!client) {
      return '';
    }

    const userId = FieldsUtils.getFieldNumberValue(client, FieldNames.Client.SpecialistId);
    const specialist: ServerUser.Response = this.specialists.find(user => user.id === userId)!;

    if (userId && specialist) {
      const specialistName = FieldsUtils.getFieldValue(specialist, FieldNames.User.name);

      return `${client.id} ${(specialistName || '').split(' ').map(word => word[0]).join('')}`;
    } else {
      return `${client.id}`
    }
  }

  getGridActionsConfig(): GridActionConfigItem<ServerPhoneCall.Response>[] {
    const configs: GridActionConfigItem<ServerPhoneCall.Response>[] = [{
      title: 'Создать клиента',
      icon: 'user',
      buttonClass: 'secondary',
      disabled: (c) => !c || isPhoneCallUsed(this.allClients, c), // TODO why need !c
      handler: (c) => this.openNewClientWindow(c),
    },
    {
      title: 'Редактировать клиента',
      icon: 'user',
      buttonClass: 'secondary', // TODO why need !call
      disabled: (call) => !call || !(this.allClients.find(c => FieldsUtils.getFieldStringValue(c, FieldNames.Client.number) === `+${call.clientNumber}`) && `+${call.innerNumber}` === FieldsUtils.getFieldStringValue(this.currentUser.fields, FieldNames.User.number)),
      handler: (c) => this.updateClient(c),
    },
    {
      title: 'Звонок использован',
      icon: 'user',
      buttonClass: 'secondary',
      disabled: (c) => !c || !!c.isUsed, // TODO why need !c
      handler: (c) => this.callIsUsed(c)
    },
    ];

    return configs.filter(config => !config.available || config.available());
  }

  callIsUsed(call: ServerPhoneCall.Response) {
    const res = confirm('Вы уверены что хотите пометить звонок как использованный?');

    if (res) {
      this.requestService.put<ServerPhoneCall.Response[]>(`${environment.serverUrl}/${'phone-call'}/${call.id}`, { // replace to api service adapter
        isUsed: 1
      }).pipe(
        takeUntil(this.destoyed)
      ).subscribe(() => {
        this.refresh();
      });
    }
  }

  openNewClientWindow(call: ServerPhoneCall.Response) {
    const ref = this.dialogService.open(CreateClientComponent, {
      data: {
        fieldConfigs: this.clientsFieldConfigs,
        specialists: this.specialists,
        predefinedFields: {
          [FieldNames.Client.number]: `+${call.clientNumber}`,
          [FieldNames.Client.source]: 'source-2',
        },
      },
      header: `Новый клиент по номеру +${call.clientNumber}`,
      width: '70%',
    });

    ref.onClose.pipe(takeUntil(this.destoyed)).subscribe((res) => {
      if (res) {
        this.refresh();
      }
    });
  }

  updateClient(call: ServerPhoneCall.Response) {
    const client = this.allClients.find(c => FieldsUtils.getFieldStringValue(c, FieldNames.Client.number) === `+${call.clientNumber}`)!;

    const ref = this.dialogService.open(CreateClientComponent, {
      data: {
        client,
        fieldConfigs: this.clientsFieldConfigs,
        specialists: this.specialists,
      },
      header: 'Редактировать клиента',
      width: '70%'
    });
  }

  // subscribeOnCloseModalRef(ref: DynamicDialogRef, call: ServerPhoneCall.Response) {
  //   ref.onClose.pipe(takeUntil(this.destoyed)).subscribe(res => {
  //     if (res) {
  //       this.loading = true;
  //       this.getPhoneCalls().subscribe(() => {
  //         this.loading = false;
  //       });
  //     }
  //   });
  // }

  ngOnDestroy(): void {
    this.destoyed.next(null);
  }
}
