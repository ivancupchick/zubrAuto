import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { zip } from 'rxjs';
import { FieldsUtils, ServerField } from 'src/app/entities/field';
import { StringHash } from 'src/app/entities/constants';
import { ServerRole } from 'src/app/entities/role';
import { ServerUser } from 'src/app/entities/user';
import { RoleService } from 'src/app/services/role/role.service';
import { UserService } from 'src/app/services/user/user.service';
import { CreateUserComponent } from '../modals/create-user/create-user.component';
import { GridActionConfigItem, GridConfigItem } from '../shared/grid/grid';
import { settingsUsersStrings } from './settings-users.strings';
import { finalize, map, tap } from 'rxjs/operators';
import { SessionService } from 'src/app/services/session/session.service';
import { FieldNames } from 'src/app/entities/FieldNames';

@Component({
  selector: 'za-settings-users',
  templateUrl: './settings-users.component.html',
  styleUrls: ['./settings-users.component.scss'],
  providers: [
    DialogService,
    UserService,
    RoleService
  ]
})
export class SettingsUsersComponent implements OnInit {
  readonly strings = settingsUsersStrings;

  loading = false;

  sortedUsers: ServerUser.Response[] = [];
  rawUsers: ServerUser.Response[] = [];

  gridConfig!: GridConfigItem<ServerUser.Response>[];
  gridActionsConfig: GridActionConfigItem<ServerUser.Response>[] = [{
    title: 'Редактировать',
    icon: 'pencil',
    buttonClass: 'secondary',
    disabled: (user) => {
      if (this.fieldConfigs.length === 0) {
        return true;
      }

      const customRole = this.roles.find(role => (role.id + 1000) === user.roleLevel);

      return !(this.sessionService.isAdminOrHigher || (this.sessionService.isContactCenterChief && customRole?.systemName === ServerRole.Custom.contactCenter));
    },
    handler: (user) => this.updateUser(user)
  }, {
    title: 'Удалить',
    icon: 'times',
    buttonClass: 'danger',
    handler: (user) => this.deleteUser(user),
    disabled: (user) => {
      const customRole = this.roles.find(role => (role.id + 1000) === user.roleLevel);

      return !(this.sessionService.isAdminOrHigher || (this.sessionService.isContactCenterChief && customRole?.systemName === ServerRole.Custom.contactCenter));
    },
  }]

  fieldConfigs: ServerField.Response[] = [];
  roles: ServerRole.Response[] = [];

  // readonly strings = settingsUsersStrings;

  constructor(private userService: UserService, private dialogService: DialogService, private roleService: RoleService, private sessionService: SessionService) { }

  ngOnInit(): void {
    zip(this.userService.getUserFields(), this.roleService.getRoles())
      .subscribe(([fieldConfigs, roles]) => {
        this.fieldConfigs = fieldConfigs;
        this.roles = roles;
        this.getUsers().subscribe();
      })

    // this.getUsers().subscribe();

    this.gridConfig = [{
      title: 'id',
      name: 'id',
      getValue: (item) => item.id,
    }, {
      title: this.strings.name,
      name: FieldNames.User.name,
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.User.name),
    }, {
      title: this.strings.callRequestSources,
      name: FieldNames.User.callRequestSources,
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.User.callRequestSources),
    }, {
      title: this.strings.number,
      name: FieldNames.User.number,
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.User.number),
    }, {
      title: 'Электронная почта',
      name: 'email',
      getValue: (item) => item.email,
    }, {
      title: 'Роль',
      name: 'role',
      getValue: (item) => this.getRoleName(item.roleLevel),
    }, {
      title: 'Активирован',
      name: 'isActivated',
      getValue: (item) => item.isActivated ? 'Да' : 'Нет',
    }];
  }

  updateUser(user: ServerUser.Response) {
    const ref = this.dialogService.open(CreateUserComponent, {
      data: {
        user,
        fieldConfigs: this.fieldConfigs,
        roles: this.roles
      },
      header: 'Редактировать пользователя',
      width: '70%'
    });

    ref.onClose.subscribe(res => {
      if (res) {
        this.getUsers().subscribe();
      }
    })
  }

  deleteUser(user: ServerUser.Response) {
    this.userService.deleteUser(user.id)
      .subscribe(res => {
        if (res) {
          this.getUsers().subscribe();
        }
      });
  }

  private sortUsers() {
    this.sortedUsers = this.rawUsers;
  }

  private getUsers() {
    this.loading = true;
    return this.userService.getUsers().pipe(
      finalize(() => this.loading = false),
      map(result => result.list),
      tap((result) => {
        result = result.filter((u: { deleted: string | number; }) => +u.deleted === 0);
        const contactCenterRole = this.roles.find(cr => cr.systemName === ServerRole.Custom.contactCenter)!;

        this.rawUsers = this.sessionService.isContactCenterChief
          ? result.filter((user: { roleLevel: any; }) => user.roleLevel === contactCenterRole.id + 1000)
          : result;
        this.sortUsers();
      })
    )
  }

  openNewUserWindow() {
    const ref = this.dialogService.open(CreateUserComponent, {
      data: {
        fieldConfigs: this.fieldConfigs,
        roles: this.roles
      },
      header: 'Новый пользователь',
      width: '70%'
    });

    ref.onClose.subscribe(res => {
      if (res) {
        this.getUsers().subscribe();
      }
    })
  }

  getRoleName(roleLevel: number): string {
    switch (roleLevel) {
      case ServerRole.System.SuperAdmin: return 'Супер Админ';
      case ServerRole.System.Admin: return 'Админ';
      case ServerRole.System.None: return 'Не назначена';
    }

    const customRole = this.roles.find(role => (role.id + 1000) === roleLevel);

    if (customRole) {
      return (settingsUsersStrings as StringHash)[customRole.systemName] || `${roleLevel}`;
    }

    return `${roleLevel}`;
  }
}
