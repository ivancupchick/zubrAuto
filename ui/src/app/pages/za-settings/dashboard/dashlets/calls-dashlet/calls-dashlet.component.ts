import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from 'src/app/services/session/session.service';
import { RequestService } from 'src/app/services/request/request.service';
import { environment } from 'src/environments/environment';
import { ServerPhoneCall, Webhook } from 'src/app/entities/phone-calls';
import { GridActionConfigItem, GridConfigItem } from '../../../shared/grid/grid';
import { ServerUser } from 'src/app/entities/user';
import { ServerClient } from 'src/app/entities/client';
import { finalize, map, mergeMap, Observable, Subject, switchMap, takeUntil, zip } from 'rxjs';
import { FieldsUtils, ServerField } from 'src/app/entities/field';
import { DialogService } from 'primeng/dynamicdialog';
import { ClientService } from 'src/app/services/client/client.service';
import { UserService } from 'src/app/services/user/user.service';
import { ServerRole } from 'src/app/entities/role';
import { FieldNames } from 'src/app/entities/FieldNames';
import { DateUtils } from 'src/app/entities/utils';
import { CreateClientComponent } from '../../../modals/create-client/create-client.component';
import { BaseList } from 'src/app/entities/constants';

const isPhoneCallUsed = (allClients: ServerClient.Response[], call: ServerPhoneCall.Response) => !!allClients.find(c => FieldsUtils.getFieldStringValue(c, FieldNames.Client.number) === `+${call.clientNumber}`);

@Component({
  selector: 'za-calls-dashlet',
  templateUrl: './calls-dashlet.component.html',
  styleUrls: ['./calls-dashlet.component.scss'],
  providers: [
    UserService,
    ClientService,
    DialogService
  ]
})
export class CallsDashletComponent implements OnInit, OnDestroy {
  loading = true;

  gridConfig!: GridConfigItem<ServerPhoneCall.Response>[];
  gridActionsConfig: GridActionConfigItem<ServerPhoneCall.Response>[] = [];
  getColorConfig: ((item: ServerPhoneCall.Response) => string) | undefined;

  myPhoneCalls: ServerPhoneCall.Response[] = [];
  allPhoneCalls: ServerPhoneCall.Response[] = [];
  usedPhoneCalls: ServerPhoneCall.Response[] = [];

  specialists: ServerUser.Response[] = [];
  allUsers: ServerUser.Response[] = [];
  currentUser!: ServerUser.Response;
  availableSpecialists: { name: string, id: number }[] = [];
  allClients: ServerClient.Response[] = [];

  destoyed = new Subject();

  clientsFieldConfigs: ServerField.Response[] = []; // !TODO replace away
  isCarSales = this.sessionService.isCarSales;

  constructor(private sessionService: SessionService, private requestService: RequestService, private userService: UserService, private clientService: ClientService,
    private dialogService: DialogService,
    ) { }

  ngOnInit(): void {
    this.getData().subscribe(() => {
      this.loading = false;
      this.setGridSettings();
    });
  }

  refresh() {
    this.loading = true;
    this.getPhoneCalls().pipe(
      finalize(() => this.loading = false)
    ).subscribe();
  }

  getData(): Observable<ServerPhoneCall.Response[]> {
    return zip(this.clientService.getClients(), this.clientService.getClientFields(), this.userService.getUsers(true), this.userService.getUser(this.sessionService.userId)).pipe(
      takeUntil(this.destoyed),
      switchMap(([clientsRes, clientFieldsRes, usersFieldsRes, currentUser]) => {
        this.clientsFieldConfigs = clientFieldsRes;

        this.currentUser = currentUser;

        this.allUsers = usersFieldsRes;
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

        this.allClients = clientsRes;

        this.availableSpecialists = this.specialists.map(u => ({ name: FieldsUtils.getFieldStringValue(u, FieldNames.User.name), id: +u.id }));

        return this.getPhoneCalls();
      })
    );
  }

  getPhoneCalls(): Observable<ServerPhoneCall.Response[]> {
    return this.requestService.get<BaseList<ServerPhoneCall.Response>>(`${environment.serverUrl}/${'phone-call'}`, { page: 1, size: 100, type: Webhook.CallType.Inbound })
      .pipe(map(result => {
        const allRequests = result.list.sort((a, b) => (a.createdDate > b.createdDate) ? -1 : (a.createdDate < b.createdDate) ? 1 : 0);

        this.allPhoneCalls = allRequests.filter(call => isPhoneCallUsed(this.allClients, call));
        this.myPhoneCalls = allRequests.filter(call => `+${call.innerNumber}` === FieldsUtils.getFieldStringValue(this.currentUser.fields, FieldNames.User.number) && !isPhoneCallUsed(this.allClients, call));
        this.usedPhoneCalls = allRequests.filter(call => isPhoneCallUsed(this.allClients, call));

        if (!this.sessionService.isAdminOrHigher) {
          this.usedPhoneCalls = allRequests.filter(call => `+${call.innerNumber}` === FieldsUtils.getFieldStringValue(this.currentUser.fields, FieldNames.User.number) && isPhoneCallUsed(this.allClients, call));
        }

        if (this.sessionService.isAdminOrHigher) {
          this.allPhoneCalls = [...allRequests];
        }

        return this.allPhoneCalls;
      }))
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
      disabled: () => false,
      handler: (c) => this.openNewClientWindow(c)
    },
    // {
    //   title: 'Заявка использована',
    //   icon: 'user',
    //   buttonClass: 'secondary',
    //   disabled: (c) => !c || !!isPhoneCallUsed(this.allClients, c),
    //   handler: (c) => this.requestIsUsed(c)
    // },
    ];

    return configs.filter(config => !config.available || config.available());
  }

  // requestIsUsed(call: ServerPhoneCall.Response) {
  //   const res = confirm('Вы уверены что хотите пометить заявку как использованную?');

  //   if (res) {
  //     this.requestService.put<ServerPhoneCall.Response[]>(`${environment.serverUrl}/${'phone-call'}/${call.id}`, {
  //       isUsed: 1
  //     }).pipe(
  //       finalize(() => this.loading = false)
  //     ).subscribe(() => {
  //       this.loading = true;
  //       this.getData().subscribe();
  //     });
  //   }
  // }

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
        this.loading = true;
        this.getPhoneCalls()
          .pipe(
            finalize(() => this.loading = false)
          )
          .subscribe();
      }
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
