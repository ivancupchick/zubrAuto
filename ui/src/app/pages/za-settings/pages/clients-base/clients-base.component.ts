import { Component, OnDestroy, OnInit } from '@angular/core';
import { SpinnerComponent } from 'src/app/shared/components/spinner/spinner.component';
import { PageagleGridComponent } from '../../shared/pageagle-grid/pageagle-grid.component';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { finalize, Subject, takeUntil, tap } from 'rxjs';
import { ClientService } from 'src/app/services/client/client.service';
import { getClientStatus, getDealStatus, ServerClient } from 'src/app/entities/client';
import { CommonModule } from '@angular/common';
import { GridActionConfigItem, GridConfigItem } from '../../shared/grid/grid';
import { ClientBaseService } from './services/client-base-data.service';
import { settingsClientsStrings } from './clients-base.strings';
import { FieldsUtils } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
import { ServerUser } from 'src/app/entities/user';
import { DateUtils } from 'src/app/shared/utils/date.util';
import { ServerCar } from 'src/app/entities/car';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'za-clients-base',
  templateUrl: './clients-base.component.html',
  standalone: true,
  styleUrls: ['./clients-base.component.scss'],
  providers: [ClientBaseService, ClientService, DialogService],
  imports: [
    SpinnerComponent, 
    PageagleGridComponent,
    ToolbarModule,
    ButtonModule,
    CommonModule
  ]
})
export class ClientsBaseComponent implements OnInit, OnDestroy {
  first: number = 0;
  loading = false;
  destoyed = new Subject();
  readonly strings = settingsClientsStrings;

  rawClients: ServerClient.Response[] = [];
  specialists: ServerUser.Response[] = [];
  allCars: ServerCar.Response[] = [];

  gridConfig!: GridConfigItem<ServerClient.Response>[];
  gridActionsConfig: GridActionConfigItem<ServerClient.Response>[] = [];
  getColorConfig: ((item: ServerClient.Response) => string) | undefined;
  

  constructor(
    private clientService: ClientService,
    public clientBaseService: ClientBaseService,
    
  ) {}

  ngOnInit(): void {
    this.update();
    this.clientBaseService.fetchData();
  }

  update() {
    this.loading = true;
    this.getClients();
  };

  getClients() {
    return this.clientService.getClients().pipe(
        takeUntil(this.destoyed),
        finalize(()=> {
          this.loading = false;
        })
      ).subscribe(res => {
        this.setGridSettings();
        this.clientBaseService.clientBaseItems.next(res);
      })
  }

  setGridSettings() {
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
      handler: (client) => {console.log('this.updateClient(client)');}
    },
    {
      title: 'Следующее действие',
      icon: 'question-circle',
      buttonClass: 'success',
      handler: (client) => {console.log('this.updateSpecificField(client, FieldNames.Client.nextAction)');}
    },
    {
      title: 'Изменить статус сделки',
      icon: 'check-circle',
      buttonClass: 'success',
      handler: (client) => {console.log("this.updateSpecificField(client, FieldNames.Client.dealStatus");}
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
      handler: (client) => {console.log('this.deleteClient(client)')},
      disabled: () => true,
      available: () => true,
    },
    {
      title: 'Показать все изменения по клиенту',
      icon: 'pencil',
      buttonClass: 'secondary',
      disabled: (client) => false,
      handler: (client) => {console.log('this.showClientUpdates(client)');}
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

  getGridColorConfig(){
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
    this.destoyed.complete();
  }
}
