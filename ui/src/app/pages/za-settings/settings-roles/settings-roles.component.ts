import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { ServerField } from 'src/app/entities/field';
import { ServerRole } from 'src/app/entities/role';
import { RoleService } from 'src/app/services/role/role.service';
import { CreateRoleComponent } from '../modals/create-role/create-role.component';
import { GridActionConfigItem, GridConfigItem } from '../shared/grid/grid.component';

@Component({
  selector: 'za-settings-roles',
  templateUrl: './settings-roles.component.html',
  styleUrls: ['./settings-roles.component.scss'],
  providers: [
    DialogService,
    RoleService
  ]
})
export class SettingsRolesComponent implements OnInit {
  sortedRoles: ServerRole.GetResponse[] = [];
  rawRoles: ServerRole.GetResponse[] = [];

  gridConfig!: GridConfigItem<ServerRole.GetResponse>[];
  gridActionsConfig: GridActionConfigItem<ServerRole.GetResponse>[] = [{
    title: '',
    icon: 'pencil',
    buttonClass: 'secondary',
    handler: (role) => this.updateRole(role)
  }, {
    title: '',
    icon: 'times',
    buttonClass: 'danger',
    handler: (role) => this.deleteRole(role)
  }]

  // readonly strings = settingsRolesStrings;

  constructor(private roleService: RoleService, private dialogService: DialogService) { }

  ngOnInit(): void {

    this.roleService.getRoles().subscribe((result) => {
      this.rawRoles = result;
      this.sortRoles();
    })

    this.gridConfig = [{
      title: 'id',
      name: 'id',
      getValue: (item) => item.id,
    }, {
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

  updateRole(role: ServerRole.GetResponse) {
    const ref = this.dialogService.open(CreateRoleComponent, {
      data: {
        role,
      },
      header: 'Редактировать роль',
      width: '70%'
    });
  }

  deleteRole(role: ServerRole.GetResponse) {
    this.roleService.deleteRole(role.id)
      .subscribe(res => {
        console.log(res);
      });
  }

  private sortRoles() {
    this.sortedRoles = this.rawRoles;
  }

  openNewRoleWindow() {
    const ref = this.dialogService.open(CreateRoleComponent, {
      data: {
        
      },
      header: 'Новая роль',
      width: '70%'
    });
  }
}
