import { Injectable } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { StringHash } from 'src/app/entities/constants';
import { ServerRole } from 'src/app/entities/role';
import { ServerAuth } from 'src/app/entities/user';
import { ClientService } from 'src/app/services/client/client.service';
import { SessionService } from 'src/app/services/session/session.service';
import { CreateClientComponent } from '../modals/create-client/create-client.component';
import { SignUpComponent } from '../modals/modals-auth/sign-up/sign-up.component';

export interface ActionsItem {
  label: string,
  icon: string,
  routerLink?: string,
  handler?: () => void,
  visible?: () => boolean,
}

@Injectable()
export class ActionsService {
  constructor(private sessionService: SessionService, private dialogService: DialogService, private clientService: ClientService) {}

  getActions(): ActionsItem[] {
    return [
      // this.getCarSettingsPageRoutingAction(),
      // this.getFieldPageRoutingAction(),
      // this.getClientSettingsPageRoutingAction(),
      // this.getUserSettingsPageRoutingAction(),
      // this.getRoleSettingsPageRoutingAction(),
      ...this.getContactServiceActions(),
      ...this.getCarShootingActions(),
      ...this.getCustomerServiceActions(),
      ...this.getCarSalesActions()
    ]
  }

  get user() {
    return this.sessionService.userSubj.getValue();
  }

  getCarSettingsPageRoutingAction(): ActionsItem {
    return {
      label: 'База машин',
      icon: 'pi pi-fw pi-th-large',
      routerLink: 'cars',
      visible: () => this.user?.roleLevel === ServerRole.System.SuperAdmin,
    }
  }

  getFieldPageRoutingAction(): ActionsItem {
    return {
      label: 'Настройка филдов',
      icon: 'pi pi-fw pi-align-left',
      routerLink: 'fields',
      visible: () => this.user?.roleLevel === ServerRole.System.SuperAdmin,
    }
  }

  getClientSettingsPageRoutingAction() {
    return {
      label: 'База клиентов',
      icon: 'pi pi-fw pi-users',
      routerLink: 'clients',
      visible: () => this.user?.roleLevel === ServerRole.System.SuperAdmin,
    }
  }

  getUserSettingsPageRoutingAction() {
    return {
      label: 'Пользователи',
      icon: 'pi pi-fw pi-user-plus',
      routerLink: 'users',
      visible: () => this.user?.roleLevel === ServerRole.System.SuperAdmin,
    }
  }

  getRoleSettingsPageRoutingAction() {
    return {
      label: 'Роли',
      icon: 'pi pi-fw pi-users',
      routerLink: 'roles',
      visible: () => this.user?.roleLevel === ServerRole.System.SuperAdmin,
    }
  }

  getContactServiceActions(): ActionsItem[] {
    return [{
      label: 'Моя база обзвона',
      icon: 'pi pi-fw pi-mobile',
      routerLink: 'cars',
      visible: () => this.user?.customRoleName === ServerRole.Custom.contactCenter
                  || this.user?.customRoleName === ServerRole.Custom.contactCenterChief
                  || this.user?.roleLevel === ServerRole.System.SuperAdmin,
    }, {
      label: 'Добавить базу обзвона',
      icon: 'pi pi-fw pi-mobile',
      // routerLink: 'roles',
      handler: () => {
        const ref = this.dialogService.open(SignUpComponent, {
          header: 'Добавить базу обзвона',
          width: '40%'
        });
      },
      visible: () => this.user?.customRoleName === ServerRole.Custom.contactCenterChief
                  || this.user?.roleLevel === ServerRole.System.SuperAdmin,
    }, {
      label: 'Вся база обзвона',
      icon: 'pi pi-fw pi-mobile',
      routerLink: 'cars',
      visible: () => this.user?.customRoleName === ServerRole.Custom.contactCenterChief
                  || this.user?.roleLevel === ServerRole.System.SuperAdmin,
    }]
  }

  getCarShootingActions(): ActionsItem[] {
    return [{
      label: 'Моя база съёмок',
      icon: 'pi pi-fw pi-camera',
      routerLink: 'cars',
      visible: () => this.user?.customRoleName === ServerRole.Custom.carShooting
                  || this.user?.customRoleName === ServerRole.Custom.carShootingChief
                  || this.user?.roleLevel === ServerRole.System.SuperAdmin,
    }, {
      label: 'Создать Анкету',
      icon: 'pi pi-fw pi-camera',
      // routerLink: 'roles',
      handler: () => {
        const ref = this.dialogService.open(SignUpComponent, {
          header: 'Добавить базу обзвона',
          width: '40%'
        });
      },
      visible: () => this.user?.customRoleName === ServerRole.Custom.carShooting
                  || this.user?.customRoleName === ServerRole.Custom.carShootingChief
                  || this.user?.roleLevel === ServerRole.System.SuperAdmin,
    }]
  }

  getCustomerServiceActions(): ActionsItem[] {
    return [{
      label: 'База съёмок',
      icon: 'pi pi-fw pi-th-large',
      routerLink: 'cars',
      visible: () => this.user?.customRoleName === ServerRole.Custom.customerService
                  || this.user?.customRoleName === ServerRole.Custom.customerServiceChief
                  || this.user?.roleLevel === ServerRole.System.SuperAdmin,
    }, {
      label: 'База клиентов',
      icon: 'pi pi-fw pi-th-large',
      routerLink: 'client',
      visible: () => this.user?.customRoleName === ServerRole.Custom.customerService
                  || this.user?.customRoleName === ServerRole.Custom.customerServiceChief
                  || this.user?.roleLevel === ServerRole.System.SuperAdmin,
    }]
  }

  getCarSalesActions(): ActionsItem[] {
    return [{
      label: 'Создать клиента',
      icon: 'pi pi-fw pi-money-bill',
      // routerLink: 'roles',
      handler: () => {
        this.clientService.getClientFields().subscribe(result => {
          const ref = this.dialogService.open(CreateClientComponent, {
            data: {
              fieldConfigs: result
            },
            header: 'Новый клиент',
            width: '70%'
          });
        })
      },
      visible: () => this.user?.customRoleName === ServerRole.Custom.carSales
                  || this.user?.customRoleName === ServerRole.Custom.carSalesChief
                  || this.user?.roleLevel === ServerRole.System.SuperAdmin,
    }, {
      label: 'Автомобили в продаже',
      icon: 'pi pi-fw pi-money-bill',
      routerLink: 'cars',
      visible: () => this.user?.customRoleName === ServerRole.Custom.carSales
                  || this.user?.customRoleName === ServerRole.Custom.carSalesChief
                  || this.user?.roleLevel === ServerRole.System.SuperAdmin,
    }, {
      label: 'База клиентов',
      icon: 'pi pi-fw pi-money-bill',
      routerLink: 'clients',
      visible: () => this.user?.customRoleName === ServerRole.Custom.carSales
                  || this.user?.customRoleName === ServerRole.Custom.carSalesChief
                  || this.user?.roleLevel === ServerRole.System.SuperAdmin,
    }]
  }
}
