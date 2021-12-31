import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MenuItem, SortEvent } from 'primeng/api';
import { FieldsUtils } from 'src/app/entities/field';

export interface GridConfigItem<GridItemType extends { id: number }> {
  title: string;
  name: string;
  getValue: ((item: GridItemType) => string) | ((item: GridItemType) => any);
  available?: () => boolean;
  sortable?: () => boolean; // TODO!
}

export interface GridActionConfigItem<GridItemType extends { id: number }> {
  title: string;
  icon: string;
  buttonClass: string;
  disabled?: () => boolean;
  available?: () => boolean;
  handler: (item: GridItemType) => void; // TODO a
}

@Component({
  selector: 'za-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent<GridItemType extends { id: number }> implements OnInit {
  @Input() gridConfig!: GridConfigItem<GridItemType>[];
  @Input() gridData!: GridItemType[];
  @Input() actions!: GridActionConfigItem<GridItemType>[];
  @Input() selected: GridItemType[] = [];
  @Input() checkboxMode = false;

  contextSelectedItem!: GridItemType;
  contextActions: MenuItem[] = []

  @Output() onSelectEntity = new EventEmitter<GridItemType[]>();

  selectedKeys!: GridItemType[];

  constructor() { }

  ngOnInit(): void {
    this.selectedKeys = [...this.selected];

    this.contextActions = this.actions.map(action => ({
      label: action.title,
      icon: `pi pi-fw pi-${action.icon}`,
      command: (e: { originalEvent: PointerEvent, item: MenuItem }) => action.handler(this.contextSelectedItem)
    }))
  }

  onSelect(c: any) {
    this.onSelectEntity.emit(this.selectedKeys);
  }

  customSort(event: SortEvent) {
    const fieldName = event.field;

    if (!event.order || !fieldName) {
      return;
    }

    (event.data as GridItemType[]).sort((data1, data2) => {
        let value1 = +(FieldsUtils.getFieldValue(data1 as any, fieldName) as string);
        let value2 = +(FieldsUtils.getFieldValue(data2 as any, fieldName) as string);
        let result = null;

        if (value1 == null && value2 != null)
            result = -1;
        else if (value1 != null && value2 == null)
            result = 1;
        else if (value1 == null && value2 == null)
            result = 0;
        // else if (typeof value1 === 'string' && typeof value2 === 'string')
        //     result = value1.localeCompare(value2);
        else
            result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;

        return ((event.order || 0) * result);
    });
  }
}
