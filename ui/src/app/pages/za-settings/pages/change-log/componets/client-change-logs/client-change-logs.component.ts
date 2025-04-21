import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ContextMenuModule } from 'primeng/contextmenu';
import { Subject, finalize, takeUntil } from 'rxjs';
import { ChangeLogDataService } from '../../services/change-log-data.service';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ChangeLogItem } from '../../interfaces/change-log';
import { CommonModule } from '@angular/common';
import { FieldNames } from 'src/app/entities/FieldNames';
import { settingsClientsStrings } from 'src/app/pages/za-settings/settings-clients/settings-clients.strings';
import { ServerClient } from 'src/app/entities/client';
import { FieldType, FieldsUtils, ServerField } from 'src/app/entities/field';
import { DBModels, StringHash } from 'src/app/entities/constants';
import { ServerUser } from 'src/app/entities/user';
import { DateUtils } from 'src/app/shared/utils/date.util';
import { settingsCarsStrings } from 'src/app/pages/za-settings/settings-cars/settings-cars.strings';

@Component({
  selector: 'za-client-change-logs',
  templateUrl: './client-change-logs.component.html',
  styleUrls: ['./client-change-logs.component.scss'],
  standalone: true,
  imports: [TableModule, TooltipModule, ContextMenuModule, CommonModule],
  providers: [ChangeLogDataService],
})
export class ClientChangeLogsComponent implements OnInit, OnDestroy {
  loading = false;
  @Input() itemId: number;
  @Input() sourceName: DBModels.Table;
  @Input() allUsers: ServerUser.Response[] = [];

  @Input() fieldConfigVariants: {
    [key: string]: {
      variants: string;
      type: FieldType;
    };
  } = {};
  set gridData(value: (string | null)[][]) {
    if (Array.isArray(value)) {
      this._gridData = value;
    } else {
      this._gridData = [];
    }
  }
  get gridData() {
    return this._gridData;
  }
  private _gridData: (string | null)[][] = [];

  private rows: {
    title: string;
    name: string;
  }[] = [];

  tableHeader: {
    title: string;
    tooltip: string;
  }[] = [];

  destroy$ = new Subject();

  constructor(
    private changeLogDataService: ChangeLogDataService,
    private config: DynamicDialogConfig,
  ) {
    this.itemId = this.config?.data?.itemId;
    this.allUsers = this.config?.data?.allUsers;
    this.sourceName = this.config?.data?.sourceName;
    this.fieldConfigVariants = (
      this.config?.data?.fieldConfigs as ServerField.Response[]
    ).reduce(
      (prev, cur) => ({
        ...prev,
        [cur.name]: {
          variants: cur.variants,
          type: cur.type,
        },
      }),
      {},
    );
  }

  ngOnInit(): void {
    const rowsByEntity: StringHash<StringHash> = {
      [DBModels.Table.Clients]: FieldNames.Client,
      [DBModels.Table.Users]: FieldNames.User,
      [DBModels.Table.Cars]: FieldNames.Car,
      [DBModels.Table.CallRequests]: {},
    };

    this.rows = Object.values(rowsByEntity[this.sourceName]).map((name) => ({
      title: settingsClientsStrings[name] || settingsCarsStrings[name] || name,
      name: name,
    }));

    this.fetchData();
  }

  // contextSelectedItem: any;

  fetchData(): void {
    this.loading = true;

    this.changeLogDataService
      .fetchChangeLogsById({
        size: 100000,
        page: 1,
        sourceName: this.sourceName,
        sourceId: this.itemId,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((data) => {
        this.convertClientActivities(data.list);
      });
  }

  convertClientActivities(logs: ChangeLogItem[]): void {
    const originalRequest: {
      request: {
        params: StringHash;
        body: ServerClient.UpdateRequest | ServerClient.CreateRequest;
      };
    }[] = logs.map((d) => {
      try {
        const activities = this.matchQuetes(d.activities.replace(/\n/g, '/n'));

        const obj = JSON.parse(activities);

        return this.replaceEnterChar(obj);
      } catch (e) {
        console.error(e);
        return {};
      }
    });

    this.tableHeader = logs.map((log) => {
      const user = this.allUsers.find((u) => +u.id === log.userId)!;

      const userName = FieldsUtils.getFieldValue(user, FieldNames.User.name);
      const userShortName = (userName || '')
        .split(' ')
        .map((word) => word[0])
        .join('');

      return {
        title: `${userShortName} <b>${log.type}</b><br> ${DateUtils.getFormatedDateTime(+log.date.toString())}`,
        tooltip: `${userName}, ${user.email}`,
      };
    });

    const collumnedGridData = [
      this.rows.map((row) => row.title),
      ...originalRequest.map((log) =>
        this.createRowByChangeLog(log.request?.body),
      ),
    ];

    const gridData: (string | null)[][] = [];

    collumnedGridData[0].forEach((columnName, columnIndex) => {
      gridData.push([columnName]);
      collumnedGridData.forEach((row, rowIndex) => {
        if (rowIndex > 0) {
          gridData[gridData.length - 1].push(row[columnIndex]);
        }
      });
    });

    gridData.forEach((row, rowIndex) => {
      const indexes: any[] = [];
      row.forEach((value, valueIndex) => {
        if (
          (valueIndex > 1 && value === row[valueIndex - 1]) ||
          (row[valueIndex - 1] === null && value === '')
        ) {
          indexes.push(valueIndex);
        }
      });
      indexes.forEach((el, elIndex) => {
        row[el] = null;
      });
    });

    this.gridData = gridData;
  }

  createRowByChangeLog(
    log: ServerClient.UpdateRequest | ServerClient.CreateRequest,
  ): (string | null)[] {
    if (log?.fields) {
      const fields =
        log?.fields.map((field) => ({
          ...field,
          variants: this.fieldConfigVariants[field.name]?.variants,
          type: this.fieldConfigVariants[field.name]?.type,
        })) || [];

      return this.rows.map((row) => this.getFieldValue(fields, row.name));
    }

    return [];
  }

  getFieldValue(
    fields: {
      variants: string;
      type: FieldType;
      id: number;
      name: string;
      value: string;
    }[],
    fieldName: string,
  ) {
    const field = FieldsUtils.getField(fields, fieldName)!;

    if (!field) {
      return null;
    }

    if (field?.type === FieldType.Dropdown) {
      return FieldsUtils.getDropdownValue(fields, fieldName);
    }

    if (
      [
        'date',
        FieldNames.Client.dateNextAction,
        FieldNames.Client.saleDate,
      ].includes(fieldName) ||
      field?.type === FieldType.Date
    ) {
      return DateUtils.getFormatedDateTime(+field.value);
    }

    return FieldsUtils.getFieldValue(fields, fieldName);
  }

  replaceEnterChar(obj: any) {
    if (typeof obj === 'string') {
      return obj.replace(/\/n/g, '\n');
    } else {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          obj[key] = this.replaceEnterChar(obj[key]);
        }
      }

      return obj;
    }
  }

  matchQuetes(activities: string) {
    const match = activities.match(
      /(description\"\,\"value\"\:\").*?[^{,:\\](")[^}:,].*?(?=\"\})/gi,
    );

    if (match?.length) {
      const matchOriginal = match[0].replace(`description","value":"`, '');
      const matchFixed = matchOriginal.replace(/"/g, '\\"');

      return activities.replace(matchOriginal, matchFixed);
    } else {
      return activities;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
  }
}
