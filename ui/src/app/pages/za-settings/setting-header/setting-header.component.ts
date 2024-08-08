import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ServerRole } from 'src/app/entities/role';
import { ServerAuth } from 'src/app/entities/user';
import { ClientService } from 'src/app/services/client/client.service';
import { SessionService } from 'src/app/services/session/session.service';
import { LoginComponent } from '../modals/modals-auth/login/login.component';
import { SignUpComponent } from '../modals/modals-auth/sign-up/sign-up.component';
import { settingsUsersStrings } from '../settings-users/settings-users.strings';
import { ActionsItem, ActionsService } from './actions.service';
import { XlsxService } from 'src/app/services/xlsx/xlsx.service';
import { ServerClient } from 'src/app/entities/client';
import { FieldsUtils, ServerField } from 'src/app/entities/field';
import { FieldNames, convertClientNumber } from 'src/app/entities/FieldNames';

@Component({
  selector: 'za-setting-header',
  templateUrl: './setting-header.component.html',
  styleUrls: ['./setting-header.component.scss'],
  providers: [
    DialogService,
    ActionsService,
    ClientService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingHeaderComponent implements OnInit, OnDestroy {
  ServerRole = ServerRole;
  @Input() user: ServerAuth.IPayload | null = null;

  readonly actions: ActionsItem[] = this.actionsService.getActions();

  userRoles = [
    {name: settingsUsersStrings.carSales, code: ServerRole.Custom.carSales},
    {name: settingsUsersStrings.carSalesChief, code: ServerRole.Custom.carSalesChief},
    {name: settingsUsersStrings.carShooting, code: ServerRole.Custom.carShooting},
    {name: settingsUsersStrings.carShootingChief, code: ServerRole.Custom.carShootingChief},
    {name: settingsUsersStrings.contactCenter, code: ServerRole.Custom.contactCenter},
    {name: settingsUsersStrings.contactCenterChief, code: ServerRole.Custom.contactCenterChief},
    {name: settingsUsersStrings.customerService, code: ServerRole.Custom.customerService},
    {name: settingsUsersStrings.customerServiceChief, code: ServerRole.Custom.customerServiceChief},
    {name: 'Admin', code: ServerRole.System.Admin},
    // {name: 'Boolean', code: ServerRole.System.SuperAdmin}
  ];

  isSuperAdmin = this.sessionService.isSuperAdminOrHigher;
  selectedRole: ServerRole.Custom | ServerRole.System.SuperAdmin | ServerRole.System.Admin = ServerRole.System.Admin;
  clientFieldsConfigs: ServerField.Response[] = [];

  destroyed = new Subject();

  constructor(
    private dialogService: DialogService,
    public sessionService: SessionService,
    private actionsService: ActionsService,
    private cdr: ChangeDetectorRef,
    private clientService: ClientService,
    private xlsxService: XlsxService,
  ) { }

  ngOnInit(): void {
    this.clientService.getClientFields().subscribe(fields => {
      this.clientFieldsConfigs = fields;
    })

    this.sessionService.userSubj
      .pipe(
        takeUntil(this.destroyed)
      )
      .subscribe(user => {
        this.user = user;
        this.rebuildActions();
      });

  }

  onChangeSelectedRole(v: any) {
    this.sessionService.setCustomRole(this.selectedRole);
    this.rebuildActions();
  }

  login() {
    const ref = this.dialogService.open(LoginComponent, {
      header: 'Войти',
      width: '40%'
    });
  }

  signUp() {
    const ref = this.dialogService.open(SignUpComponent, {
      header: 'Регистрация',
      width: '40%'
    });
  }

  logOut() {
    this.sessionService.logout().subscribe();
  }

  ngOnDestroy() {
    this.destroyed.next(null);
  }

  rebuildActions() {;
    this.cdr.detectChanges();
  }

  onFileChange(event: any) {
    this.xlsxService.onFileChange(event, (list: any) => {
      const listr = this.convertXlsToJSON(list);
      // console.log(listr);

      // listr.forEach(c => {
      //   this.clientService.createClient(c).subscribe(r => {
      //     console.log(r);
      //   });
      // })
    });
  }

  convertXlsToJSON(list: any[]) {
    return list.map(item => {
      const client: ServerClient.CreateRequest = {
        carIds: item['Автомобиль'] || '',
        fields: [],
      }

      if (item['№']) {
        const field = this.clientFieldsConfigs.find(c => c.name === FieldNames.Client.name)!;
        client.fields.push({
          id: field.id,
          name: field.name,
          value: `${item['№']} ${item['Имя']} `
        })
      }

      if (item['Статус']) {
        const field = this.clientFieldsConfigs.find(c => c.name === FieldNames.Client.dealStatus)!;
        const fieldClientStatus = this.clientFieldsConfigs.find(c => c.name === FieldNames.Client.clientStatus)!;
        const fieldComment = this.clientFieldsConfigs.find(c => c.name === FieldNames.Client.description)!;

        let value = FieldNames.DealStatus.InProgress;
        let comment = `${item['ТЦ'] || ''} ${item['Комментарий']}`;
        let clientStatus = '';

        switch (item['Статус']) {
          case 'Есть интерес':
            // comment = `Есть интерес; ${comment}`;
            clientStatus = FieldNames.ClientStatus.HavingInteresting;
            break;
          case 'Отказ':
            value = FieldNames.DealStatus.Deny;
            break;
          case 'Задаток':
            value = FieldNames.DealStatus.OnDeposit;
            break;
          case 'Продано':
            value = FieldNames.DealStatus.Sold;
            break;
        }

        const v = FieldsUtils.setDropdownValue(field, value);

        if (clientStatus) {
          const vv = FieldsUtils.setDropdownValue(fieldClientStatus, clientStatus);

          client.fields.push({
            id: fieldClientStatus.id,
            name: fieldClientStatus.name,
            value: vv.value,
          });
        }

        client.fields.push({
          id: field.id,
          name: field.name,
          value: v.value,
        });

        client.fields.push({
          id: fieldComment.id,
          name: fieldComment.name,
          value: comment,
        });
      }

      if (item['Дата зая-ки']) {
        const field = this.clientFieldsConfigs.find(c => c.name === FieldNames.Client.date)!;
        client.fields.push({
          id: field.id,
          name: field.name,
          value: `${+item['Дата зая-ки']}`,
        });
      }

      if (item['Дата след дей-я']) {
        const field = this.clientFieldsConfigs.find(c => c.name === FieldNames.Client.dateNextAction)!;
        client.fields.push({
          id: field.id,
          name: field.name,
          value: `${+item['Дата след дей-я']}`,
        });
      }

      if (item['Пометка']) {
        const field = this.clientFieldsConfigs.find(c => c.name === FieldNames.Client.nextAction)!;
        client.fields.push({
          id: field.id,
          name: field.name,
          value: `${item['Пометка']}`,
        });
      }

      // if (item['Источник']) {
      //   const field = this.clientFieldsConfigs.find(c => c.name === FieldNames.Client.source)!;

      //   let value = FieldNames.ClientSource.Site;

      //   switch (item['Источник']) {
      //     case 'Звонок с ав':
      //     case 'Звонок с АВ':
      //     case 'ав':
      //     case 'АВ':
      //     case 'av.by':
      //       value = FieldNames.ClientSource.Av;
      //       break;
      //     case 'Заявка в вотсап':
      //     case 'Запрос вайбер':
      //     case 'Запрос в вайбер':
      //     case 'Viber':
      //     case 'Telegram':
      //     case 'Whatsup':
      //       value = FieldNames.ClientSource.Messagers;
      //       break;
      //     case 'Заявка с сайта':
      //       value = FieldNames.ClientSource.Site;
      //       break
      //     case 'Эл почта"':
      //       value = FieldNames.ClientSource.EMail;
      //       break
      //     case 'Звонок ':
      //     case 'Звонок':
      //       value = FieldNames.ClientSource.Call;
      //       break;
      //     case 'Дживо':
      //     case 'Живо':
      //     case 'Чат':
      //       value = FieldNames.ClientSource.Chat;
      //       break;
      //     case 'Instagram':
      //       value = FieldNames.ClientSource.Insta;
      //       break;
      //     case 'ТЦ':
      //     case 'Заявка ТЦ':
      //       value = FieldNames.ClientSource.TC;
      //       break;
      //     case 'Арена сити':
      //     case 'Арена':
      //       value = FieldNames.ClientSource.TC;
      //       break;
      //     case 'Прямое':
      //     case 'Улица':
      //       value = FieldNames.ClientSource.Street;
      //       break;

      //     case 'Звонок':
      //       value = FieldNames.ClientSource.Call;
      //       break;
      //     case 'Рекомендация':
      //       value = FieldNames.ClientSource.Recommend;
      //       break;
      //   }

      //   const v = FieldsUtils.setDropdownValue(field, value);

      //   client.fields.push({
      //     id: field.id,
      //     name: field.name,
      //     value: v.value,
      //   });
      // }

      if (true) {
        const field = this.clientFieldsConfigs.find(c => c.name === FieldNames.Client.source)!;

        let value = FieldNames.ClientSource.TC;

        const v = FieldsUtils.setDropdownValue(field, value);

        client.fields.push({
          id: field.id,
          name: field.name,
          value: v.value,
        });
      }

      if (true) {
        const field = this.clientFieldsConfigs.find(c => c.name === FieldNames.Client.specialistId)!;
        let value = '59';

        // switch (item['М-р']) {
        //   case 'Д':
        //   case 'д':
        //   case 'Д ':
        //   case ' Д':
        //   case ' Д ':
        //     value = '20';
        //     break;
        //   case 'А':
        //   case 'а':
        //   case 'А ':
        //   case ' А':
        //   case ' А ':
        //     value = '2';
        //     break;
        //   case 'М':
        //   case 'M':
        //   case 'М ':
        //   case ' М':
        //   case ' M ':
        //     value = '17';
        //     break;
        //   case 'И':
        //   case 'и':
        //   case 'И ':
        //   case ' И':
        //   case ' И ':
        //     value = '57';
        //     break;
        // }

        client.fields.push({
          id: field.id,
          name: field.name,
          value: value,
        });
      }

      if (item['Телефон']) {
        const field = this.clientFieldsConfigs.find(c => c.name === FieldNames.Client.number)!;

        // console.log(item['Телефон']);
        // console.log(convertClientNumber(`${item['Телефон']}`));

        client.fields.push({
          id: field.id,
          name: field.name,
          value: convertClientNumber(`${item['Телефон']}`) || item['Телефон'],
        });
      }

      return client;
    });
  }
}
