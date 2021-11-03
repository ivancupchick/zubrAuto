import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { zip } from 'rxjs';
import { ServerField } from 'src/app/entities/field';
import { StringHash } from 'src/app/entities/FieldNames';
import { ServerRole } from 'src/app/entities/role';
import { ServerUser } from 'src/app/entities/user';
import { RoleService } from 'src/app/services/role/role.service';
import { UserService } from 'src/app/services/user/user.service';
import { CreateUserComponent } from '../modals/create-user/create-user.component';
import { GridActionConfigItem, GridConfigItem } from '../shared/grid/grid.component';
import { settingsUsersStrings } from './settings-users.strings';

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
  sortedUsers: ServerUser.Response[] = [];
  rawUsers: ServerUser.Response[] = [];

  gridConfig!: GridConfigItem<ServerUser.Response>[];
  gridActionsConfig: GridActionConfigItem<ServerUser.Response>[] = [{
    title: '',
    icon: 'pencil',
    buttonClass: 'secondary',
    disabled: () => this.fieldConfigs.length === 0,
    handler: (user) => this.updateUser(user)
  }, {
    title: '',
    icon: 'times',
    buttonClass: 'danger',
    handler: (user) => this.deleteUser(user)
  }]

  fieldConfigs: ServerField.Response[] = [];
  roles: ServerRole.Response[] = [];

  // readonly strings = settingsUsersStrings;

  constructor(private userService: UserService, private dialogService: DialogService, private roleService: RoleService) { }

  ngOnInit(): void {
    zip(this.userService.getUserFields(), this.roleService.getRoles())
      .subscribe(([fieldConfigs, roles]) => {
        this.fieldConfigs = fieldConfigs;
        this.roles = roles;
      })

    this.userService.getUsers().subscribe((result) => {
      this.rawUsers = result;
      this.sortUsers();
    })

    this.gridConfig = [{
      title: 'id',
      name: 'id',
      getValue: (item) => item.id,
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
  }

  deleteUser(user: ServerUser.Response) {
    this.userService.deleteUser(user.id)
      .subscribe(res => {
        console.log(res);
      });
  }

  private sortUsers() {
    this.sortedUsers = this.rawUsers;
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
