import { Component, Input, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { StringHash } from 'src/app/entities/constants';
import {
  FieldDomains,
  getAccessName,
  getDomainName,
} from 'src/app/entities/field';
import { AccessChip } from 'src/app/entities/fieldAccess';
import { ServerRole } from 'src/app/entities/role';
import { settingsUsersStrings } from '../../settings-users/settings-users.strings';
import { GridActionConfigItem } from '../../shared/grid/grid';

interface IAccessSource {
  name: string;
  id: number;
  // sourceName: string;
  // sourceId: number;
  // domainName: string;
  // domain: FieldDomains
}

interface IAccess {
  accessBit: number;
  accessName: string;
}

interface GridItemType {
  id: number;
  sourceId: number;
  access: number;
}

@Component({
  selector: 'za-select-access',
  templateUrl: './select-access.component.html',
  styleUrls: ['./select-access.component.scss'],
})
export class SelectAccessComponent implements OnInit {
  loading = false;

  @Input() accesses: AccessChip[] = [];
  @Input() roles: ServerRole.Response[] = [];

  selectedSources: number[] = [];

  availableAccessSources: IAccessSource[] = [];

  availableAccesses: IAccess[] = [
    {
      accessBit: 1,
      accessName: 'Не видит',
    },
    {
      accessBit: 2,
      accessName: 'Редактирование',
    },
  ];

  gridData: GridItemType[] = [];
  gridActions: GridActionConfigItem<GridItemType>[] = [
    {
      title: 'Удалить',
      icon: 'times',
      buttonClass: 'danger',
      // disabled: () => this.carFieldConfigs.length === 0,
      handler: (item: GridItemType) => this.deleteItem(item),
    },
  ];

  formValid = true;

  actions: MenuItem[] = [
    {
      label: 'Добавить доступ',
      icon: 'pi pi-fw pi-plus',
      command: () => {
        const id =
          this.roles.find((role) => !this.selectedSources.includes(role.id))
            ?.id || 0;
        this.gridData.push({
          id: id,
          sourceId: id,
          access: 1,
        });

        this.onChangeRoleDropdown();
      },
    },
  ];

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
  ) {}

  ngOnInit(): void {
    this.accesses = [...this.config.data.accesses];
    this.roles = [...this.config.data.roles];

    this.availableAccessSources = this.convertRolesToSource(this.roles);

    this.gridData = this.accesses
      .map((access) => ({
        id: access.sourceId,
        sourceId: access.sourceId,
        access: access.access,
      }))
      .filter((access) => access.access !== 0);
  }

  convertRolesToSource(roles: ServerRole.Response[]): IAccessSource[] {
    return roles.map((role) => ({
      name: `${getDomainName(FieldDomains.Role)} - ${this.getRoleName(role.systemName)}`,
      id: role.id,
      // sourceName: this.getRoleName(role.systemName),
      // sourceId: role.id,
      // domainName: getDomainName(FieldDomains.Role),
      // domain: FieldDomains.Role
    }));
  }

  save() {
    const result: (AccessChip | null)[] = this.gridData.map((gd) => {
      const role = this.roles.find((r) => r.id === gd.sourceId);

      if (!role) {
        return null;
      }

      return {
        domainName: getDomainName(FieldDomains.Role),
        sourceName: this.getRoleName(role.systemName),
        accessName: getAccessName(gd.access),
        access: gd.access,
        domain: FieldDomains.Role,
        sourceId: role.id,
      };
    });

    this.ref.close(result.filter((r) => !!r));
  }

  cancel() {
    this.ref.close([]);
  }

  getRoleName(systemName: string) {
    if ((settingsUsersStrings as StringHash)[systemName]) {
      return (
        (settingsUsersStrings as StringHash)[systemName] || 'Default Title'
      );
    }

    return systemName;
  }

  deleteItem(item: GridItemType) {
    this.gridData = this.gridData.filter((gd) => gd.sourceId !== item.sourceId);
    this.onChangeRoleDropdown();
  }

  onChangeRoleDropdown() {
    this.selectedSources = this.availableAccessSources
      .filter((aas) => this.gridData.find((d) => d.sourceId === aas.id))
      .map((aas) => aas.id);
  }

  getAvailableAccesses(sourceId: number) {
    return this.availableAccessSources.filter(
      (aas) => aas.id === sourceId || !this.selectedSources.includes(aas.id),
    );
  }
}
