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

  selectedRole: ServerRole.Custom | ServerRole.System.SuperAdmin | ServerRole.System.Admin = ServerRole.System.Admin;

  destroyed = new Subject();

  constructor(
    private dialogService: DialogService,
    public sessionService: SessionService,
    private actionsService: ActionsService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
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
}
