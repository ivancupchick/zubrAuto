import { Injectable } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { StringHash } from 'src/app/entities/constants';
import { ServerRole } from 'src/app/entities/role';
import { ClientService } from 'src/app/services/client/client.service';
import { SessionService } from 'src/app/services/session/session.service';
import { CreateCallBaseComponent } from '../modals/create-call-base/create-call-base.component';
import { CreateClientComponent } from '../modals/create-client/create-client.component';
import { SignUpComponent } from '../modals/modals-auth/sign-up/sign-up.component';
import { QueryCarTypes } from '../settings-cars/settings-cars.component';

export interface ActionsItem {
  label: string,
  icon: string,
  routerLink?: string,
  queryParams?: StringHash,
  handler?: () => void,
  visible?: () => boolean,
}

@Injectable()
export class ActionsService {
  selectedRole: ServerRole.Custom | ServerRole.System.SuperAdmin | ServerRole.System.Admin = ServerRole.System.Admin;

  constructor(private sessionService: SessionService, private dialogService: DialogService, private clientService: ClientService) {}

  getActions(): ActionsItem[] {
    return [
      this.getCarSettingsPageRoutingAction(),
      this.getFieldPageRoutingAction(),
      this.getClientSettingsPageRoutingAction(),
      this.getUserSettingsPageRoutingAction(),
      this.getRoleSettingsPageRoutingAction(),
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
      visible: () => (this.user?.roleLevel === ServerRole.System.Admin || this.user?.roleLevel === ServerRole.System.SuperAdmin) && this.selectedRole === ServerRole.System.Admin,
    }
  }

  getFieldPageRoutingAction(): ActionsItem {
    return {
      label: 'Настройка филдов',
      icon: 'pi pi-fw pi-align-left',
      routerLink: 'fields',
      visible: () => (this.user?.roleLevel === ServerRole.System.Admin || this.user?.roleLevel === ServerRole.System.SuperAdmin) && this.selectedRole === ServerRole.System.Admin,
    }
  }

  getClientSettingsPageRoutingAction() {
    return {
      label: 'База клиентов',
      icon: 'pi pi-fw pi-users',
      routerLink: 'clients',
      visible: () => (this.user?.roleLevel === ServerRole.System.Admin || this.user?.roleLevel === ServerRole.System.SuperAdmin) && this.selectedRole === ServerRole.System.Admin,
    }
  }

  getUserSettingsPageRoutingAction() {
    return {
      label: 'Пользователи',
      icon: 'pi pi-fw pi-user-plus',
      routerLink: 'users',
      visible: () => (this.user?.roleLevel === ServerRole.System.Admin || this.user?.roleLevel === ServerRole.System.SuperAdmin) && this.selectedRole === ServerRole.System.Admin,
    }
  }

  getRoleSettingsPageRoutingAction() {
    return {
      label: 'Роли',
      icon: 'pi pi-fw pi-users',
      routerLink: 'roles',
      visible: () => (this.user?.roleLevel === ServerRole.System.Admin || this.user?.roleLevel === ServerRole.System.SuperAdmin) && this.selectedRole === ServerRole.System.Admin,
    }
  }

  getContactServiceActions(): ActionsItem[] {
    return [{
      label: 'Моя база обзвона',
      icon: 'pi pi-fw pi-mobile',
      routerLink: `cars`,
      queryParams: { type: QueryCarTypes.myCallBase },
      visible: () => this.user?.customRoleName === ServerRole.Custom.contactCenter
                  || this.user?.customRoleName === ServerRole.Custom.contactCenterChief
                  || (
                    (this.user?.roleLevel === ServerRole.System.Admin || this.user?.roleLevel === ServerRole.System.SuperAdmin) &&
                    (
                        this.selectedRole === ServerRole.Custom.contactCenter
                      || this.selectedRole === ServerRole.Custom.contactCenterChief
                    )
                  ),
    }, {
      label: 'Добавить базу обзвона',
      icon: 'pi pi-fw pi-mobile',
      // routerLink: 'roles',
      handler: () => {
        const ref = this.dialogService.open(CreateCallBaseComponent, {
          header: 'Добавить базу обзвона',
          width: '40%'
        });
      },
      visible: () => this.user?.customRoleName === ServerRole.Custom.contactCenterChief
                  || (
                    (this.user?.roleLevel === ServerRole.System.Admin || this.user?.roleLevel === ServerRole.System.SuperAdmin) &&
                    (
                        this.selectedRole === ServerRole.Custom.contactCenterChief
                    )
                  ),
    }, {
      label: 'Вся база обзвона',
      icon: 'pi pi-fw pi-mobile',
      routerLink: 'cars',
      queryParams: { type: QueryCarTypes.allCallBase },
      visible: () => this.user?.customRoleName === ServerRole.Custom.contactCenterChief
                  || (
                    (this.user?.roleLevel === ServerRole.System.Admin || this.user?.roleLevel === ServerRole.System.SuperAdmin) &&
                    (
                        this.selectedRole === ServerRole.Custom.contactCenterChief
                    )
                  ),
    }]
  }

  getCarShootingActions(): ActionsItem[] {
    return [{
      label: 'Моя база съёмок',
      icon: 'pi pi-fw pi-camera',
      routerLink: 'cars',
      queryParams: { type: QueryCarTypes.myShootingBase },
      visible: () => this.user?.customRoleName === ServerRole.Custom.carShooting
                  || this.user?.customRoleName === ServerRole.Custom.carShootingChief
                  || (
                    (this.user?.roleLevel === ServerRole.System.Admin || this.user?.roleLevel === ServerRole.System.SuperAdmin) &&
                    (
                        this.selectedRole === ServerRole.Custom.carShooting
                      || this.selectedRole === ServerRole.Custom.carShootingChief
                    )
                  ),
    }, {
      label: 'Создать Анкету',
      icon: 'pi pi-fw pi-camera',
      routerLink: 'new-worksheet',
      visible: () => this.user?.customRoleName === ServerRole.Custom.carShooting
                  || this.user?.customRoleName === ServerRole.Custom.carShootingChief
                  || (
                    (this.user?.roleLevel === ServerRole.System.Admin || this.user?.roleLevel === ServerRole.System.SuperAdmin) &&
                    (
                        this.selectedRole === ServerRole.Custom.carShooting
                      || this.selectedRole === ServerRole.Custom.carShootingChief
                    )
                  ),
    }]
  }

  getCustomerServiceActions(): ActionsItem[] {
    return [{
      label: 'База съёмок',
      icon: 'pi pi-fw pi-th-large',
      routerLink: 'cars',
      queryParams: { type: QueryCarTypes.allShootingBase },
      visible: () => this.user?.customRoleName === ServerRole.Custom.customerService
                  || this.user?.customRoleName === ServerRole.Custom.customerServiceChief
                  || (
                    (this.user?.roleLevel === ServerRole.System.Admin || this.user?.roleLevel === ServerRole.System.SuperAdmin) &&
                    (
                        this.selectedRole === ServerRole.Custom.customerService
                      || this.selectedRole === ServerRole.Custom.customerServiceChief
                    )
                  ),
    }, {
      label: 'База клиентов',
      icon: 'pi pi-fw pi-th-large',
      routerLink: 'clients',
      visible: () => this.user?.customRoleName === ServerRole.Custom.customerService
                  || this.user?.customRoleName === ServerRole.Custom.customerServiceChief
                  || (
                    (this.user?.roleLevel === ServerRole.System.Admin || this.user?.roleLevel === ServerRole.System.SuperAdmin) &&
                    (
                        this.selectedRole === ServerRole.Custom.customerService
                      || this.selectedRole === ServerRole.Custom.customerServiceChief
                    )
                  ),
    }]
  }

  getCarSalesActions(): ActionsItem[] {
    return [{
      label: 'Создать клиента',
      icon: 'pi pi-fw pi-money-bill',
      // routerLink: 'roles',
      handler: () => {
        // TODO: globalLoading = true;
        this.clientService.getClientFields().subscribe(result => {
          // TODO: globalLoading = false;
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
                  || (
                    (this.user?.roleLevel === ServerRole.System.Admin || this.user?.roleLevel === ServerRole.System.SuperAdmin) &&
                    (
                        this.selectedRole === ServerRole.Custom.carSales
                      || this.selectedRole === ServerRole.Custom.carSalesChief
                    )
                  ),
    }, {
      label: 'Автомобили в продаже',
      icon: 'pi pi-fw pi-money-bill',
      routerLink: 'cars',
      queryParams: { type: QueryCarTypes.carsForSale },
      visible: () => this.user?.customRoleName === ServerRole.Custom.carSales
                  || this.user?.customRoleName === ServerRole.Custom.carSalesChief
                  || (
                    (this.user?.roleLevel === ServerRole.System.Admin || this.user?.roleLevel === ServerRole.System.SuperAdmin) &&
                    (
                        this.selectedRole === ServerRole.Custom.carSales
                      || this.selectedRole === ServerRole.Custom.carSalesChief
                    )
                  ),
    }, {
      label: 'База клиентов',
      icon: 'pi pi-fw pi-money-bill',
      routerLink: 'clients',
      visible: () => this.user?.customRoleName === ServerRole.Custom.carSales
                  || this.user?.customRoleName === ServerRole.Custom.carSalesChief
                  || (
                    (this.user?.roleLevel === ServerRole.System.Admin || this.user?.roleLevel === ServerRole.System.SuperAdmin) &&
                    (
                        this.selectedRole === ServerRole.Custom.carSales
                      || this.selectedRole === ServerRole.Custom.carSalesChief
                    )
                  ),
    }]
  }
}