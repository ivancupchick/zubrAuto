import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { ServerRole } from 'src/app/entities/role';
import { RoleService } from 'src/app/services/role/role.service';
import { CreateRoleComponent } from '../modals/create-role/create-role.component';
import { GridActionConfigItem, GridConfigItem } from '../shared/grid/grid';
import { finalize, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'za-settings-roles',
  templateUrl: './settings-roles.component.html',
  styleUrls: ['./settings-roles.component.scss'],
})
export class SettingsRolesComponent implements OnInit {
  sortedRoles: ServerRole.Response[] = [];
  rawRoles: ServerRole.Response[] = [];
  loading: boolean = false;

  gridConfig!: GridConfigItem<ServerRole.Response>[];
  gridActionsConfig: GridActionConfigItem<ServerRole.Response>[] = [
    {
      title: 'Редактировать',
      icon: 'pencil',
      buttonClass: 'secondary',
      handler: (role) => this.updateRole(role),
    },
    {
      title: 'Удалить',
      icon: 'times',
      buttonClass: 'danger',
      handler: (role) => this.deleteRole(role),
    },
  ];

  constructor(
    private roleService: RoleService,
    private dialogService: DialogService,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.getRoles()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((result) => {
        this.rawRoles = result;
        this.sortRoles();
      });

    this.createGridConfig();
  }

  updateRole(role: ServerRole.Response) {
    const ref = this.dialogService.open(CreateRoleComponent, {
      data: {
        role,
      },
      header: 'Редактировать роль',
      width: '70%',
    });
  }

  createGridConfig(): void {
    this.gridConfig = [
      {
        title: 'id',
        name: 'id',
        getValue: (item) => item.id,
      },
      {
        title: 'systemName',
        name: 'systemName',
        getValue: (item) => item.systemName,
      },
      // {
      //   title: this.strings.source,
      //   name: 'source',
      //   getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Role.source),
      // }, {
      //   title: this.strings.name,
      //   name: 'name',
      //   getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Role.name),
      // }, {
      //   title: this.strings.number,
      //   name: 'number',
      //   getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Role.number),
      // }, {
      //   title: this.strings.email,
      //   name: 'email',
      //   getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Role.email),
      // }, {
      //   title: this.strings.carIds,
      //   name: 'carIds',
      //   getValue: (item) => item.carIds,
      // }, {
      //   title: this.strings.paymentType,
      //   name: 'paymentType',
      //   getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Role.paymentType),
      // }, {
      //   title: this.strings.tradeInAuto,
      //   name: 'tradeInAuto',
      //   getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Role.tradeInAuto),
      // }
    ];
  }

  deleteRole(role: ServerRole.Response) {
    this.roleService.deleteRole(role.id).subscribe((res) => {});
  }

  openNewRoleWindow() {
    const ref = this.dialogService.open(CreateRoleComponent, {
      data: {},
      header: 'Новая роль',
      width: '70%',
    });
  }

  private sortRoles() {
    this.sortedRoles = this.rawRoles;
  }

  private getRoles(): Observable<ServerRole.Response[]> {
    return this.roleService.getRoles();
  }
}
