import { Component, Input, OnInit } from '@angular/core';

export interface GridConfigItem<GridItemType extends { id: number }> {
  title: string;
  name: string;
  getValue: ((item: GridItemType) => string) | ((item: GridItemType) => any);
  available?: () => boolean;
  sortable?: () => boolean; // TODO!
}

export interface GridActionConfigItem<GridItemType extends { id: number }> {
  title?: string;
  icon: string;
  buttonClass: string;
  disabled?: () => boolean;
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

  selectedKeys!: GridItemType[];

  constructor() { }

  ngOnInit(): void {
  }

}
