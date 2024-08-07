import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, finalize, map, mergeMap, switchMap, take, takeUntil, tap, zip } from 'rxjs';
import { ServerCallRequest } from 'src/app/entities/call-request';
import { RequestService } from 'src/app/services/request/request.service';
import { SessionService } from 'src/app/services/session/session.service';
import { environment } from 'src/environments/environment';
import { GridActionConfigItem, GridConfigItem } from '../../../shared/grid/grid';
import { UserService } from 'src/app/services/user/user.service';
import { ServerUser } from 'src/app/entities/user';
import { ServerRole } from 'src/app/entities/role';
import { DateUtils } from 'src/app/shared/utils/date.util';
import { ClientService } from 'src/app/services/client/client.service';
import { ServerClient } from 'src/app/entities/client';
import { FieldsUtils, ServerField } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
import { CreateClientComponent } from '../../../modals/create-client/create-client.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CallRequestsDataService } from './call-requests-data.service';
import { BaseList, StringHash } from 'src/app/entities/constants';
import { SortDirection } from 'src/app/shared/enums/sort-direction.enum';

export enum TabIndex {
  MyCallRequests = 0,
  AllCallRequests = 1,
  UsedCallRequests = 2,
}

@Component({
  selector: 'za-call-requests-dashlet',
  templateUrl: './call-requests-dashlet.component.html',
  styleUrls: ['./call-requests-dashlet.component.scss'],
  providers: [
    UserService,
    ClientService,
    DialogService,
    CallRequestsDataService,
  ]
})
export class CallRequestsDashletComponent implements OnInit, OnDestroy {
  first = 0;
  sortField = 'id';
  activeIndex: TabIndex = 0;

  gridConfig!: GridConfigItem<ServerCallRequest.Response>[];
  gridActionsConfig: GridActionConfigItem<ServerCallRequest.Response>[] = [];
  getColorConfig: ((item: ServerCallRequest.Response) => string) | undefined;

  myCallRequestsTotal: number = 0;
  allCallRequestsTotal: number = 0;
  usedCallRequestsTotal: number = 0;

  specialists: ServerUser.Response[] = [];
  availableSpecialists: { name: string, id: number }[] = [];
  allClients: ServerClient.Response[] = [];

  destoyed = new Subject();

  clientsFieldConfigs: ServerField.Response[] = []; // !TODO replace away
  isCarSales = this.sessionService.isCarSales;

  queriesByTabIndex: {
    [key in TabIndex]: StringHash
  } = {
    [TabIndex.MyCallRequests]: {
      ['userId']: `${this.sessionService.userId}`,
      ['isUsed']: '0',
    },
    [TabIndex.AllCallRequests]: {
    },
    [TabIndex.UsedCallRequests]: {
      ['isUsed']: '1',
      ...(!this.sessionService.isAdminOrHigher ? {
        ['userId']: `${this.sessionService.userId}`,
      } : {})
    },
  }

  constructor(
    private sessionService: SessionService,
    private requestService: RequestService,
    private userService: UserService,
    private clientService: ClientService,
    private dialogService: DialogService,
    public callRequestsDataService: CallRequestsDataService,
    ) { }

  ngOnInit(): void {
    this.getAdditinalData().subscribe(() => {
      console.log(1);
      this.getTotals().subscribe();
      this.setGridSettings();
    });

    this.callRequestsDataService.clients$.pipe(
      takeUntil(this.destoyed),
    ).subscribe((clientsRes) => {
      this.allClients = clientsRes.list;
      // this.setGridSettings();
    });
  }

  refresh() {
    const query = this.getQuery(this.activeIndex);

    this.callRequestsDataService.onFilter(query);
    this.getTotals().subscribe();
  }

  getQuery(index: TabIndex): StringHash {
    const query: StringHash = {
      [`sortField`]: 'id',
      [`sortOrder`]: SortDirection.Desc,
      ...this.queriesByTabIndex[index],
    };

    // filters

    return query;
  }

  getAdditinalData(): Observable<unknown> {
    return zip(this.clientService.getClientFields(), this.userService.getUsers(true)).pipe(
      takeUntil(this.destoyed),
      tap(([clientFieldsRes, usersFieldsRes]) => {
        this.clientsFieldConfigs = clientFieldsRes;

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

        this.availableSpecialists = this.specialists.map(u => ({ name: FieldsUtils.getFieldStringValue(u, FieldNames.User.name), id: +u.id }));
      })
    );
  }

  getTotals() {
    return zip(
      this.requestService.get<BaseList<ServerCallRequest.Response>>(`${environment.serverUrl}/${'call-requests'}`, {
        page: 0,
        size: 0,
        ...this.getQuery(TabIndex.MyCallRequests)
      }),
      this.requestService.get<BaseList<ServerCallRequest.Response>>(`${environment.serverUrl}/${'call-requests'}`, {
        page: 0,
        size: 0,
        ...this.getQuery(TabIndex.AllCallRequests)
      }),
      this.requestService.get<BaseList<ServerCallRequest.Response>>(`${environment.serverUrl}/${'call-requests'}`, {
        page: 0,
        size: 0,
        ...this.getQuery(TabIndex.UsedCallRequests)
      }),
    ).pipe(
      takeUntil(this.destoyed),
      tap(([first, second, thirt]) => {
        console.log([first, second, thirt]);
        [
          this.myCallRequestsTotal,
          this.allCallRequestsTotal,
          this.usedCallRequestsTotal,
        ] = [first.total, second.total, thirt.total];
      })
    );
  }

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

  getGridConfig(): GridConfigItem<ServerCallRequest.Response>[] {
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
        title: 'Имя',
        name: 'name',
        getValue: (item) => {
          try {
            return this.JSONParse(item.originalNotification).name
          } catch (error) {
            return 'нету'
          }
        },
      },
      {
        title: 'Описание',
        name: 'comment',
        getValue: (item) => item.comment,
      },
      {
        title: 'Сайт',
        name: 'source',
        sortable: () => true,
        getValue: (item) => item.source,
      },
      {
        title: 'Номер',
        name: 'clientNumber',
        sortable: () => true,
        getValue: (item) => item.clientNumber,
      },
      {
        title: 'Специалист',
        name: 'clientNumber',
        sortable: () => true,
        getValue: (item) => !item.userId ? 'Никто' : this.availableSpecialists.find(u => u.id === +item.userId)?.name || 'Никто',
      },
      {
        title: 'Клиент создан',
        name: 'clientIsCreated',
        sortable: () => true,
        getValue: (item) => this.allClients.find(c => FieldsUtils.getFieldStringValue(c, FieldNames.Client.number) === item.clientNumber) ? 'Да' : 'Нет',
      },
      {
        title: 'ID клиента',
        name: 'clientIsCreated',
        sortable: () => true,
        getValue: (item) => this.getClientSpecialist(item),
      },
    ];
  }

  getClientSpecialist(callRequest: ServerCallRequest.Response): string  { // TODO refactor this and isPhoneCallUsed
    const client =  this.allClients.find(c => FieldsUtils.getFieldStringValue(c, FieldNames.Client.number) === callRequest.clientNumber)!;

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

  getGridActionsConfig(): GridActionConfigItem<ServerCallRequest.Response>[] {
    const configs: GridActionConfigItem<ServerCallRequest.Response>[] = [{
      title: 'Создать клиента',
      icon: 'user',
      buttonClass: 'secondary',
      disabled: () => false,
      handler: (c) => this.openNewClientWindow(c)
    },
    {
      title: 'Заявка использована',
      icon: 'user',
      buttonClass: 'secondary',
      disabled: (c) => !c || !!(+c.isUsed),
      handler: (c) => this.requestIsUsed(c)
    },
    ];

    return configs.filter(config => !config.available || config.available());
  }

  requestIsUsed(call: ServerCallRequest.Response) {
    const res = confirm('Вы уверены что хотите пометить заявку как использованную?');

    if (res) {
      this.requestService.put<ServerCallRequest.Response[]>(`${environment.serverUrl}/${'call-requests'}/${call.id}`, {
        isUsed: 1
      }).pipe(
        takeUntil(this.destoyed)
      ).subscribe(() => {
        this.refresh();
      });
    }
  }

  openNewClientWindow(call: ServerCallRequest.Response) {
    const ref = this.dialogService.open(CreateClientComponent, {
      data: {
        fieldConfigs: this.clientsFieldConfigs,
        specialists: this.specialists,
        predefinedFields: {
          [FieldNames.Client.number]: call.clientNumber,
          [FieldNames.Client.name]: this.JSONParse(call.originalNotification).name,
          [FieldNames.Client.source]: 'source-1',
        },
      },
      header: `Новый клиент по номеру ${call.clientNumber}`,
      width: '70%',
    });

    ref.onClose.pipe(takeUntil(this.destoyed)).subscribe((res) => {
      if (res) {
        this.requestService
          .put<ServerCallRequest.Response[]>(
            `${environment.serverUrl}/${'call-requests'}/${call.id}`,
            {
              isUsed: 1,
            }
          )
          .pipe(
            takeUntil(this.destoyed)
          )
          .subscribe(() => {
            this.refresh();
          });
      }
    });
  }

  // subscribeOnCloseModalRef(ref: DynamicDialogRef, call: ServerCallRequest.Response) {
  //   ref.onClose.pipe(takeUntil(this.destoyed)).subscribe(res => {
  //     if (res) {
  //       this.loading = true;
  //       this.getCallRequests().subscribe(() => {
  //         this.loading = false;
  //       });
  //     }
  //   });
  // }

  ngOnDestroy(): void {
    this.destoyed.next(null);
  }
}
