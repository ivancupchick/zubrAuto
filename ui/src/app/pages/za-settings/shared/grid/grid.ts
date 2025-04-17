import * as moment from "moment";
import { SortEvent } from "primeng/api";

export const gridItemHeight = 24;

export interface GridConfigItem<GridItemType extends { id: number }> {
  title: string;
  name: string;
  getValue: ((item: GridItemType) => string | number);
  available?: () => boolean;
  isDate?: boolean;
  sortable?: () => boolean; // TODO!
}

export interface GridActionConfigItem<GridItemType extends { id: number }> {
  title: string;
  icon: string;
  buttonClass: string;
  disabled?: (item: GridItemType) => boolean;
  available?: () => boolean;
  handler: (item: GridItemType) => void; // TODO a
  updater?: (instance: this, item: GridItemType) => this;
}

export function getGridFieldsCompare<GridItemType extends { id: number }>(gridConfig: GridConfigItem<GridItemType>, event: SortEvent) {
  return (data1: GridItemType, data2: GridItemType) => {
    const v1 = gridConfig.getValue(data1)
    const v2 = gridConfig.getValue(data2)

    let value1 = gridConfig.isDate && v1
      ? +moment(v1, 'DD.MM.YYYY HH:mm').toDate()
      : v1;
    let value2 = gridConfig.isDate && v2
      ? +moment(v2, 'DD.MM.YYYY HH:mm').toDate()
      : v2;
    let result = 1;

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
  }
}
