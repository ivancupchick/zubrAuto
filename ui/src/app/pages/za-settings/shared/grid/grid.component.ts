import { CommonModule, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { MenuItem, SortEvent } from 'primeng/api';
import { ContextMenuModule } from 'primeng/contextmenu';
import { TableModule } from 'primeng/table';
import { GridActionConfigItem, GridConfigItem, getGridFieldsCompare } from './grid';

@Component({
  selector: 'za-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ContextMenuModule,
  ]
})
export class GridComponent<GridItemType extends { id: number }> implements OnInit {
  @Input() gridConfig!: GridConfigItem<GridItemType>[];
  @Input() actions!: GridActionConfigItem<GridItemType>[];
  @Input() selected: GridItemType[] = [];
  @Input() checkboxMode = false;
  @Input() selectionMode = '';
  @Input() getColorConfig: ((item: GridItemType) => string) | undefined;
  @Input() getTooltipConfig: ((item: GridItemType) => string) | undefined;
  @Input() fixedHeight: number = 0;
  @Input() set gridData(value: GridItemType[]) {
    if (Array.isArray(value)) {
      this._gridData = value;
      const scrollHeight = this.elem.nativeElement.offsetHeight  - 100;
      this.scrollHeight = this.fixedHeight || (scrollHeight > 0 ? scrollHeight : 300);
    }
  }
  @Input() virtualScroll = true;
  @Input() doubleClickFuction: ((item: GridItemType) => void) | undefined;

  get gridData(): GridItemType[] {
    return this._gridData;
  }

  @Output() onSelectEntity = new EventEmitter<GridItemType[]>();

  contextSelectedItem!: GridItemType;
  contextActions: MenuItem[] = [];
  selectedKeys!: GridItemType[];
  scrollHeight: number = 0;
  private _gridData: GridItemType[] = [];

  constructor(private elem: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.selectedKeys = [...this.selected];
    this.updateActions();
  }

  rowDoubleClick(item: GridItemType) {
    this.doubleClickFuction && this.doubleClickFuction(item)
  }

  onSelect(c: any) {
    if (this.selectionMode !== 'multiple' && this.selectionMode !== 'single') {
      return;
    }

    let selected = this.selectionMode === 'multiple'
      ? this.selectedKeys || []
      : [this.selectedKeys as any].filter(r => !!r)

    this.onSelectEntity.emit(selected);
  }

  customSort(event: SortEvent) {
    const fieldName = event.field;
    const gridConfig = this.gridConfig.find(gd => gd.name === fieldName);

    if (!event.order || !fieldName || !gridConfig || !event.data) {
      console.error('sorting not working on this field')
      return;
    }

    this.gridData = [...this.gridData.sort(
      getGridFieldsCompare(gridConfig, event)
    )];
  }

  onShow(e: any) {
    this.updateActions();
  }

  updateActions() {
    this.contextActions = this.actions.map((action) => {
      const updatedAction = action.updater ? action.updater(action, this.contextSelectedItem) : action;

      return {
        label: updatedAction.title,
        icon: `pi pi-fw pi-${updatedAction.icon}`,
        command: (e: { originalEvent: PointerEvent; item: MenuItem }) =>
          updatedAction.handler(this.contextSelectedItem),
        disabled:
          !!updatedAction.disabled && updatedAction.disabled(this.contextSelectedItem),
      };
    });
  }
}
