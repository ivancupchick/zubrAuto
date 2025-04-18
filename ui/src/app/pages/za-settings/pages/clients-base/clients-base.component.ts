import { Component, OnDestroy, OnInit } from '@angular/core';
import { SpinnerComponent } from 'src/app/shared/components/spinner/spinner.component';
import { PageagleGridComponent } from '../../shared/pageagle-grid/pageagle-grid.component';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { mergeMap, of, Subject, Subscription, takeUntil } from 'rxjs';
import { ClientService } from 'src/app/services/client/client.service';
import { CommonModule } from '@angular/common';
import { GridActionConfigItem, GridConfigItem } from '../../shared/grid/grid';
import { ClientBaseDataService } from './services/client-base-data.service';
import { ClientBaseFilterFormsInitialState, settingsClientsStrings } from './clients-base.strings';
import { FieldDomains, FieldsUtils, ServerField } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
import { ServerUser } from 'src/app/entities/user';
import { DateUtils } from 'src/app/shared/utils/date.util';
import { ServerCar } from 'src/app/entities/car';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { UserService } from 'src/app/services/user/user.service';
import { ServerRole } from 'src/app/entities/role';
import { skipEmptyFilters } from 'src/app/shared/utils/form-filter.util';
import { CreateClientComponent } from '../../modals/create-client/create-client.component';
import { FieldService } from 'src/app/services/field/field.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { SessionService } from 'src/app/services/session/session.service';
import { ClientChangeLogsComponent } from '../change-log/componets/client-change-logs/client-change-logs.component';
import { DBModels } from 'src/app/entities/constants';
import { getClientStatus, getDealStatus, ServerClient } from 'src/app/entities/client';

@Component({
  selector: 'za-clients-base',
  templateUrl: './clients-base.component.html',
  standalone: true,
  styleUrls: ['./clients-base.component.scss'],
  providers: [ClientBaseDataService, ClientService, DialogService],
  imports: [
    SpinnerComponent,
    PageagleGridComponent,
    ToolbarModule,
    ButtonModule,
    CommonModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarModule,
    MultiSelectModule
  ]
})
export class ClientsBaseComponent implements OnInit, OnDestroy {
  readonly strings = settingsClientsStrings;

  first: number = 0;
  dealStatuses: {name: string, value: string}[] = Object.values(FieldNames.DealStatus).map(s => ({ name: s, value: s }));
  clientStatuses: {name: string, value: string}[] = Object.values(FieldNames.ClientStatus).map(s => ({ name: s, value: s }));
  sourceList: {name: FieldNames.ClientSource, value: FieldNames.ClientSource}[] = Object.values(FieldNames.ClientSource).map(s => ({ name: s, value: s }));
  specialistList: {name: string, value: string}[] = [];
  initialDealStatuses = [FieldNames.DealStatus.InProgress, FieldNames.DealStatus.OnDeposit];
  specialists: ServerUser.Response[] = [];
  allUsers: ServerUser.Response[] = [];
  allCars: ServerCar.Response[] = [];
  fieldConfigs: ServerField.Response[] = [];
  form!: UntypedFormGroup;
  gridConfig!: GridConfigItem<ServerClient.Response>[];
  gridActionsConfig: GridActionConfigItem<ServerClient.Response>[] = [];
  getColorConfig: ((item: ServerClient.Response) => string) | undefined;

  loading$ = this.clientBaseDataService.loading$;
  list$ = this.clientBaseDataService.list$;
  destoyed = new Subject();

  constructor(
    public clientBaseDataService: ClientBaseDataService,
    public fb: UntypedFormBuilder,
    private userService: UserService,
    private dialogService: DialogService,
    private fieldService: FieldService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.getSpecialistList();
    this.clientBaseDataService.clientCars$.pipe(
      takeUntil(this.destoyed),
    ).subscribe((cars) => {
      this.allCars = cars;
    })
    this.getFieldsConfigs();
    this.form = this.fb.group(ClientBaseFilterFormsInitialState);
    this.form.get('dealStatus')?.setValue([FieldNames.DealStatus.InProgress, FieldNames.DealStatus.OnDeposit]);
    this.setGridSettings();
  }

  getSpecialistList(): Subscription {
    return this.userService.getAllUsers(true).pipe(takeUntil(this.destoyed)).subscribe(res => {
      this.allUsers = res.list
      this.specialists = res.list.filter((s: any) => +s.deleted === 0)
          .filter(u => u.customRoleName === ServerRole.Custom.carSales
                    || u.customRoleName === ServerRole.Custom.carSalesChief
                    || u.customRoleName === ServerRole.Custom.customerService
                    || u.customRoleName === ServerRole.Custom.customerServiceChief
                    || (
                      (
                        u.roleLevel === ServerRole.System.Admin || u.roleLevel === ServerRole.System.SuperAdmin
                      )
                    ));

        this.specialistList = [
          { name: 'Никто', value: 'None' },
          ...this.specialists.map(u => ({ name: FieldsUtils.getFieldStringValue(u, FieldNames.User.name), value: `${u.id}` }))
        ];
    });
  };

  getFieldsConfigs(): Subscription {
    return this.fieldService.getFieldsByDomain(FieldDomains.Client).pipe(takeUntil(this.destoyed)).subscribe(res => this.fieldConfigs = res);
  }

  filter(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    let filters = skipEmptyFilters({...structuredClone(this.form.value) });

    if (filters.specialist){
      const { specialist, ...rest } = filters;
      filters = { 'specialist-id': specialist, ...rest }
    }

    if (filters.clientStatus){
      const { clientStatus, ...rest } = filters;
      filters = { 'client-status': clientStatus, ...rest }
    }

    if (filters.dealStatus){
      const { dealStatus, ...rest } = filters;
      filters = { 'deal-status': dealStatus, ...rest }
    }
    if (filters.number){
      const { number, ...rest } = filters;
      filters = {
        number: `%${number.replaceAll('+','')}%`,
        'filter-operator-number': 'LIKE',
        ...rest
      }
    }

    if (filters.date){
      const { date, ...rest } = filters;
      if (date[1] !== null) {
        filters = {
          'createdDate': `${Date.parse(String(date[0]).replace('00:00:00', '00:00:01'))}-${Date.parse(String(date[1]).replace('00:00:00', '23:59:59'))}`,
          'filter-operator-createdDate': 'range',
          ...rest }
      } else {
        filters = {
          'createdDate': Date.parse(String(date[0]).replace('00:00:00','00:00:01')),
          'filter-operator-createdDate': '>',
          ...rest }
      }
    }

    this.clientBaseDataService.updatePage(filters);
    this.first = 0;
  };

  clearFilters(): void {
    this.form.reset(ClientBaseFilterFormsInitialState);
    const filters = skipEmptyFilters({...this.form.value });
    this.first = 0;
    this.clientBaseDataService.updatePage(filters);
  }

  openNewClientWindow(): void {
    const ref = this.dialogService.open(CreateClientComponent, {
      data: {
        fieldConfigs: this.fieldConfigs,
        specialists: this.specialists
      },
      header: 'Новый клиент',
      width: '70%',
    });

    this.subscribeOnCloseModalRef(ref);
  };

  subscribeOnCloseModalRef(ref: DynamicDialogRef) {
    ref.onClose.pipe(takeUntil(this.destoyed)).subscribe(res => {
      if (res) {
        this.filter();
        }
    });
  }

  setGridSettings(): void {
    this.gridConfig = this.getGridConfig();
    this.gridActionsConfig = this.getGridActionsConfig();
    this.getGridColorConfig();
  }

  getGridConfig(): GridConfigItem<ServerClient.Response>[] {
    return [
      {
        title: this.strings.id,
        name: 'id',
        getValue: (item) => {
          const userId = FieldsUtils.getFieldNumberValue(item, FieldNames.Client.specialistId);
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
      {
        title: this.strings[FieldNames.Client.saleDate],
        name: FieldNames.Client.saleDate,
        sortable: () => true,
        getValue: (item) => DateUtils.getFormatedDate(FieldsUtils.getFieldNumberValue(item, FieldNames.Client.saleDate)),
      },
    ];
  }

  getGridActionsConfig(): GridActionConfigItem<ServerClient.Response>[] {
    const configs: GridActionConfigItem<ServerClient.Response>[] = [{
      title: 'Редактировать',
      icon: 'pencil',
      buttonClass: 'secondary',
      disabled: () => false,
      handler: (client) => this.updateClient(client),
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
      available: () => this.sessionService.isAdminOrHigher,
    },
    {
      title: 'Показать все изменения по клиенту',
      icon: 'pencil',
      buttonClass: 'secondary',
      disabled: (client) => false,
      handler: (client) => this.showClientUpdates(client)
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

  updateClient(client: ServerClient.Response): void {
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
  };

  updateSpecificField(client: ServerClient.Response, fieldName: string): void {
    const includeFields = fieldName === FieldNames.Client.nextAction
      ? [FieldNames.Client.nextAction, FieldNames.Client.dateNextAction]
      : [fieldName, FieldNames.Client.saleDate]

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
  };

  deleteClient(client: ServerClient.Response): void {
    this.clientBaseDataService.deleteClient(client.id)
      .pipe(
        mergeMap(res => res && this.clientBaseDataService.fetchData() || of(null))
      ).subscribe();
  };

  showClientUpdates(client: ServerClient.Response): void {
    const ref = this.dialogService.open(ClientChangeLogsComponent, {
      data: {
        itemId: client.id,
        fieldConfigs: this.fieldConfigs,
        allUsers: this.allUsers,
        sourceName: DBModels.Table.Clients,
      },
      header: 'Изменения клиента',
      width: '90%'
    });
    // this.subscribeOnCloseModalRef(ref);
  }

  getGridColorConfig(): void {
    this.getColorConfig = (client) => {
      const status = getDealStatus(client);

      switch (status) {
        case FieldNames.DealStatus.Deny: return '#ff00002b'
        // case FieldNames.DealStatus.InProgress: return '#fff'
        case FieldNames.DealStatus.OnDeposit: return '#07ff003d'
        case FieldNames.DealStatus.Sold: return '#005dff3d'
      }

      const clientStatus = getClientStatus(client);

      switch (clientStatus) {
        case FieldNames.ClientStatus.Thinking: return '#EFD334'
        case FieldNames.ClientStatus.InProgress: return '#99FF99'
        case FieldNames.ClientStatus.HavingInteresting: return '#7FC7FF'
      }

      return '';
    }
  }

  ngOnDestroy(): void {
    this.destoyed.next(null);
  }
}
