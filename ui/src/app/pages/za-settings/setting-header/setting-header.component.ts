import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {MenuItem} from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ServerUser } from 'src/app/entities/user';
import { SessionService } from 'src/app/services/session/session.service';
import { LoginComponent } from '../modals/modals-auth/login/login.component';
import { SignUpComponent } from '../modals/modals-auth/sign-up/sign-up.component';

const menuItems : MenuItem[]  = [
  // {
  //   label: 'Машины',
  //   items: [{
  //       label: 'Список',
  //       icon: 'pi pi-fw pi-list',
  //       // routerLink: ''
  //       // items: [
  //       //   {
  //       //     label: 'Project'
  //       //   }, {
  //       //     label: 'Other'
  //       //   },
  //       // ]
  //     },{
  //       label: 'Open'
  //     }, {
  //       label: 'Quit'
  //     }
  //   ]
  // },
  {
    label: 'База машин',
    icon: 'pi pi-fw pi-th-large',
    routerLink: 'cars'
  }, {
    label: 'Настройка филдов',
    icon: 'pi pi-fw pi-align-left',
    routerLink: 'fields'
  }, {
    label: 'База клиентов',
    icon: 'pi pi-fw pi-users',
    routerLink: 'clients'
  }, {
    label: 'Пользователи',
    icon: 'pi pi-fw pi-user-plus',
    routerLink: 'users'
  }, {
    label: 'Роли',
    icon: 'pi pi-fw pi-users',
    routerLink: 'roles'
  }
];

@Component({
  selector: 'za-setting-header',
  templateUrl: './setting-header.component.html',
  styleUrls: ['./setting-header.component.scss'],
  providers: [
    DialogService
  ]
})
export class SettingHeaderComponent implements OnInit, OnDestroy {
  @Input() user!: ServerUser.IPayload | null;

  items: MenuItem[] = [];

  destroyed = new Subject();

  constructor(private dialogService: DialogService, public sessionService: SessionService) { }

  ngOnInit(): void {
    this.sessionService.userSubj
      .pipe(
        takeUntil(this.destroyed)
      )
      .subscribe(user => {
        this.user = user;
      });
    this.items = menuItems;
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
    this.sessionService.logout().subscribe()
  }

  ngOnDestroy() {
    this.destroyed.next();
  }
}
