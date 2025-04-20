import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { BaseList } from 'src/app/entities/constants';
import { ZASortDirection } from 'src/app/shared/enums/sort-direction.enum';
import { skipEmptyFilters } from 'src/app/shared/utils/form-filter.util';

export type PageableData = {
  page: number, size: number, sortOrder?: ZASortDirection, sortField?: string
}

export type FiltersData =  { // Todo make generic
  [key: string]: number | string | string[];
};

export  type CarsBaseFilters = PageableData & FiltersData;

@Injectable({
  providedIn: 'root',
})
export abstract class PageagleGridService<ResponseItemType> {
  public abstract list$: Observable<BaseList<ResponseItemType>>;
  public abstract loading$: Observable<boolean>;

  protected payload: CarsBaseFilters = {
    page: 1,
    size: 10,
  };

  public abstract fetchData(): void;

  public updatePage(filters: PageableData): void {
    const payload: any = {
      ...this.payload,
      ...skipEmptyFilters(filters),
    };

    this.payload = payload;

    this.fetchData();
  }

  public updateFilters(filters: FiltersData): void {
    const { page, size, sortOrder, sortField } = this.payload;

    this.payload = {
      page, size, sortOrder, sortField,
      ...skipEmptyFilters(filters),
    };

    this.fetchData();
  }
}
