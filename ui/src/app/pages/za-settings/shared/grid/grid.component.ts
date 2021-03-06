import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MenuItem, SortEvent } from 'primeng/api';
import { FieldsUtils } from 'src/app/entities/field';

export interface GridConfigItem<GridItemType extends { id: number }> {
  title: string;
  name: string;
  getValue: ((item: GridItemType) => string | number);
  available?: () => boolean;
  sortable?: () => boolean; // TODO!
}

export interface GridActionConfigItem<GridItemType extends { id: number }> {
  title: string;
  icon: string;
  buttonClass: string;
  disabled?: (item: GridItemType) => boolean;
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
  @Input() getColorConfig: ((item: GridItemType) => string) | undefined;

  contextSelectedItem!: GridItemType;
  contextActions: MenuItem[] = []

  @Output() onSelectEntity = new EventEmitter<GridItemType[]>();

  selectedKeys!: GridItemType[];

  constructor() { }

  ngOnInit(): void {
    this.selectedKeys = [...this.selected];

    this.updateActions();
  }

  onSelect(c: any) {
    this.onSelectEntity.emit(this.selectedKeys);
  }

  customSort(event: SortEvent) {
    const fieldName = event.field;
    const gridConfig = this.gridConfig.find(gd => gd.name === fieldName)

    if (!event.order || !fieldName || !gridConfig || !event.data) {
      console.error('sorting not working on this field')
      return;
    }

    (event.data as GridItemType[]).sort((data1, data2) => {
        let value1 = gridConfig.getValue(data1);
        let value2 = gridConfig.getValue(data2);

        let result = null;

        if (value1 == null && value2 != null)
            result = -1;
        else if (value1 != null && value2 == null)
            result = 1;
        else if (value1 == null && value2 == null)
            result = 0;
        else if (typeof value1 === 'string' && typeof value2 === 'string')
            result = value1.localeCompare(value2);
        else
            result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;

        return ((event.order || 0) * result);
    });
  }

  onShow(e: any) {
    this.updateActions();
  }

  updateActions() {
    this.contextActions = this.actions.map(action => ({
      label: action.title,
      icon: `pi pi-fw pi-${action.icon}`,
      command: (e: { originalEvent: PointerEvent, item: MenuItem }) => action.handler(this.contextSelectedItem),
      disabled: !!action.disabled && action.disabled(this.contextSelectedItem)
    }))
  }
}
