import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, map, switchMap, takeUntil, zip } from 'rxjs';
import { ServerCallRequest } from 'src/app/entities/call-request';
import { RequestService } from 'src/app/services/request/request.service';
import { SessionService } from 'src/app/services/session/session.service';
import { environment } from 'src/environments/environment';
import { GridActionConfigItem, GridConfigItem } from '../../../shared/grid/grid.component';
import { UserService } from 'src/app/services/user/user.service';
import { ServerUser } from 'src/app/entities/user';
import { ServerRole } from 'src/app/entities/role';
import { DateUtils } from 'src/app/entities/utils';
import { ClientService } from 'src/app/services/client/client.service';
import { ServerClient } from 'src/app/entities/client';
import { FieldsUtils, ServerField } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
import { CreateClientComponent } from '../../../modals/create-client/create-client.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'za-call-requests-dashlet',
  templateUrl: './call-requests-dashlet.component.html',
  styleUrls: ['./call-requests-dashlet.component.scss'],
  providers: [
    UserService,
    ClientService,
    DialogService
  ]
})
export class CallRequestsDashletComponent implements OnInit, OnDestroy {
  loading = true;

  gridConfig!: GridConfigItem<ServerCallRequest.Response>[];
  gridActionsConfig: GridActionConfigItem<ServerCallRequest.Response>[] = [];
  getColorConfig: ((item: ServerCallRequest.Response) => string) | undefined;

  myCallRequests: ServerCallRequest.Response[] = [];
  allCallRequests: ServerCallRequest.Response[] = [];
  usedCallRequests: ServerCallRequest.Response[] = [];

  specialists: ServerUser.Response[] = [];
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

  getData(): Observable<ServerCallRequest.Response[]> {
    return zip(this.clientService.getClients(), this.clientService.getClientFields(), this.userService.getUsers()).pipe(
      takeUntil(this.destoyed),
      switchMap(([clientsRes, clientFieldsRes, usersFieldsRes]) => {
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

        this.allClients = clientsRes;

        this.availableSpecialists = this.specialists.map(u => ({ name: FieldsUtils.getFieldStringValue(u, FieldNames.User.name), id: +u.id }));

        return this.getCallRequests();
      })
    );
  }

  getCallRequests(): Observable<ServerCallRequest.Response[]> {
    return this.requestService.get<ServerCallRequest.Response[]>(`${environment.serverUrl}/${'call-requests'}`)
      .pipe(map(result => {
        this.allCallRequests = result;
        this.myCallRequests = result.filter(call => `${call.userId}` === `${this.sessionService.userId}` && !(+call.isUsed));
        this.usedCallRequests = result.filter(call => (+call.isUsed));

        return result;
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
        getValue: (item) => JSON.parse(item.originalNotification).name,
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
    ];
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
    // {
    //   title: 'Следующее действие',
    //   icon: 'question-circle',
    //   buttonClass: 'success',
    //   handler: (client) => this.updateSpecificField(client, FieldNames.Client.nextAction)
    // },
    // {
    //   title: 'Изменить статус сделки',
    //   icon: 'check-circle',
    //   buttonClass: 'success',
    //   handler: (client) => this.updateSpecificField(client, FieldNames.Client.dealStatus)
    // },
    // // {
    // //   title: 'Показы',
    // //   icon: 'list',
    // //   buttonClass: 'success',
    // //   handler: (client) => this.manageCarShowings(client)
    // // },
    // {
    //   title: 'Удалить',
    //   icon: 'times',
    //   buttonClass: 'danger',
    //   handler: (client) => this.deleteClient(client),
    //   disabled: () => !this.sessionService.isAdminOrHigher,
    //   available: () => this.sessionService.isAdminOrHigher
    // }
    // {
    //   title: 'Завершить сделку',
    //   icon: 'check-circle',
    //   buttonClass: 'success',
    //   handler: (client) => this.completeDeal(client)
    // },
    ];

    return configs.filter(config => !config.available || config.available());
  }

  requestIsUsed(call: ServerCallRequest.Response) {
    const res = confirm('Вы уверены что хотите пометить заявку как использованную?');

    if (res) {
      this.requestService.put<ServerCallRequest.Response[]>(`${environment.serverUrl}/${'call-requests'}/${call.id}`, {
        isUsed: 1
      }).subscribe(() => {
        this.loading = true;
        this.getData().subscribe(() => {
          this.loading = false;
        });
      });
    }
  }

  openNewClientWindow(call: ServerCallRequest.Response) {
    const ref = this.dialogService.open(CreateClientComponent, {
      data: {
        fieldConfigs: this.clientsFieldConfigs,
        specialists: this.specialists,
        // predefinedFields: {
        //   [FieldNames.Client.number]: call.clientNumber
        // }
      },
      header: `Новый клиент по номеру ${call.clientNumber}`,
      width: '70%',
    });

    this.subscribeOnCloseModalRef(ref);
  }

  subscribeOnCloseModalRef(ref: DynamicDialogRef) {
    ref.onClose.pipe(takeUntil(this.destoyed)).subscribe(res => {
      if (res) {
        this.loading = true;
        this.getData().subscribe(() => {
          this.loading = false;
        });
      }
    });
  }


  ngOnDestroy(): void {
    this.destoyed.next(null);
  }
}
