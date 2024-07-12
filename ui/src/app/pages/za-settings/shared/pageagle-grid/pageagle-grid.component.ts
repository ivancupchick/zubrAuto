import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GridActionConfigItem, GridConfigItem, gridItemHeight } from '../grid/grid';
import { LazyLoadEvent, MenuItem, SortEvent } from 'primeng/api';
import { PageagleGridService } from './pageagle-grid.service';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { ContextMenuModule } from 'primeng/contextmenu';
import { SpinnerComponent } from 'src/app/shared/components/spinner/spinner.component';
import { SortDirection, SortEventDirection } from 'src/app/shared/enums/sort-direction.enum';

enum SelectedCategories {
  clients = 'Клиентам',
  cars = 'Машинам',
  users = 'Пользователям',
  callRequests = 'Колл-запросам',
  other = 'другим категориям',
}

@Component({
  selector: 'za-pageagle-grid',
  templateUrl: './pageagle-grid.component.html',
  styleUrls: ['./pageagle-grid.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TooltipModule,
    ContextMenuModule,
    SpinnerComponent
  ]
})
export class PageagleGridComponent<GridItemType extends { id: number, sourceName: string; }> implements OnInit {
  @Input() gridConfig!: GridConfigItem<GridItemType>[];
  @Input() actions!: GridActionConfigItem<GridItemType>[];
  @Input() selected: GridItemType[] = [];
  @Input() checkboxMode = false;
  @Input() selectionMode = '';
  @Input() sortField = '';
  @Input() getColorConfig: ((item: GridItemType) => string) | undefined;
  @Input() getTooltipConfig: ((item: GridItemType) => string) | undefined;
  @Input() dataService!: PageagleGridService<GridItemType>;
  @Input() doubleClickFuction: ((item: GridItemType) => void) | undefined;

  // @Input() set gridData(value: GridItemType[]) {
  //   if (Array.isArray(value)) {
  //     this._gridData = value;
  //   } else {
  //     this._gridData = [];
  //   }
  // }

  // get gridData(): GridItemType[] {
  //   return this._gridData;
  // }

  gridItemHeight = gridItemHeight;
  size = 10;

  @Output() onSelectEntity = new EventEmitter<GridItemType[]>();

  contextSelectedItem!: GridItemType;
  contextActions: MenuItem[] = [];
  selectedKeys!: GridItemType[];
  selectedCategory: string = '';
  // private _gridData: GridItemType[] = [];

  constructor(private elem: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.selectedKeys = [...this.selected];
    this.updateActions();

    this.size = Math.floor(this.elem.nativeElement.offsetHeight / gridItemHeight);
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

    // this.gridData = [...this.gridData.sort(
    //   getGridFieldsCompare(gridConfig, event)
    // )];
  }

  onShow(e: any) {
    let selectedCategory = this.contextSelectedItem.sourceName;
    switch (selectedCategory) {
      case 'clients':
        this.selectedCategory = SelectedCategories.clients.toLocaleLowerCase();
        break;
      case 'users':
        this.selectedCategory = SelectedCategories.users.toLocaleLowerCase();
        break;
      case 'cars':
        this.selectedCategory = SelectedCategories.cars.toLocaleLowerCase();
        break;
      case 'callRequests':
        this.selectedCategory = SelectedCategories.callRequests.toLocaleLowerCase();
        break;
      default:
        this.selectedCategory = SelectedCategories.other.toLocaleLowerCase();
    }
    this.updateActions();
  }

  updateActions() {
    this.contextActions = this.actions.map(action => ({
      label: `${action.title} по ${this.selectedCategory}`,
      icon: `pi pi-fw pi-${action.icon}`,
      command: (e: { originalEvent: PointerEvent, item: MenuItem }) => action.handler(this.contextSelectedItem),
      disabled: !!action.disabled && action.disabled(this.contextSelectedItem)
    }))
  }

  // fetchData(event: LazyLoadEvent) {

  // }

  updatePage(event: LazyLoadEvent) {
    const sortOrder: SortDirection | undefined = event.sortOrder && SortEventDirection[event.sortOrder] || undefined;
    const sortField = event.sortField || undefined;

    this.dataService.updatePage({ size: event.rows!, page: (event.first! + event.rows!) / event.rows!, sortField, sortOrder });
      // .pipe(
      //   finalize(() => this.loading = false)
      // ).subscribe(data => {
      //   this.gridData = data.list;
      //   this.totalRecords = data.total;
      // });
  }
}
