import { Component, Input, OnInit } from '@angular/core';

export interface GridConfigItem<GridItemType> {
  title: string;
  name: string;
  getValue: ((item: GridItemType) => string) | ((item: GridItemType) => any);
}

export interface GridActionConfigItem<GridItemType> {
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
export class GridComponent<GridItemType> implements OnInit {
  @Input() gridConfig!: GridConfigItem<GridItemType>[];
  @Input() gridData!: GridItemType[];
  @Input() actions!: GridActionConfigItem<GridItemType>[];

  constructor() { }

  ngOnInit(): void {
  }

}
